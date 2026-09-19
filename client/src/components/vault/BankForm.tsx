import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { bankPayloadSchema, type BankPayloadInput } from '../../schemas/vaultSchemas';
import { formatAccountNumber } from '../../lib/format';

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

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
      <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
        <TextField
          label="Bank name"
          placeholder="e.g. HDFC Bank"
          {...register('bankName')}
          error={Boolean(errors.bankName)}
          helperText={errors.bankName?.message}
        />

        <TextField
          label="Account nickname"
          placeholder="e.g. Personal HDFC"
          {...register('nickname')}
          error={Boolean(errors.nickname)}
          helperText={errors.nickname?.message}
        />

        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <TextField
              label="Account number"
              placeholder="Enter digits"
              value={field.value}
              onChange={(e) => field.onChange(formatAccountNumber(e.target.value))}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={Boolean(errors.accountNumber)}
              helperText={errors.accountNumber?.message}
              inputMode="numeric"
            />
          )}
        />

        <TextField
          label="Customer ID"
          placeholder="Optional"
          {...register('customerId')}
          error={Boolean(errors.customerId)}
          helperText={errors.customerId?.message}
        />

        <TextField
          label="Net banking username"
          placeholder="Optional"
          autoComplete="off"
          {...register('netbankingUsername')}
          error={Boolean(errors.netbankingUsername)}
          helperText={errors.netbankingUsername?.message}
        />

        <TextField
          label="Net banking password"
          placeholder="Securely encrypted"
          type="password"
          autoComplete="new-password"
          {...register('netbankingPassword')}
          error={Boolean(errors.netbankingPassword)}
          helperText={errors.netbankingPassword?.message}
        />

        <TextField
          label="Profile password"
          placeholder="Securely encrypted"
          type="password"
          autoComplete="new-password"
          {...register('profilePassword')}
          error={Boolean(errors.profilePassword)}
          helperText={errors.profilePassword?.message}
        />

        <TextField
          label="Notes"
          placeholder="Optional notes"
          multiline
          minRows={3}
          {...register('notes')}
          error={Boolean(errors.notes)}
          helperText={errors.notes?.message}
        />

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Everything you enter here is encrypted in your browser before it reaches our servers.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={busy} loadingIndicator="Saving securely…">
            Save securely
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export type { BankPayloadInput };