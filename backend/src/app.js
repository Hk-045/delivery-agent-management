import express from "express";
const app = express();
import cors from 'cors';
import { config } from './config/env.js';
import { notFound } from "../middleware/notFound.js";
import { errorHandler } from "../middleware/errorHandler.js";
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health',(req,res)=>{
    res.status(200).json({status:'ok'})
})
app.get('/boom', () => {
  throw new Error('Database password is mypass123');
});
app.use(notFound)
app.use(errorHandler)
export default app;