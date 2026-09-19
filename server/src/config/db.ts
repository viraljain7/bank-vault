import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<void> {
  if (!uri) {
    throw new Error('MONGODB_URI is required to connect to the database');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info({ event: 'DB_CONNECTED' }, 'MongoDB connected');

  mongoose.connection.on('error', (err) => {
    logger.error({ event: 'DB_ERROR', err: err.message }, 'MongoDB connection error');
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info({ event: 'DB_DISCONNECTED' }, 'MongoDB disconnected');
}