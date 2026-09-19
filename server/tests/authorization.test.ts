import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { buildTestApp, startDb, stopDb, tokenFor, VALID_BANK_BODY } from './helpers.js';

/**
 * Cross-tenant isolation: User A must never read, update, delete or reveal
 * any item owned by User B — even with a valid, guessing resource id.
 */
describe('multi-tenant isolation (IDOR protection)', () => {
  let app: Express;
  let userAItemId: string;

  beforeAll(async () => {
    await startDb();
    app = buildTestApp();

    const created = await request(app)
      .post('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_a')}`)
      .send(VALID_BANK_BODY);
    userAItemId = created.body.data._id as string;
  });

  afterAll(async () => {
    await stopDb();
  });

  it('User A can read their own item', async () => {
    const res = await request(app)
      .get(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(res.status).toBe(200);
  });

  it('User B cannot read User A item', async () => {
    const res = await request(app)
      .get(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_b')}`);
    expect(res.status).toBe(404);
  });

  it('User B cannot list User A items (scoped to own userId)', async () => {
    const res = await request(app)
      .get('/api/v1/vault')
      .set('Authorization', `Bearer ${tokenFor('user_b')}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('User B cannot update User A item', async () => {
    const res = await request(app)
      .patch(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_b')}`)
      .send({ favorite: true });
    expect(res.status).toBe(404);
  });

  it('User B cannot delete User A item', async () => {
    const res = await request(app)
      .delete(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_b')}`);
    expect(res.status).toBe(404);
  });

  it('User A item still exists and untouched after User B attacks', async () => {
    const res = await request(app)
      .get(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.favorite).toBe(false);
  });

  it('returns 404 for non-existent or malformed ids (no info leak)', async () => {
    const malformed = await request(app)
      .get('/api/v1/vault/not-a-real-id')
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(malformed.status).toBe(404);

    const nonexistent = await request(app)
      .get('/api/v1/vault/64bf3f1f2c3d4e5f6a7b8c9d')
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(nonexistent.status).toBe(404);
  });

  it('User A can delete their own item', async () => {
    const res = await request(app)
      .delete(`/api/v1/vault/${userAItemId}`)
      .set('Authorization', `Bearer ${tokenFor('user_a')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userAItemId);
  });
});