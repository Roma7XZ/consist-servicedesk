require("dotenv").config();

const express = require("express");
const cors = require("cors");

const prisma = require("./db");

const authRoutes = require("./routes/auth");
const incidentsRoutes = require("./routes/incidents");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
    cors({
        origin:
            corsOrigin === "*"
                ? true
                : corsOrigin.split(",").map(origin => origin.trim()),
        credentials: true,
    })
);

app.use(express.json({
    limit: "1mb",
}));

app.get("/api/ping", (req, res) => {
    res.json({
        status: "OK",
        message: "Consist ServiceDesk API работает",
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/software', require('./routes/software'));
app.use('/api/users', require('./routes/users'));

app.use((req, res) => {
    res.status(404).json({
        error: "Маршрут не найден",
    });
});

app.use(errorHandler);

let server;

async function startServer() {
    try {
        await prisma.$connect();

        console.log("✅ PostgreSQL подключён");

        server = app.listen(PORT, HOST, () => {
            console.log(`🚀 Сервер запущен`);
            console.log(`🌐 http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Не удалось подключиться к базе данных");
        console.error(error);

        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`\n${signal} получен. Завершение работы...`);

    try {
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }

        await prisma.$disconnect();

        console.log("✅ Соединение с БД закрыто");
        console.log("👋 Сервер остановлен");

        process.exit(0);
    } catch (error) {
        console.error("Ошибка при завершении работы:", error);
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", async error => {
    console.error("Необработанное исключение:", error);
    await shutdown("uncaughtException");
});

process.on("unhandledRejection", async reason => {
    console.error("Необработанный Promise:", reason);
    await shutdown("unhandledRejection");
});

startServer();