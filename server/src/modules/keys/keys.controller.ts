import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { writeAudit } from '../../services/audit.service.js';
import { deleteVaultKey, getVaultKey, upsertVaultKey } from './keys.service.js';

type AuthedRequest = Request & { auth: Request['auth'] };

/** GET /api/v1/keys — fetch the user's wrapped vault key (or null). */
export const getWrappedKey = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const wrapper = await getVaultKey(req.auth.userId);
  res.json({ success: true, data: wrapper });
});

/** PUT /api/v1/keys — create or rotate the wrapped vault key. */
export const putWrappedKey = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const wrapper = await upsertVaultKey(req.auth.userId, req.body);
  await writeAudit(
    { userId: req.auth.userId, action: 'SETUP' as const, resourceType: 'key' as const },
    req,
  );
  res.json({ success: true, data: wrapper });
});

/** DELETE /api/v1/keys — wipe the unlock key (vault data becomes unrecoverable). */
export const deleteWrappedKey = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await deleteVaultKey(req.auth.userId);
  await writeAudit(
    { userId: req.auth.userId, action: 'LOCK' as const, resourceType: 'key' as const },
    req,
  );
  res.json({ success: true, data: { deleted: true } });
});