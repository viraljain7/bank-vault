import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import type { Express } from 'express';
import type { ClerkTokenVerifier } from '../src/middleware/auth.js';
import { createApp } from '../src/app.js';

/** Maps a magic bearer token to a Clerk-style user id for tests. */
export const tokenFor = (id: string): string =>
  id.startsWith('user_') ? `tok-${id}` : `tok-user_${id}`;

export const testVerifier: ClerkTokenVerifier = async (token: string) => {
  if (!token.startsWith('tok-')) throw new Error('bad token');
  return { userId: token.replace('tok-', ''), sessionId: 'sess_test' };
};

export function buildTestApp(): Express {
  return createApp({ authVerifier: testVerifier });
}

let mongo: MongoMemoryServer | null = null;

export async function startDb(): Promise<string> {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  return uri;
}

export async function stopDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}

export const VALID_BANK_BODY = {
  type: 'bank',
  title: 'Personal HDFC',
  encryptedPayload: Buffer.from('ciphertext-blob-of-do-not-want-this-plaintext-here').toString('base64'),
  iv: Buffer.alloc(12, 8).toString('base64'),
  tag: Buffer.alloc(16, 7).toString('base64'),
  encryptionVersion: 1,
  metadata: { bankName: 'HDFC', last4: '4821' },
};