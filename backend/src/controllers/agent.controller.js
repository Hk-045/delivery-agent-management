import { prisma } from '../lib/prisma.js';
import {
  validateCreateAgentData,
  validateUpdateAgentData,
  validateListQuery,
  sanitizeAgentData,
} from '../utils/validation.js';

export const createAgent = async (req, res) => {
  validateCreateAgentData(req);
  const data = sanitizeAgentData(req.body);
  const agent = await prisma.agent.create({ data });
  res.status(201).json(agent);
};

export const listAgents = async (req, res) => {
  validateListQuery(req);

  const { status, serviceArea, search } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

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

  res.status(200).json({
    data: agents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};