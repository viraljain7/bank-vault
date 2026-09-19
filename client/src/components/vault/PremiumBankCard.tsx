import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { formatAccountNumber, maskAccountNumber } from '../../lib/format';
import type { BankPayload } from '../../types';

export function PremiumBankCard({
  bank,
  last4,
  empty = false,
  size = 'md',
}: {
  bank?: BankPayload | null;
  last4?: string;
  empty?: boolean;
  size?: 'sm' | 'md';
}) {
  const bankName = bank?.bankName ?? 'VaultBank';
  const [reveal, setReveal] = useState({ account: false, customerId: false });
  const isSm = size === 'sm';

  const toggle = (field: 'account' | 'customerId') =>
    setReveal((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <Box
      className="premium-bank-card"
      sx={{
        aspectRatio: '1.586',
        width: isSm ? 4040 : '100%',
        maxWidth: 400,
        p: isSm ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(6,78,59,0.28)',
      }}
      aria-label={empty ? 'Bank account preview' : `${bankName} account ending ${last4 ?? ''}`}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          {!empty && (
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: isSm ? 9 : 11, letterSpacing: 1, textTransform: 'uppercase' }}>
              Bank account
            </Typography>
          )}
          <Typography sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: isSm ? 16 : 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {empty ? 'VaultBank' : bankName}
          </Typography>
        </Box>
        <Building2 size={isSm ? 20 : 24} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
          ACCOUNT NUMBER
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              letterSpacing: isSm ? 1 : 2,
              fontSize: isSm ? 15 : 22,
            }}
          >
            {empty
              ? '•••• •••• •••• ••••'
              : reveal.account
                ? formatAccountNumber(bank?.accountNumber ?? '')
                : maskAccountNumber(bank?.accountNumber || last4)}
          </Typography>
          {!empty && (
            <RevealToggleIcon
              shown={reveal.account}
              isSm={isSm}
              label="Account number"
              onToggle={() => toggle('account')}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1 }}>
            CUSTOMER ID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontSize: isSm ? 14 : 17 }}>
              {empty ? '••••••' : reveal.customerId ? bank?.customerId || '••••••' : '••••••'}
            </Typography>
            {!empty && (
              <RevealToggleIcon
                shown={reveal.customerId}
                isSm={isSm}
                label="Customer ID"
                onToggle={() => toggle('customerId')}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: isSm ? 9 : 11, letterSpacing: 1.2 }}>
            SAVINGS
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: isSm ? 12 : 14, letterSpacing: 0.5 }}>
            PRIMARY
          </Typography>
        </Box>
      </Box>
    </Box>
  );
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