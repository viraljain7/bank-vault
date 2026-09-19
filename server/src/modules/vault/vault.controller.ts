import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { writeAudit } from '../../services/audit.service.js';
import {
  createVaultItem,
  countVaultItems,
  countFavorites,
  deleteOwnVaultItem,
  getOwnVaultItem,
  listVaultItems,
  updateOwnVaultItem,
} from './vault.service.js';

type AuthedRequest = Request & { auth: Request['auth'] };

function idParam(req: Request): string {
  const value = req.params['id'];
  return typeof value === 'string' ? value : '';
}

/** GET /api/v1/vault */
export const getVaultItems = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { type, favorite, q, limit } = req.query as {
    type?: 'bank' | 'card';
    favorite?: 'true' | 'false';
    q?: string;
    limit?: number;
  };

  const favoriteFlag = favorite === undefined ? undefined : favorite === 'true';

  const items = await listVaultItems({
    userId: req.auth.userId,
    type,
    favorite: favoriteFlag,
    q,
    limit,
  });

  if (q) {
    await writeAudit(
      { userId: req.auth.userId, action: 'SEARCH', resourceType: 'vault', resourceId: undefined },
      req,
    );
  }

  res.json({ success: true, data: items });
});

/** GET /api/v1/vault/:id */
export const getVaultItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const item = await getOwnVaultItem(req.auth.userId, idParam(req));
  await writeAudit(
    { userId: req.auth.userId, action: 'READ', resourceType: item.type, resourceId: item._id.toString() },
    req,
  );
  res.json({ success: true, data: item });
});

/** POST /api/v1/vault */
export const postVaultItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const item = await createVaultItem({
    userId: req.auth.userId,
    input: req.body,
  });
  await writeAudit(
    { userId: req.auth.userId, action: 'CREATE', resourceType: item.type, resourceId: item._id.toString() },
    req,
  );
  res.status(201).json({ success: true, data: item });
});

/** PATCH /api/v1/vault/:id */
export const patchVaultItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const existing = await getOwnVaultItem(req.auth.userId, idParam(req));
  const item = await updateOwnVaultItem(req.auth.userId, idParam(req), req.body);
  await writeAudit(
    { userId: req.auth.userId, action: 'UPDATE', resourceType: existing.type, resourceId: existing._id.toString() },
    req,
  );
  res.json({ success: true, data: item });
});

/** DELETE /api/v1/vault/:id */
export const deleteVaultItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const existing = await deleteOwnVaultItem(req.auth.userId, idParam(req));
  await writeAudit(
    { userId: req.auth.userId, action: 'DELETE', resourceType: existing.type, resourceId: existing._id.toString() },
    req,
  );
  res.status(200).json({ success: true, data: { id: existing._id.toString() } });
});

/** GET /api/v1/vault/overview — lightweight counts for the dashboard. */
export const getOverview = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const [bankCount, cardCount, favorites] = await Promise.all([
    countVaultItems(req.auth.userId, 'bank'),
    countVaultItems(req.auth.userId, 'card'),
    countFavorites(req.auth.userId),
  ]);

  res.json({
    success: true,
    data: { banks: bankCount, cards: cardCount, favorites, status: 'protected' },
  });
});