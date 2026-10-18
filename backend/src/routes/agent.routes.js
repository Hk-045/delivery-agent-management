import express from 'express';
import { createAgent, listAgents } from '../controllers/agent.controller.js';

export const agentRouter = express.Router();

agentRouter.post('/', createAgent);
agentRouter.get('/', listAgents);