const { PrismaClient } = require("@prisma/client");

let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.PRISMA_LOG_LEVEL ? [process.env.PRISMA_LOG_LEVEL] : undefined,
    });
  }
  return prisma;
}

module.exports = { getPrisma };

