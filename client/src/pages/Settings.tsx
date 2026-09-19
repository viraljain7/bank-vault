import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { LogOut, TimerReset } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useVault } from '../contexts/VaultContext';
import { AUTO_LOCK_OPTIONS, type AutoLockValue } from '../types';
import { initials } from '../lib/format';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { autoLock, setAutoLock } = useVault();
  const navigate = useNavigate();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <Box className="fade-in" >
      <PageHeader title="Settings" subtitle="Preferences and account" />

      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontWeight: 700, fontSize: 20 }}>
            {initials(user?.fullName)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{user?.fullName ?? 'Vault user'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Signed in via Clerk · Multi-factor authentication is available from your Clerk account.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <TimerReset size={20} color="#1D4ED8" />
          <Typography variant="subtitle1">Auto-lock</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sensitive values are hidden automatically after this period of inactivity.
        </Typography>

        <FormControl>
          <FormLabel id="auto-lock-label" sx={{ mb: 1 }}>
            Vault auto-lock timing
          </FormLabel>
          <RadioGroup
            aria-labelledby="auto-lock-label"
            value={autoLock}
            onChange={(e) => setAutoLock(e.target.value as AutoLockValue)}
          >
            {AUTO_LOCK_OPTIONS.map((option) => (
              <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Account
        </Typography>
        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<LogOut size={18} />}
            onClick={() => {
              void signOut().then(() => navigate('/sign-in'));
            }}
          >
            Sign out
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}