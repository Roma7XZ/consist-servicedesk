const jwt = require('jsonwebtoken');
const prisma = require('../db');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET не задан в .env');
  }

  return secret;
};

const extractToken = (req) => {
  const header = req.headers.authorization;

  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const getUserFromRequest = async (req) => {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        error: 'Требуется авторизация',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Требуется авторизация',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Недостаточно прав',
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRoles,
  getUserFromRequest,
};