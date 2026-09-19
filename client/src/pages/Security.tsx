import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Eye, EyeOff, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useVault } from '../contexts/VaultContext';
import { useToast } from '../contexts/ToastContext';
import { changePinSchema, type ChangePinInput } from '../schemas/vaultSchemas';
import { toApiError } from '../lib/api';
import { VaultUnlockError } from '../crypto/vaultCrypto';

export function SecurityPage() {
  const { phase, changePin, resetVault, hasUnlockKey } = useVault();
  const { toast } = useToast();

  const [pinDialog, setPinDialog] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [form, setForm] = useState<ChangePinInput>({ currentPin: '', pin: '', confirm: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const submitPin = async () => {
    const parsed = changePinSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid PIN');
      return;
    }
    setPinBusy(true);
    setFormError(null);
    try {
      await changePin(form.currentPin, form.pin);
      toast('Unlock PIN updated securely.');
      setPinDialog(false);
      setForm({ currentPin: '', pin: '', confirm: '' });
    } catch (err) {
      setFormError(err instanceof VaultUnlockError ? 'Current PIN is incorrect.' : toApiError(err).message);
    } finally {
      setPinBusy(false);
    }
  };

  const confirmReset = async () => {
    setResetBusy(true);
    try {
      await resetVault();
      toast('Vault reset. Set a new unlock PIN to begin.', { tone: 'info' });
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
    } finally {
      setResetBusy(false);
      setResetOpen(false);
    }
  };

  return (
    <Box className="fade-in" >
      <PageHeader title="Security" subtitle="Protect your vault" />

      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mb: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 48, height: 48, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: '#E7F6EC', color: '#15803D' }}>
            <ShieldCheck size={24} />
          </Box>
          <Box>
            <Typography variant="subtitle1">Vault protection</Typography>
            <Typography variant="body2" color="text.secondary">
              {hasUnlockKey
                ? 'Your vault is protected by a client-side encryption key.'
                : 'Set up your vault to begin.'}
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<KeyRound size={18} />} onClick={() => setPinDialog(true)} disabled={phase !== 'unlocked'}>
            Change unlock PIN
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Changing your PIN re-wraps the same vault key under the new PIN in your browser.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          What is stored
        </Typography>
        <Stack spacing={1}>
          <Alert severity="success" icon={<Fingerprint size={16} />} sx={{ borderRadius: 1 }}>
            Account and card details are AES-256-GCM encrypted in your browser.
          </Alert>
          <Alert severity="warning" icon={<ShieldCheck size={16} />} sx={{ borderRadius: 1 }}>
            Card PIN, OTP and 3DS codes are never stored — by design. The CVV is stored encrypted
            end-to-end and revealed only when you ask.
          </Alert>
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            Audit activity contains actions and timestamps only; never secret values.
          </Alert>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" color="error" sx={{ mb: 0.5 }}>
          Danger zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resetting the vault permanently deletes the unlock key and every stored credential.
          Data becomes unrecoverable — including for VaultBank.
        </Typography>
        <Button variant="outlined" color="error" onClick={() => setResetOpen(true)}>
          Reset vault
        </Button>
      </Paper>

      <Dialog open={pinDialog} onClose={() => setPinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change unlock PIN</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Current PIN"
                fullWidth
                type={showPins ? 'text' : 'password'}
                value={form.currentPin}
                onChange={(e) => setForm((f) => ({ ...f, currentPin: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                      <Fingerprint size={18} />
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
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="New PIN"
                fullWidth
                type={showPins ? 'text' : 'password'}
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
                helperText="At least 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                      <KeyRound size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Confirm new PIN"
                fullWidth
                type={showPins ? 'text' : 'password'}
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                error={Boolean(formError)}
                helperText={formError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                      <KeyRound size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPinDialog(false)} disabled={pinBusy}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void submitPin()} loading={pinBusy}>
            Update PIN
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset vault?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete every credential and the unlock key. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetOpen(false)} disabled={resetBusy}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => void confirmReset()} loading={resetBusy}>
            Reset vault
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}