import { Box, Chip, Typography } from '@mui/material';
import { Nfc, ShieldCheck } from 'lucide-react';
import type { CardPayload } from '../../types';
import { maskCardNumber } from '../../lib/format';

/**
 * Realistic-but-original premium card visual. Not a copy of any issuer's
 * design; generic gradient + contactless affordance.
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
  const holder = card?.cardholderName ?? 'CARDHOLDER NAME';
  const expiry = card ? `${card.expiryMonth}/${card.expiryYear.slice(-2)}` : 'MM/YY';

  return (
    <Box
      className="premium-card"
      sx={{
        aspectRatio: '1.586',
        width: size === 'sm' ? 240 : '100%',
        maxWidth: 400,
        p: size === 'sm' ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(30,58,138,0.28)',
      }}
      aria-label={empty ? 'Card preview' : `${brandLabel} card ${last4 ?? ''}`}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: size === 'sm' ? 16 : 20 }}>
          {empty ? 'VaultBank' : brandLabel.toUpperCase()}
        </Typography>
        <Nfc size={size === 'sm' ? 20 : 24} style={{ color: 'rgba(255,255,255,0.85)' }} />
      </Box>

      <Typography
        sx={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing: size === 'sm' ? 1 : 2,
          fontSize: size === 'sm' ? 15 : 22,
          mt: 1,
        }}
      >
        {empty ? '•••• •••• •••• ••••' : maskCardNumber(last4, number)}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ fontSize: size === 'sm' ? 9 : 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
            CARDHOLDER
          </Typography>
          <Typography sx={{ fontWeight: 600, letterSpacing: 0.5, fontSize: size === 'sm' ? 13 : 16 }}>
            {holder}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: size === 'sm' ? 9 : 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
            EXPIRES
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: size === 'sm' ? 13 : 16 }}>{expiry}</Typography>
        </Box>
      </Box>

      {!empty && (
        <Chip
          icon={<ShieldCheck size={14} />}
          label="CVV never stored"
          size="small"
          sx={{
            position: 'absolute',
            top: size === 'sm' ? 52 : 76,
            right: size === 'sm' ? 16 : 24,
            bgcolor: 'rgba(255,255,255,0.14)',
            color: '#fff',
            fontSize: 10,
            '& .MuiChip-label': { px: 1 },
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />
      )}
    </Box>
  );
}