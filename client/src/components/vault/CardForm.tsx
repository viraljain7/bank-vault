import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  Calendar,
  CalendarClock,
  CreditCard,
  FileText,
  Nfc,
  Tag,
  UserRound,
} from 'lucide-react';
import { CardPayloadInput, CARD_BRANDS, cardPayloadSchema, detectCardBrand } from '../../schemas/vaultSchemas';
import { formatCardNumber } from '../../lib/format';

const currentYear = () => Number(new Date().getFullYear());

function startIcon(icon: ReactNode): ReactNode {
  return (
    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
      {icon}
    </InputAdornment>
  );
}

export function CardForm({
  defaultValues,
  onSubmit,
  busy,
  onCancel,
}: {
  defaultValues?: Partial<CardPayloadInput>;
  onSubmit: (payload: CardPayloadInput) => Promise<void> | void;
  busy?: boolean;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CardPayloadInput>({
    resolver: zodResolver(cardPayloadSchema),
    defaultValues: {
      cardNickname: '',
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cardBrand: 'Other',
      notes: '',
      ...defaultValues,
    },
  });

  const cardNumber = watch('cardNumber');
  const expiryMonth = watch('expiryMonth');
  const expiryYear = watch('expiryYear');

  useEffect(() => {
    const detected = detectCardBrand(getValues('cardNumber'));
    if (detected !== 'Other') setValue('cardBrand', detected as CardPayloadInput['cardBrand']);
  }, [cardNumber, getValues, setValue]);

  const years = Array.from({ length: 21 }, (_, i) => currentYear() + i);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
      <Grid container spacing={2.5} sx={{ maxWidth: 620 }}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" icon={false} sx={{ borderRadius: 1 }}>
            <strong>Security code:</strong> For your security, CVV/CVC is never stored in VaultBank.
          </Alert>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Card nickname"
            placeholder="e.g. Primary Visa"
            fullWidth
            {...register('cardNickname')}
            InputProps={{ startAdornment: startIcon(<CreditCard size={18} />) }}
            error={Boolean(errors.cardNickname)}
            helperText={errors.cardNickname?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Cardholder name"
            placeholder="Name on card"
            fullWidth
            {...register('cardholderName')}
            InputProps={{ startAdornment: startIcon(<UserRound size={18} />) }}
            error={Boolean(errors.cardholderName)}
            helperText={errors.cardholderName?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="cardNumber"
            control={control}
            render={({ field }) => (
              <TextField
                label="Card number"
                placeholder="1234 5678 9012 3456"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                onBlur={field.onBlur}
                inputRef={field.ref}
                InputProps={{ startAdornment: startIcon(<Nfc size={18} />) }}
                error={Boolean(errors.cardNumber)}
                helperText={errors.cardNumber?.message}
                inputMode="numeric"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Card brand"
            fullWidth
            {...register('cardBrand')}
            InputProps={{ startAdornment: startIcon(<Tag size={18} />) }}
            error={Boolean(errors.cardBrand)}
            helperText={errors.cardBrand?.message ?? 'Auto-detected from the card number'}
          >
            {CARD_BRANDS.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Expiry month"
            fullWidth
            value={expiryMonth}
            onChange={(e) => setValue('expiryMonth', e.target.value)}
            InputProps={{ startAdornment: startIcon(<Calendar size={18} />) }}
            error={Boolean(errors.expiryMonth)}
            helperText={errors.expiryMonth?.message}
          >
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Expiry year"
            fullWidth
            value={expiryYear}
            onChange={(e) => setValue('expiryYear', e.target.value)}
            InputProps={{ startAdornment: startIcon(<CalendarClock size={18} />) }}
            error={Boolean(errors.expiryYear)}
            helperText={errors.expiryYear?.message}
          >
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            ))}
          </TextField>
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
          <Alert severity="info" icon={false} sx={{ borderRadius: 1 }}>
            <strong>CVV/CVC is intentionally not stored.</strong> Card PIN, OTP and 3DS codes are also
            never saved. This keeps your vault safe from becoming a target.
          </Alert>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Card data is encrypted in your browser before it reaches our servers.
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

export type { CardPayloadInput };