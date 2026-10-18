import express from 'express';
import { createAgent } from '../controllers/agent.controller.js';

export const agentRouter = express.Router();

agentRouter.post('/',createAgent);