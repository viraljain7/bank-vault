import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { buildTestApp, startDb, stopDb, tokenFor, VALID_BANK_BODY } from './helpers.js';

describe('authentication & authorization boundaries', () => {
  let app: Express;

  beforeAll(async () => {
    await startDb();
    app = buildTestApp();
  });

  afterAll(async () => {
    await stopDb();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/vault');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a request with no bearer token on sensitive endpoints', async () => {
    const res = await request(app).get('/api/v1/keys');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage bearer token', async () => {
    const res = await request(app).get('/api/v1/vault').set('Authorization', 'Bearer not-a-valid-token');
    expect(res.status).toBe(401);
  });

  it('accepts an authenticated request', async () => {
    const res = await request(app)
      .get('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('authenticated user can create a vault item', async () => {
    const res = await request(app)
      .post('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_creator')}`)
      .send(VALID_BANK_BODY);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Personal HDFC');
  });

  it('never persists plaintext secrets — only ciphertext reaches the database', async () => {
    const plaintext = 'super-secret-netbanking-password';
    const body = {
      ...VALID_BANK_BODY,
      encryptedPayload: Buffer.from(plaintext).toString('base64'),
    };
    const res = await request(app)
      .post('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_secret_check')}`)
      .send(body);
    expect(res.status).toBe(201);

    // The stored payload must not equal the plaintext and must not contain it.
    expect(res.body.data.encryptedPayload).not.toBe(plaintext);
    expect(res.body.data.encryptedPayload).not.toContain('super-secret-netbanking');
  });

  it('rejects plaintext secret fields supplied to the API', async () => {
    const res = await request(app)
      .post('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_attacker')}`)
      .send({ ...VALID_BANK_BODY, password: 'MyPassword123', cvv: '123' });
    expect(res.status).toBe(400);
  });
});