const express = require("express");
const crypto = require("crypto");
const path = require("path");

const { getPrisma } = require("../lib/prisma");
const { getMinioClient, getRawBucket } = require("../lib/minio");
const { normalizeMinioObjectKey } = require("../utils/minioObjectKey");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/requireAuth");
const { upload } = require("../lib/upload");
const { triggerOcrPipeline } = require("../lib/airflow");
const fs = require("fs").promises;
const fsSync = require("fs");

const router = express.Router();

function parseIntParam(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildUploadedAtRange(year, month) {
  if (!year) return null;
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1970 || y > 3000) return null;

  if (!month) {
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0));
    return { gte: start, lt: end };
  }

  const m = Number(month);
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { gte: start, lt: end };
}

async function resolveDocumentTypeId(prisma, typeQuery) {
  if (!typeQuery) return null;
  const type = String(typeQuery).trim();
  if (!type) return null;

  const id = parseIntParam(type);
  if (Number.isInteger(id)) return id;

  const docType = await prisma.documentType.findFirst({
    where: { name: { equals: type, mode: "insensitive" } },
    select: { documentTypeId: true },
  });
  return docType ? docType.documentTypeId : null;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();

    const take = Math.min(Number(req.query.limit || 50), 200);
    const skip = Number(req.query.offset || 0);

    const where = {};

    // ?type=invoice (by document_types.name) or by numeric documentTypeId
    if (req.query.type) {
      const documentTypeId = await resolveDocumentTypeId(prisma, req.query.type);
      if (documentTypeId) where.documentTypeId = documentTypeId;
      else return res.json({ data: [], pagination: { limit: take, offset: skip } });
    }

    const uploadedAtRange = buildUploadedAtRange(req.query.year, req.query.month);
    if (uploadedAtRange) where.uploadedAt = uploadedAtRange;

    const docs = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take,
      skip,
      include: {
        documentType: true,
        uploader: { include: { role: true } },
      },
    });

    res.json({ data: docs, pagination: { limit: take, offset: skip } });
  }),
);

router.get(
  "/myfiles",
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const take = Math.min(Number(req.query.limit || 50), 200);
    const skip = Number(req.query.offset || 0);

    const docs = await prisma.document.findMany({
      where: { uploadedBy: req.user.userId },
      orderBy: { uploadedAt: "desc" },
      take,
      skip,
      include: {
        documentType: true,
      },
    });

    res.json({ data: docs, pagination: { limit: take, offset: skip } });
  }),
);

router.post(
  "/upload",
  requireAuth,
  upload.array("files", 20),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const minio = getMinioClient();
    const bucket = getRawBucket();

    const { documentTypeId, type } = req.body || {};
    let resolvedTypeId = documentTypeId ? Number(documentTypeId) : null;
    if (!resolvedTypeId && type) resolvedTypeId = await resolveDocumentTypeId(prisma, type);
    if (!Number.isInteger(resolvedTypeId)) {
      return res.status(400).json({ error: { message: "documentTypeId (or type) is required" } });
    }

    const docType = await prisma.documentType.findUnique({
      where: { documentTypeId: resolvedTypeId },
      select: { name: true },
    });
    if (!docType) return res.status(400).json({ error: { message: "Invalid documentTypeId" } });

    const files = req.files || [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: { message: "No files uploaded (field name must be 'files')" } });
    }

    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");

    const created = [];
    for (const f of files) {
      const originalName = f.originalname || "file";
      const ext = path.extname(originalName) || "";
      const baseName = crypto.randomUUID();
      const objectName = `${docType.name}/${yyyy}/${mm}/${baseName}${ext}`;

      await minio.putObject(bucket, objectName, f.buffer, {
        "Content-Type": f.mimetype || "application/octet-stream",
      });

      const doc = await prisma.document.create({
        data: {
          documentTypeId: resolvedTypeId,
          originalName,
          storagePath: objectName,
          uploadedBy: req.user.userId,
          status: "uploaded",
        },
        include: {
          documentType: true,
        },
      });

      const tempDir = path.join(__dirname, "../../temp_uploads");
      if (!fsSync.existsSync(tempDir)) fsSync.mkdirSync(tempDir, { recursive: true });

      const localPath = path.join(tempDir, `${baseName}${ext}`);
      await fs.writeFile(localPath, f.buffer);

      const airflowPath = `/opt/airflow/backend/temp_uploads/${baseName}${ext}`;
      try {
        await triggerOcrPipeline(airflowPath, doc.documentId);
      } catch (err) {
        console.error(`Failed to trigger DAG for ${originalName}:`, err.message);
      }

      created.push(doc);
    }

    res.status(201).json({ data: created });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const documentId = Number(req.params.id);
    if (!Number.isInteger(documentId)) return res.status(400).json({ error: { message: "Invalid id" } });

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: {
        documentType: true,
        uploader: { include: { role: true } },
        versions: {
          orderBy: [{ versionNumber: "desc" }, { extractedAt: "desc" }],
          include: {
            processor: { include: { role: true } },
            fields: {
              orderBy: { fieldId: "asc" },
              include: { validator: { include: { role: true } } },
            },
          },
        },
        companyLinks: { include: { company: true } },
      },
    });
    if (!doc) return res.status(404).json({ error: { message: "File not found" } });
    res.json({ data: doc });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const minio = getMinioClient();
    const bucket = getRawBucket();
    const documentId = Number(req.params.id);
    if (!Number.isInteger(documentId)) return res.status(400).json({ error: { message: "Invalid id" } });

    const doc = await prisma.document.findUnique({
      where: { documentId },
      select: { documentId: true, uploadedBy: true, storagePath: true },
    });
    if (!doc) return res.status(404).json({ error: { message: "File not found" } });

    // Only the uploader can delete (simple rule for now)
    if (doc.uploadedBy !== req.user.userId) {
      return res.status(403).json({ error: { message: "Forbidden" } });
    }

    const objectName = normalizeMinioObjectKey(doc.storagePath, bucket);
    if (objectName) {
      try {
        await minio.removeObject(bucket, objectName);
      } catch (e) {
        // ignore storage deletion errors to keep DB consistent; caller can retry
      }
    }

    await prisma.document.delete({ where: { documentId } });
    res.json({ data: { ok: true } });
  }),
);

router.get(
  "/download/:id",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const minio = getMinioClient();
    const bucket = getRawBucket();
    const documentId = Number(req.params.id);
    if (!Number.isInteger(documentId)) return res.status(400).json({ error: { message: "Invalid id" } });

    const doc = await prisma.document.findUnique({
      where: { documentId },
      select: { originalName: true, storagePath: true },
    });
    if (!doc) return res.status(404).json({ error: { message: "File not found" } });

    const objectName = normalizeMinioObjectKey(doc.storagePath, bucket);
    if (!objectName) return res.status(500).json({ error: { message: "Invalid storagePath for file" } });

    const filename = doc.originalName || path.basename(objectName);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    const stream = await minio.getObject(bucket, objectName);
    stream.on("error", (e) => res.destroy(e));
    stream.pipe(res);
  }),
);

module.exports = { filesRouter: router };

