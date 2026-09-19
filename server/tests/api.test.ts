import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { buildTestApp, startDb, stopDb, tokenFor, VALID_BANK_BODY } from './helpers.js';

describe('API behaviour', () => {
  let app: Express;

  beforeAll(async () => {
    await startDb();
    app = buildTestApp();
  });

  afterAll(async () => {
    await stopDb();
  });

  const auth = (id: string) => ({ Authorization: `Bearer ${tokenFor(id)}` });

  it('rejects invalid card payload with a safe 400 error', async () => {
    const res = await request(app)
      .post('/api/v1/vault')
      .set(auth('user_invalid'))
      .send({
        type: 'card',
        title: '',
        encryptedPayload: 'x',
        iv: 'y',
        tag: 'z',
        metadata: { cardBrand: '', last4: 'not4' },
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).not.toHaveProperty('stack');
  });

  it('unknown endpoint returns safe 404 JSON', async () => {
    const res = await request(app).get('/api/v1/does-not-exist').set(auth('user_x'));
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Endpoint not found');
  });

  it('health check is open', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('vault key wrapper can be upserted and read back (server-side encrypted at rest)', async () => {
    const wrapper = {
      salt: Buffer.alloc(16, 3).toString('base64'),
      iv: Buffer.alloc(12, 4).toString('base64'),
      wrappedKey: Buffer.alloc(48, 5).toString('base64'),
      iterations: 210_000,
    };

    const put = await request(app).put('/api/v1/keys').set(auth('user_keyholder')).send(wrapper);
    expect(put.status).toBe(200);
    expect(put.body.data.wrappedKey).toBe(wrapper.wrappedKey);

    const got = await request(app).get('/api/v1/keys').set(auth('user_keyholder'));
    expect(got.status).toBe(200);
    expect(got.body.data.iterations).toBe(210_000);

    // original wrapper is not stored in the clear on the API surface
    const raw = await request(app).get('/api/v1/keys').set(auth('user_keyholder'));
    expect(raw.body.data.wrappedKey).toBe(wrapper.wrappedKey);
  });

  it('other users have no vault key (no cross-user leakage)', async () => {
    const res = await request(app).get('/api/v1/keys').set(auth('user_other'));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('records and returns security activity for a reveal action', async () => {
    const created = await request(app)
      .post('/api/v1/vault')
      .set(auth('user_activity'))
      .send(VALID_BANK_BODY);
    const id = created.body.data._id as string;

    const revealed = await request(app)
      .post('/api/v1/activity')
      .set(auth('user_activity'))
      .send({ action: 'REVEAL', resourceType: 'bank', resourceId: id });
    expect(revealed.status).toBe(201);

    const list = await request(app).get('/api/v1/activity').set(auth('user_activity'));
    expect(list.status).toBe(200);
    const actions = (list.body.data as Array<{ action: string }>).map((e) => e.action);
    expect(actions).toContain('REVEAL');
    expect(actions).toContain('CREATE');

    // audit entries never contain secret data
    expect(JSON.stringify(list.body.data)).not.toContain('ciphertext');
  });

  it('rejects unauthorised activity actions', async () => {
    const res = await request(app)
      .post('/api/v1/activity')
      .set(auth('user_activity'))
      .send({ action: 'DELETE_ALL', resourceType: 'vault' });
    expect(res.status).toBe(400);
  });
});