import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Fingerprint, Lock, UnlockKeyhole } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';
import { VaultUnlockError } from '../crypto/vaultCrypto';

/** Locked vault gate shown for all protected routes when the vault is locked. */
export function VaultLockScreen() {
  const { unlock, lastUnlockedAt } = useVault();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!pin) {
      setError('Enter your unlock PIN');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await unlock(pin);
    } catch (err) {
      setError(err instanceof VaultUnlockError ? 'Incorrect PIN. Try again.' : 'Unable to unlock the vault.');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  const msg = lastUnlockedAt
    ? 'Your vault was automatically locked for your security.'
    : 'Sign in completed. Unlock your vault to continue.';

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', py: 8, mt: { xs: 0, md: 6 } }} className="fade-in">
      <Paper elevation={0} sx={{ p: 4, borderRadius: 1, textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            mx: 'auto',
            mb: 2.5,
            background: 'radial-gradient(120% 120% at 30% 0%, #FFFFFF 0%, #F1F5F9 100%)',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
          }}
        >
          <Lock size={30} />
        </Box>
        <Typography variant="h2">Vault Locked</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mx: 'auto', maxWidth: 300, mt: 1 }}>
          {msg}
        </Typography>

        <Stack spacing={2} sx={{ mt: 3, textAlign: 'left' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <TextField
              fullWidth
              label="Unlock PIN"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              error={Boolean(error)}
              helperText={error}
              InputProps={{
                endAdornment: <Fingerprint size={18} color="#94A3B8" />,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={busy}
              loadingIndicator="Unlocking…"
              startIcon={<UnlockKeyhole size={18} />}
              sx={{ mt: 2 }}
            >
              Unlock Vault
            </Button>
          </form>
        </Stack>

        <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: 'text.secondary' }}>
          Your data stays encrypted in your account until this unlock succeeds.
        </Typography>
      </Paper>
    </Box>
  );
}