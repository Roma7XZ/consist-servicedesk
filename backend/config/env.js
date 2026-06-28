function getEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Переменная окружения ${name} не задана.`);
  }

  return value;
}

module.exports = {
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpires: process.env.JWT_EXPIRES_IN || "8h",
};