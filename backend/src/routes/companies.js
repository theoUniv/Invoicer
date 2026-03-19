const express = require("express");

const { getPrisma } = require("../lib/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const take = Math.min(Number(req.query.limit || 50), 200);
    const skip = Number(req.query.offset || 0);

    const where = {};
    if (req.query.siret) where.siret = String(req.query.siret);
    if (req.query.name) where.name = { contains: String(req.query.name) };

    const companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        documentLinks: {
          include: {
            document: {
              include: {
                documentType: true,
              },
            },
          },
        },
      },
    });

    res.json({ data: companies, pagination: { limit: take, offset: skip } });
  }),
);

router.get(
  "/:companyId",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const companyId = Number(req.params.companyId);
    if (!Number.isInteger(companyId)) return res.status(400).json({ error: { message: "Invalid companyId" } });

    const company = await prisma.company.findUnique({
      where: { companyId },
      include: {
        documentLinks: {
          include: {
            document: {
              include: {
                documentType: true,
                uploader: { include: { role: true } },
              },
            },
          },
        },
      },
    });

    if (!company) return res.status(404).json({ error: { message: "Company not found" } });
    res.json({ data: company });
  }),
);

module.exports = { companiesRouter: router };

