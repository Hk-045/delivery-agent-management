import { createClient } from 'redis';
import { config } from '../config/env.js';

export const redis = createClient({
  url: config.redisUrl,
  disableOfflineQueue: true,
  socket: { connectTimeout: 5000 },
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});