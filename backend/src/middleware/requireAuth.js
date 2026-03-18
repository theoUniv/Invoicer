const { verifyAccessToken } = require("../lib/auth");
const { getPrisma } = require("../lib/prisma");

function parseBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = parseBearerToken(req);
    if (!token) return res.status(401).json({ error: { message: "Missing Authorization Bearer token" } });

    const decoded = verifyAccessToken(token);
    const userId = Number(decoded.sub);
    if (!Number.isInteger(userId)) return res.status(401).json({ error: { message: "Invalid token subject" } });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { userId },
      include: { role: true },
    });
    if (!user || !user.isActive) return res.status(401).json({ error: { message: "User not found or inactive" } });

    req.user = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}

module.exports = { requireAuth };

