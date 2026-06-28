const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('../db');
const { requireAuth, getUserFromRequest } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_ROLES = ['ADMIN', 'ENGINEER', 'ANALYST'];

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

const signToken = (user) => {
  // 1. Создаем тот самый payload из данных пользователя
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // 2. Передаем payload в функцию генерации токена
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'dev-super-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  );
};

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth] Ошибка сервера при входе:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json(req.user);
});

router.post('/register', async (req, res) => {
  const { email, password, name, role = 'ENGINEER' } = req.body;

  if (!isNonEmptyString(email)) {
    return res.status(400).json({ error: 'Email обязателен' });
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  }
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'Имя обязательно' });
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: `Роль должна быть одной из: ${ALLOWED_ROLES.join(', ')}` });
  }

  try {
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      const currentUser = await getUserFromRequest(req);
      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Создавать пользователей может только администратор' });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        role: usersCount === 0 ? 'ADMIN' : role,
      },
      select: publicUserSelect,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

module.exports = router;