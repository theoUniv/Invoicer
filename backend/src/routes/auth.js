const express = require("express");

const { getPrisma } = require("../lib/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/requireAuth");
const { hashPassword, signAccessToken, verifyPassword } = require("../lib/auth");

const router = express.Router();

function sanitizeUser(user) {
  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    role: user.role,
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const { email, password, firstName, lastName, roleId } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: { message: "email and password are required" } });
    }

    const role = roleId
      ? await prisma.role.findUnique({ where: { roleId: Number(roleId) } })
      : await prisma.role.findUnique({ where: { name: "user" } });

    if (!role) {
      return res.status(400).json({ error: { message: "Invalid role (create a role 'user' or provide roleId)" } });
    }

    const passwordHash = await hashPassword(String(password));
    try {
      const user = await prisma.user.create({
        data: {
          email: String(email).toLowerCase(),
          passwordHash,
          firstName: firstName ? String(firstName) : null,
          lastName: lastName ? String(lastName) : null,
          roleId: role.roleId,
        },
        include: { role: true },
      });

      const token = signAccessToken({ sub: String(user.userId), email: user.email, role: user.role.name });
      return res.status(201).json({ data: { token, user: sanitizeUser(user) } });
    } catch (e) {
      if (String(e.code) === "P2002") {
        return res.status(409).json({ error: { message: "Email already exists" } });
      }
      throw e;
    }
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: { message: "email and password are required" } });

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
      include: { role: true },
    });
    if (!user || !user.isActive) return res.status(401).json({ error: { message: "Invalid credentials" } });

    const ok = await verifyPassword(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: "Invalid credentials" } });

    await prisma.user.update({
      where: { userId: user.userId },
      data: { lastLoginAt: new Date() },
    });

    const token = signAccessToken({ sub: String(user.userId), email: user.email, role: user.role.name });
    return res.json({ data: { token, user: sanitizeUser(user) } });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ data: { user: req.user } });
  }),
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Stateless JWT: logout is handled client-side by forgetting the token.
    res.json({ data: { ok: true } });
  }),
);

module.exports = { authRouter: router };

