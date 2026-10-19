import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import {
  validateCreateAgentData,
  validateUpdateAgentData,
  validateListQuery,
  sanitizeAgentData,
  validateAgentId
} from '../utils/validation.js';

import { getCache, setCache, deleteCache, getListVersion, bumpListVersion, agentKey, listKey, AGENT_TTL, LIST_TTL } from '../utils/cache.js';

export const createAgent = async (req, res) => {
  validateCreateAgentData(req);
  const data = sanitizeAgentData(req.body);
  const agent = await prisma.agent.create({ data });

  await bumpListVersion();

  res.status(201).json(agent);
};

export const listAgents = async (req, res) => {
  validateListQuery(req);

  const { status, serviceArea, search } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const version = await getListVersion();
  const key = listKey(version, {
    status,
    serviceArea: serviceArea?.trim(),
    search: search?.trim(),
    page,
    limit,
  });

  const cached = await getCache(key);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.status(200).json(cached);
  }

  const where = {};

  if (status) {
    where.status = status;
  }

  if (serviceArea) {
    where.serviceArea = serviceArea.trim();
  }

  if (search) {
    where.fullName = { contains: search.trim(), mode: 'insensitive' };
  }

  const agents = await prisma.agent.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip,
    take: limit,
  });

  const total = await prisma.agent.count({ where });

  const response = {
    data: agents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(key, response, LIST_TTL);

  res.set('X-Cache', 'MISS');
  res.status(200).json(response);
};

export const getAgent = async (req, res) => {
  const { id } = req.params;
  validateAgentId(id);

  const key = agentKey(id);
  const cached = await getCache(key);

  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.status(200).json(cached);
  }

  const agent = await prisma.agent.findUnique({ where: { id } });

  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  await setCache(key, agent, AGENT_TTL);

  res.set('X-Cache', 'MISS');
  res.status(200).json(agent);
};

export const updateAgent = async (req, res) => {
  const { id } = req.params;
  validateAgentId(id);
  validateUpdateAgentData(req);

  const data = sanitizeAgentData(req.body);
  const agent = await prisma.agent.update({ where: { id }, data });

  await deleteCache(agentKey(id));
  await bumpListVersion();

  res.status(200).json(agent);
};

export const deleteAgent = async (req, res) => {
  const { id } = req.params;
  validateAgentId(id);

  await prisma.agent.delete({ where: { id } });

  await deleteCache(agentKey(id));
  await bumpListVersion();

  res.status(204).send();
};