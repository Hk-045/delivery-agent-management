import express from "express";
const app = express();
import cors from 'cors';
import { config } from './config/env.js';
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health',(req,res)=>{
    res.status(200).json({status:'ok'})
})

export default app;