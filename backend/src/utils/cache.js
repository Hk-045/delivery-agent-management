import { redis } from '../lib/redis.js';

export const AGENT_TTL = 300;
export const LIST_TTL = 60;
const LIST_VERSION_KEY = 'agents:list:version';

export const getCache = async (key) => {
  if (!redis.isReady) return null;
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache read failed:', err.message);
    return null;
  }
};

export const setCache = async (key, data, ttlSeconds) => {
  if (!redis.isReady) return;
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.error('Cache write failed:', err.message);
  }
};

export const deleteCache = async (key) => {
  if (!redis.isReady) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache delete failed:', err.message);
  }
};

export const getListVersion = async () => {
  if (!redis.isReady) return '0';
  try {
    const version = await redis.get(LIST_VERSION_KEY);
    return version ?? '0';
  } catch (err) {
    console.error('Cache version read failed:', err.message);
    return '0';
  }
};

export const bumpListVersion = async () => {
  if (!redis.isReady) return;
  try {
    await redis.incr(LIST_VERSION_KEY);
  } catch (err) {
    console.error('Cache version bump failed:', err.message);
  }
};

export const agentKey = (id) => `agent:${id}`;

export const listKey = (version, { status, serviceArea, search, page, limit }) =>
  `agents:list:v${version}` +
  `:status=${status || 'all'}` +
  `:area=${serviceArea || 'all'}` +
  `:search=${search ? search.toLowerCase() : 'all'}` +
  `:page=${page}:limit=${limit}`;