const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/software - Получить весь список ПО и оборудования
router.get('/', requireAuth, async (req, res) => {
  try {
    const softwareList = await prisma.software.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(softwareList);
  } catch (error) {
    console.error('[Software API] Ошибка при получении списка:', error);
    res.status(500).json({ error: 'Не удалось загрузить реестр ПО' });
  }
});

// POST /api/software - Добавить новую позицию (Доступно ADMIN и ENGINEER)
router.post('/', requireAuth, async (req, res) => {
  const { name, version, type, licenseKey, status = 'Активна' } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Название и тип обязательны для заполнения' });
  }

  // Проверка прав
  if (req.user.role !== 'ADMIN' && req.user.role !== 'ENGINEER') {
    return res.status(403).json({ error: 'Недостаточно прав для добавления ресурсов' });
  }

  try {
    const newSoftware = await prisma.software.create({
      data: {
        name: name.trim(),
        version: version ? version.trim() : null,
        type, // 'ПО' или 'Оборудование'
        licenseKey: licenseKey ? licenseKey.trim() : null,
        status,
      },
    });
    res.status(201).json(newSoftware);
  } catch (error) {
    console.error('[Software API] Ошибка при создании записи:', error);
    res.status(500).json({ error: 'Не удалось добавить запись в реестр' });
  }
});

module.exports = router;