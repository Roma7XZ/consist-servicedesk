const express = require('express');

const router = express.Router();

const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const ALLOWED_CATEGORIES = ['ПО', 'Оборудование', 'Сеть', 'ИБ'];
const ALLOWED_PRIORITIES = ['Низкий', 'Средний', 'Высокий', 'Критический'];
const ALLOWED_STATUSES = ['Открыт', 'В работе', 'Решен', 'Закрыт'];

const incidentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const parsePositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

const canAccessIncident = (user, incident) => {
  if (user.role === 'ADMIN' || user.role === 'ANALYST') {
    return true;
  }

  return incident.authorId === user.id;
};

// Защищаем все маршруты ниже авторизацией
router.use(requireAuth);

// GET: Получить список инцидентов (с пагинацией)
router.get('/', async (req, res) => {
  // Защита от перегрузки БД: максимум 100 записей за раз, по умолчанию 50
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);

  try {
    const where =
      req.user.role === 'ENGINEER'
        ? {
            authorId: req.user.id,
          }
        : {};

    const incidents = await prisma.incident.findMany({
      where,
      include: incidentInclude,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,  // Ограничиваем количество возвращаемых строк
      skip: offset, // Пропускаем уже загруженные строки
    });

    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ошибка при получении инцидентов',
    });
  }
});

// GET: Получить конкретный инцидент по ID
router.get('/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: 'Некорректный ID инцидента',
    });
  }

  try {
    const incident = await prisma.incident.findUnique({
      where: {
        id,
      },
      include: incidentInclude,
    });

    if (!incident) {
      return res.status(404).json({
        error: 'Инцидент не найден',
      });
    }

    if (!canAccessIncident(req.user, incident)) {
      return res.status(403).json({
        error: 'Нет доступа к этому инциденту',
      });
    }

    res.json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ошибка при получении инцидента',
    });
  }
});

// POST: Создать новый инцидент
router.post('/', async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({
      error: 'Поле "title" обязательно',
    });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Категория должна быть одной из: ${ALLOWED_CATEGORIES.join(', ')}`,
    });
  }

  if (!ALLOWED_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Приоритет должен быть одним из: ${ALLOWED_PRIORITIES.join(', ')}`,
    });
  }

  try {
    const newIncident = await prisma.incident.create({
      data: {
        title: title.trim(),
        description: isNonEmptyString(description)
          ? description.trim()
          : null,
        category,
        priority,
        authorId: req.user.id,
      },
      include: incidentInclude,
    });

    res.status(201).json(newIncident);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ошибка при создании инцидента',
    });
  }
});

// PATCH: Обновить инцидент
router.patch('/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: 'Некорректный ID инцидента',
    });
  }

  const { title, description, category, priority, status } = req.body;

  try {
    const existingIncident = await prisma.incident.findUnique({
      where: {
        id,
      },
    });

    if (!existingIncident) {
      return res.status(404).json({
        error: 'Инцидент не найден',
      });
    }

    if (!canAccessIncident(req.user, existingIncident)) {
      return res.status(403).json({
        error: 'Нет доступа к этому инциденту',
      });
    }

    const data = {};

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return res.status(400).json({
          error: 'Заголовок не может быть пустым',
        });
      }
      data.title = title.trim();
    }

    if (description !== undefined) {
      data.description = isNonEmptyString(description)
        ? description.trim()
        : null;
    }

    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Категория должна быть одной из: ${ALLOWED_CATEGORIES.join(', ')}`,
        });
      }
      data.category = category;
    }

    if (priority !== undefined) {
      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          error: `Приоритет должен быть одним из: ${ALLOWED_PRIORITIES.join(', ')}`,
        });
      }
      data.priority = priority;
    }

    if (status !== undefined) {
      if (req.user.role === 'ENGINEER') {
        return res.status(403).json({
          error: 'Инженер не может менять статус заявки',
        });
      }

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Статус должен быть одним из: ${ALLOWED_STATUSES.join(', ')}`,
        });
      }
      data.status = status;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        error: 'Нет данных для обновления',
      });
    }

    const updatedIncident = await prisma.incident.update({
      where: {
        id,
      },
      data,
      include: incidentInclude,
    });

    res.json(updatedIncident);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ошибка при обновлении инцидента',
    });
  }
});

// DELETE: Удалить инцидент
router.delete('/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: 'Некорректный ID инцидента',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Удалять заявки может только администратор',
    });
  }

  try {
    await prisma.incident.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Инцидент не найден',
      });
    }

    console.error(error);
    res.status(500).json({
      error: 'Ошибка при удалении инцидента',
    });
  }
});

module.exports = router;