import app from './app.js';
import { config } from './config/env.js';
import { prisma } from './lib/prisma.js';

prisma.$connect()
  .then(() => {
    console.log('Database connection established...');
    app.listen(config.port, () => {
      console.log(`Server is running on port: ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Database cannot be connected!!', err.message);
    process.exit(1);
  });