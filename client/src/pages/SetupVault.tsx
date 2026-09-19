import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';
import { toApiError } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

/** Fresh vault: create the unlock PIN that protects the client-side key. */
export function SetupVaultScreen() {
  const { setupVault, userId } = useVault();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinType = showPins ? 'text' : 'password';
  const pinAdornments = {
    startAdornment: (
      <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
        <KeyRound size={18} />
      </InputAdornment>
    ),
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          size="small"
          onClick={() => setShowPins((v) => !v)}
          tabIndex={-1}
          aria-label={showPins ? 'Hide PIN' : 'Show PIN'}
        >
          {showPins ? <EyeOff size={18} /> : <Eye size={18} />}
        </IconButton>
      </InputAdornment>
    ),
  };

  const submit = async () => {
    if (!userId) return;
    if (pin.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (pin !== confirm) {
      setError('PINs do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setupVault(pin);
      toast('Vault unlocked', { title: 'Your vault is ready' });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', py: 6, mt: { xs: 2, md: 8 } }} className="fade-in">
      <Paper elevation={0} sx={{ p: 4, borderRadius: 1 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: '#EBEFFF', color: 'primary.main', mb: 2 }}>
          <KeyRound size={30} />
        </Box>
        <Typography variant="h2">Secure your vault</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          Create an <strong>Unlock PIN</strong>. Your vault key is encrypted with it in your browser —
          the PIN never leaves this device, so VaultBank can’t recover it for you.
        </Typography>

        <Alert severity="info" sx={{ borderRadius: 1, mb: 2.5 }}>
          If you forget your PIN, your stored credentials cannot be recovered. Choose something
          memorable but hard to guess.
        </Alert>

        <Stack spacing={2}>
          <TextField
            label="Unlock PIN"
            type={pinType}
            autoComplete="new-password"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            InputProps={pinAdornments}
            error={Boolean(error)}
            helperText={pin && pin.length > 0 && pin.length < 6 ? `${pin.length}/6 minimum` : undefined}
          />
          <TextField
            label="Confirm PIN"
            type={pinType}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            InputProps={pinAdornments}
            error={Boolean(error)}
            helperText={error}
          />
          <Button
            variant="contained"
            size="large"
            onClick={submit}
            loading={busy}
            loadingIndicator="Setting up…"
            startIcon={<KeyRound size={18} />}
            sx={{ mt: 1 }}
          >
            Create vault
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: 'text.secondary' }}>
          Tip: 6+ characters. Avoid common words — the PIN is the only way to unlock your data.
        </Typography>

        <Typography
          variant="caption"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}
        >
          <ShieldCheck size={14} /> AES-256-GCM client-side · PBKDF2-SHA256 (210,000 rounds)
        </Typography>
      </Paper>
    </Box>
  );
}