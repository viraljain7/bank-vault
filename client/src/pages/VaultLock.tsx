import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Fingerprint, UnlockKeyhole } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';
import { VaultUnlockError } from '../crypto/vaultCrypto';
import vault from '../img/vault.png';
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
      <Paper elevation={0} sx={{ p: 4, borderRadius: 0, textAlign: 'center' }}>
        <Box>
          <img src={vault} alt="PassVault" width={50} height={50} />
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
                endAdornment: <Fingerprint size={18} color="#B3AA9C" />,
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