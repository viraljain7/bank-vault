import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Eye, EyeOff, Nfc } from 'lucide-react';
import { formatCardNumber } from '../../lib/format';
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
  const [reveal, setReveal] = useState({ number: false, cvv: false, expiry: false });

  const toggle = (field: 'number' | 'cvv' | 'expiry') =>
    setReveal((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <Box
      className="premium-card"
      sx={{
        aspectRatio: '1.586',
        width: isSm ? 4040 : '100%',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSm ? 0.75 : 1, flexShrink: 0 }}>
          {!empty && <CardBrandLogo brand={brandLabel} isSm={isSm} />}
          <Nfc size={isSm ? 20 : 24} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
        <Typography
          sx={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: isSm ? 1 : 2,
            fontSize: isSm ? 15 : 22,
          }}
        >
          {empty
            ? '•••• •••• •••• ••••'
            : reveal.number
              ? formatCardNumber(number ?? '')
              : maskCardNumber(last4, number)}
        </Typography>
        {!empty && (
          <RevealToggleIcon
            shown={reveal.number}
            isSm={isSm}
            label="Card number"
            onToggle={() => toggle('number')}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
            CVV
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontSize: isSm ? 15 : 18 }}>
              {empty ? '•••' : reveal.cvv ? card?.cvv || '•••' : '•••'}
            </Typography>
            {!empty && (
              <RevealToggleIcon
                shown={reveal.cvv}
                isSm={isSm}
                label="CVV"
                onToggle={() => toggle('cvv')}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
            VALID THRU
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontSize: isSm ? 14 : 17 }}>
              {empty
                ? '••/••'
                : reveal.expiry
                  ? `${card?.expiryMonth ?? '••'}/${card?.expiryYear ? card.expiryYear.slice(-2) : '••'}`
                  : '••/••'}
            </Typography>
            {!empty && (
              <RevealToggleIcon
                shown={reveal.expiry}
                isSm={isSm}
                label="Expiry"
                onToggle={() => toggle('expiry')}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function CardBrandLogo({ brand, isSm }: { brand: string; isSm: boolean }) {
  const b = brand.toLowerCase();

  if (b === 'visa') {
    return (
      <Typography sx={{ fontSize: isSm ? 14 : 19, fontStyle: 'italic', fontWeight: 900, letterSpacing: 1, color: '#fff', lineHeight: 1, opacity: 0.95 }}>
        VISA
      </Typography>
    );
  }

  if (b === 'mastercard') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isSm ? 0.5 : 0.75 }}>
        <Box sx={{ position: 'relative', width: isSm ? 22 : 28, height: isSm ? 13 : 17 }}>
          <Box sx={{ position: 'absolute', left: 0, top: 0, width: isSm ? 13 : 17, height: '100%', borderRadius: '50%', bgcolor: '#EB001B', opacity: 0.92 }} />
          <Box sx={{ position: 'absolute', left: '45%', top: 0, width: isSm ? 13 : 17, height: '100%', borderRadius: '50%', bgcolor: '#F79E1B', opacity: 0.92, mixBlendMode: 'screen' }} />
        </Box>
        <Typography sx={{ fontSize: isSm ? 10 : 13, fontWeight: 800, letterSpacing: 0.4, color: '#fff', lineHeight: 1 }}>
          mastercard
        </Typography>
      </Box>
    );
  }

  if (b === 'american express') {
    return (
      <Box sx={{ bgcolor: '#2E77BC', px: isSm ? 0.75 : 1.25, py: 0.25, borderRadius: 0.75, fontSize: isSm ? 8.5 : 12, fontWeight: 800, letterSpacing: 0.5, color: '#fff', lineHeight: 1.6, whiteSpace: 'nowrap' }}>
        AMEX
      </Box>
    );
  }

  if (b === 'rupay') {
    return (
      <Typography sx={{ fontSize: isSm ? 12 : 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        ru<Box component="span" sx={{ color: '#F57C00' }}>Pay</Box>
      </Typography>
    );
  }

  if (b === 'discover') {
    return (
      <Typography sx={{ fontSize: isSm ? 12 : 16, fontWeight: 800, letterSpacing: 0.5, color: '#fff', lineHeight: 1 }}>
        DISCOVER
      </Typography>
    );
  }

  return null;
}

function RevealToggleIcon({
  shown,
  isSm,
  label,
  onToggle,
}: {
  shown: boolean;
  isSm: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={`${shown ? 'Hide' : 'Reveal'} ${label}`}
      onClick={onToggle}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'rgba(255,255,255,0.14)',
        color: 'rgba(255,255,255,0.85)',
        cursor: 'pointer',
        padding: '3px',
        borderRadius: 6,
        flexShrink: 0,
        lineHeight: 0,
        '&:hover': { background: 'rgba(255,255,255,0.28)' },
      }}
    >
      {shown ? <EyeOff size={isSm ? 12 : 15} /> : <Eye size={isSm ? 12 : 15} />}
    </Box>
  );
}