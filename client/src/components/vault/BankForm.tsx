import { useState, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import {
  AtSign,
  Eye,
  EyeOff,
  FileText,
  Hash,
  IdCard,
  KeyRound,
  Landmark,
  Wallet,
} from 'lucide-react';
import { bankPayloadSchema, type BankPayloadInput } from '../../schemas/vaultSchemas';
import { formatAccountNumber } from '../../lib/format';

function startIcon(icon: ReactNode): ReactNode {
  return (
    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
      {icon}
    </InputAdornment>
  );
}

function passwordToggle(show: boolean, onToggle: () => void): ReactNode {
  return (
    <InputAdornment position="end">
      <IconButton size="small" onClick={onToggle} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    </InputAdornment>
  );
}

export function BankForm({
  defaultValues,
  onSubmit,
  busy,
  onCancel,
}: {
  defaultValues?: Partial<BankPayloadInput>;
  onSubmit: (payload: BankPayloadInput) => Promise<void> | void;
  busy?: boolean;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BankPayloadInput>({
    resolver: zodResolver(bankPayloadSchema),
    defaultValues: {
      bankName: '',
      nickname: '',
      accountNumber: '',
      customerId: '',
      netbankingUsername: '',
      netbankingPassword: '',
      profilePassword: '',
      notes: '',
      ...defaultValues,
    },
  });

  const [showNetPass, setShowNetPass] = useState(false);
  const [showProfilePass, setShowProfilePass] = useState(false);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
      <Grid container spacing={2.5} sx={{ maxWidth: 620 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Bank name"
            placeholder="e.g. HDFC Bank"
            fullWidth
            {...register('bankName')}
            InputProps={{ startAdornment: startIcon(<Landmark size={18} />) }}
            error={Boolean(errors.bankName)}
            helperText={errors.bankName?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Account nickname"
            placeholder="e.g. Personal HDFC"
            fullWidth
            {...register('nickname')}
            InputProps={{ startAdornment: startIcon(<Wallet size={18} />) }}
            error={Boolean(errors.nickname)}
            helperText={errors.nickname?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => (
              <TextField
                label="Account number"
                placeholder="Enter digits"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(formatAccountNumber(e.target.value))}
                onBlur={field.onBlur}
                inputRef={field.ref}
                InputProps={{ startAdornment: startIcon(<Hash size={18} />) }}
                error={Boolean(errors.accountNumber)}
                helperText={errors.accountNumber?.message}
                inputMode="numeric"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Customer ID"
            placeholder="Optional"
            fullWidth
            {...register('customerId')}
            InputProps={{ startAdornment: startIcon(<IdCard size={18} />) }}
            error={Boolean(errors.customerId)}
            helperText={errors.customerId?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Net banking username"
            placeholder="Optional"
            fullWidth
            autoComplete="off"
            {...register('netbankingUsername')}
            InputProps={{ startAdornment: startIcon(<AtSign size={18} />) }}
            error={Boolean(errors.netbankingUsername)}
            helperText={errors.netbankingUsername?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Net banking password"
            placeholder="Securely encrypted"
            fullWidth
            type={showNetPass ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('netbankingPassword')}
            InputProps={{
              startAdornment: startIcon(<KeyRound size={18} />),
              endAdornment: passwordToggle(showNetPass, () => setShowNetPass((v) => !v)),
            }}
            error={Boolean(errors.netbankingPassword)}
            helperText={errors.netbankingPassword?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Profile password"
            placeholder="Securely encrypted"
            fullWidth
            type={showProfilePass ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('profilePassword')}
            InputProps={{
              startAdornment: startIcon(<KeyRound size={18} />),
              endAdornment: passwordToggle(showProfilePass, () => setShowProfilePass((v) => !v)),
            }}
            error={Boolean(errors.profilePassword)}
            helperText={errors.profilePassword?.message}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Notes"
            placeholder="Optional notes"
            fullWidth
            multiline
            minRows={3}
            {...register('notes')}
            InputProps={{ startAdornment: startIcon(<FileText size={18} />) }}
            error={Boolean(errors.notes)}
            helperText={errors.notes?.message}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Everything you enter here is encrypted in your browser before it reaches our servers.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={busy} loadingIndicator="Saving securely…">
              Save securely
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}

export type { BankPayloadInput };