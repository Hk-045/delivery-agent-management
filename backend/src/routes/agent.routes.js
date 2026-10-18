import express from 'express';
import { createAgent, getAgent, listAgents } from '../controllers/agent.controller.js';

export const agentRouter = express.Router();

agentRouter.post('/', createAgent);
agentRouter.get('/', listAgents);
agentRouter.get('/:id',getAgent)