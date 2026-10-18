const requiredVariables = ['DATABASE_URL', 'REDIS_URL', 'CORS_ORIGIN'];

for (const name of requiredVariables) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  corsOrigin: process.env.CORS_ORIGIN,
};