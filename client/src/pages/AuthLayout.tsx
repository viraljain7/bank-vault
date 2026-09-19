import { Box, Paper, Typography } from '@mui/material';
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

const FEATURES = [
  { icon: <Fingerprint size={17} />, text: 'Unlock with a PIN you choose' },
  { icon: <LockKeyhole size={17} />, text: 'AES-256-GCM encrypted in your browser' },
  { icon: <ShieldCheck size={17} />, text: 'Card PIN, OTP & 3DS are never stored' },
];

/** Branded split layout used by the Clerk-powered sign-in / sign-up pages. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: { xs: 'block', md: 'grid' },
        gridTemplateColumns: 'minmax(420px, 1.05fr) 1fr',
        bgcolor: 'background.default',
      }}
    >
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 7,
          color: '#fff',
          background:
            'radial-gradient(120% 100% at 12% 0%, #3B82F6 0%, #1D4ED8 45%, #172CC9 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            top: -160,
            right: -120,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: -120,
            left: -80,
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.16)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <LockKeyhole size={24} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
            VaultBank
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography variant="h2" sx={{ fontSize: '2rem', lineHeight: 1.2, color: '#fff' }}>
            Your financial credentials.<br />
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
              End-to-end secured.
            </Box>
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {FEATURES.map((f) => (
              <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.14)',
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={15} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
            AES-256-GCM + PBKDF2-SHA256 (210,000 rounds)
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box sx={{ display: { md: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(37,99,235,0.35)',
              mb: 1.5,
            }}
          >
            <LockKeyhole size={26} />
          </Box>
          <Typography variant="h4" fontWeight={800}>
            VaultBank
          </Typography>
        </Box>

        <Box >
          <Paper elevation={0} sx={{width: '100%', maxWidth: 450, p: { xs: 2.5, sm: 3.5 }, borderRadius: 1, border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(15,23,42,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Sparkles size={16} color="#2563EB" />
              <Typography variant="h3">{title}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
            <KeyRound size={14} color="#94A3B8" />
            <Typography variant="caption" color="text.secondary">
              Encrypted end-to-end · Secrets never leave your device unencrypted
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}