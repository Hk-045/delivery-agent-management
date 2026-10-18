import { prisma } from '../lib/prisma.js'
import { validateCreateAgentData, validateUpdateAgentData, sanitizeAgentData } from '../utils/validation.js';

export const createAgent = async (req,res)=>{
    validateCreateAgentData(req);
    const data = sanitizeAgentData(req.body);
    const agent = await prisma.agent.create({ data })
    res.status(201).json(agent)
}