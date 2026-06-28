const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Получить всех пользователей (Только для ADMIN)
router.get('/', requireAuth, async (req, res) => {
  // Защита: только администратор может видеть полный список
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Доступ запрещен. Только для администраторов.' });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Добавляем виртуальное поле статуса (так как в БД его пока нет)
    const mappedUsers = users.map(user => ({
      ...user,
      status: 'Активен'
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error('[Users API] Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Не удалось загрузить список сотрудников' });
  }
});

module.exports = router;