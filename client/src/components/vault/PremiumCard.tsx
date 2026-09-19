import { Box, Typography } from '@mui/material';
import { Nfc } from 'lucide-react';
import type { CardPayload } from '../../types';
import { maskCardNumber } from '../../lib/format';

/**
 * Realistic-but-original premium card visual. Shows non-secret data plus the
 * CVV and expiry (stored encrypted end-to-end; never visible to servers).
 * Not a copy of any issuer's design; generic gradient + contactless affordance.
 */
export function PremiumCard({
  card,
  last4,
  brand,
  empty = false,
  size = 'md',
}: {
  card?: CardPayload | null;
  last4?: string;
  brand?: string;
  empty?: boolean;
  size?: 'sm' | 'md';
}) {
  const brandLabel = brand ?? card?.cardBrand ?? 'VaultBank';
  const number = card?.cardNumber;
  const isSm = size === 'sm';

  return (
    <Box
      className="premium-card"
      sx={{
        aspectRatio: '1.586',
        width: isSm ? 240 : '100%',
        maxWidth: 400,
        p: isSm ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(30,58,138,0.28)',
      }}
      aria-label={empty ? 'Card preview' : `${brandLabel} card ending ${last4 ?? ''}`}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          {!empty && (
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: isSm ? 9 : 11, letterSpacing: 1, textTransform: 'uppercase' }}>
              Issuing bank
            </Typography>
          )}
          <Typography sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: isSm ? 16 : 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {empty ? 'VaultBank' : brandLabel}
          </Typography>
        </Box>
        <Nfc size={isSm ? 20 : 24} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
      </Box>

      <Typography
        sx={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing: isSm ? 1 : 2,
          fontSize: isSm ? 15 : 22,
          mt: 1,
        }}
      >
        {empty ? '•••• •••• •••• ••••' : maskCardNumber(last4, number)}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
            CVV
          </Typography>
          <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontSize: isSm ? 15 : 18 }}>
            {empty ? '•••' : card?.cvv || '•••'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
            VALID THRU
          </Typography>
          <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontSize: isSm ? 14 : 17 }}>
            {empty ? '••/••' : `${card?.expiryMonth ?? '••'}/${card?.expiryYear ? card.expiryYear.slice(-2) : '••'}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}