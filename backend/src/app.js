import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';


const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;