import express from 'express';
import { createAgent, getAgent, listAgents, updateAgent, deleteAgent } from '../controllers/agent.controller.js';

export const agentRouter = express.Router();

agentRouter.post('/', createAgent);
agentRouter.get('/', listAgents);
agentRouter.get('/:id',getAgent);
agentRouter.patch('/:id',updateAgent);
agentRouter.delete('/:id',deleteAgent)