const express = require("express");
const path = require("path");

const { getPrisma } = require("../lib/prisma");
const { getMinioClient, getRawBucket } = require("../lib/minio");
const { normalizeMinioObjectKey } = require("../utils/minioObjectKey");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

const fullDocumentInclude = {
  documentType: true,
  uploader: { include: { role: true } },
  versions: {
    orderBy: [{ versionNumber: "desc" }, { extractedAt: "desc" }],
    include: {
      processor: { include: { role: true } },
      fields: {
        orderBy: { fieldId: "asc" },
        include: {
          validator: { include: { role: true } },
        },
      },
    },
  },
  companyLinks: {
    include: {
      company: true,
    },
  },
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();

    const take = Math.min(Number(req.query.limit || 50), 200);
    const skip = Number(req.query.offset || 0);

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.documentTypeId) where.documentTypeId = Number(req.query.documentTypeId);

    const docs = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take,
      skip,
      include: {
        documentType: true,
        companyLinks: { include: { company: true } },
      },
    });

    res.json({ data: docs, pagination: { limit: take, offset: skip } });
  }),
);

router.get(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const documentId = Number(req.params.documentId);
    if (!Number.isInteger(documentId)) return res.status(400).json({ error: { message: "Invalid documentId" } });

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: fullDocumentInclude,
    });

    if (!doc) return res.status(404).json({ error: { message: "Document not found" } });
    res.json({ data: doc });
  }),
);

router.get(
  "/:documentId/raw-file",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const documentId = Number(req.params.documentId);
    if (!Number.isInteger(documentId)) return res.status(400).json({ error: { message: "Invalid documentId" } });

    const doc = await prisma.document.findUnique({
      where: { documentId },
      select: {
        documentId: true,
        originalName: true,
        storagePath: true,
      },
    });

    if (!doc) return res.status(404).json({ error: { message: "Document not found" } });

    const minio = getMinioClient();
    const bucket = getRawBucket();
    const objectName = normalizeMinioObjectKey(doc.storagePath, bucket);
    if (!objectName) return res.status(500).json({ error: { message: "Invalid storagePath for document" } });

    const filename = doc.originalName || path.basename(objectName);
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".pdf" ? "application/pdf" : "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    const stream = await minio.getObject(bucket, objectName);
    stream.on("error", (e) => {
      res.destroy(e);
    });
    stream.pipe(res);
  }),
);

router.post(
  "/:documentId/versions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const documentId = Number(req.params.documentId);
    if (!Number.isInteger(documentId)) {
      return res.status(400).json({ error: { message: "Invalid documentId" } });
    }

    const { fields } = req.body;
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: { message: "Missing or invalid fields array" } });
    }

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { versions: true }
    });

    if (!doc) {
      return res.status(404).json({ error: { message: "Document not found" } });
    }

    const maxVersion = doc.versions.length > 0
      ? Math.max(...doc.versions.map(v => v.versionNumber))
      : 0;

    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId,
        versionNumber: maxVersion + 1,
        processedBy: req.user.userId,
      }
    });

    // Bulk create fields for this version
    if (fields.length > 0) {
      const fieldData = fields.map(f => ({
        versionId: newVersion.versionId,
        fieldName: f.fieldName,
        fieldValue: f.fieldValue !== undefined ? String(f.fieldValue) : null,
      }));

      const findVal = (name) => {
        const field = fields.find(f => f.fieldName === name);
        if (!field || field.fieldValue === null) return null;
        const val = parseFloat(String(field.fieldValue).replace(",", "."));
        return isNaN(val) ? null : val;
      };

      const ht = findVal("total_ht");
      const tva = findVal("total_tva");
      const ttc = findVal("total_ttc");

      if (ht !== null && tva !== null && ttc !== null) {
        const diff = Math.abs((ht + tva) - ttc);
        const isIncoherent = diff > 0.05;

        fieldData.push({
          versionId: newVersion.versionId,
          fieldName: "is_total_incoherent",
          fieldValue: String(isIncoherent),
          validationStatus: isIncoherent ? "invalid" : "valid",
        });
      }

      const siretField = fields.find(f => f.fieldName === "siret");
      if (siretField && siretField.fieldValue) {
        const siretVal = String(siretField.fieldValue).replace(/\s/g, "");
        const isLengthOk = /^\d{14}$/.test(siretVal);

        if (!isLengthOk) {
          const idx = fieldData.findIndex(f => f.fieldName === "siret");
          if (idx !== -1) fieldData[idx].validationStatus = "invalid";
        } else {
          const company = await prisma.company.findUnique({
            where: { siret: siretVal }
          });
          if (!company) {
            const idx = fieldData.findIndex(f => f.fieldName === "siret");
            if (idx !== -1) fieldData[idx].validationStatus = "invalid";
          } else {
            const idx = fieldData.findIndex(f => f.fieldName === "siret");
            if (idx !== -1) fieldData[idx].validationStatus = "valid";
          }
        }
      }

      await prisma.documentField.createMany({
        data: fieldData
      });
    }

    const populatedVersion = await prisma.documentVersion.findUnique({
      where: { versionId: newVersion.versionId },
      include: {
        processor: { include: { role: true } },
        fields: {
          orderBy: { fieldId: "asc" },
          include: {
            validator: { include: { role: true } },
          },
        },
      }
    });

    res.status(201).json({ data: populatedVersion });
  }),
);

module.exports = { documentsRouter: router };

