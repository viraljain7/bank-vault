import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CardPayloadInput, CARD_BRANDS, cardPayloadSchema, detectCardBrand } from '../../schemas/vaultSchemas';
import { formatCardNumber } from '../../lib/format';

const currentYear = () => Number(new Date().getFullYear());

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
      <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
        <Alert severity="info" icon={false} sx={{ borderRadius: 2 }}>
          <strong>Security code:</strong> For your security, CVV/CVC is never stored in VaultBank.
        </Alert>

        <TextField
          label="Card nickname"
          placeholder="e.g. Primary Visa"
          {...register('cardNickname')}
          error={Boolean(errors.cardNickname)}
          helperText={errors.cardNickname?.message}
        />

        <TextField
          label="Cardholder name"
          placeholder="Name on card"
          {...register('cardholderName')}
          error={Boolean(errors.cardholderName)}
          helperText={errors.cardholderName?.message}
        />

        <Controller
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <TextField
              label="Card number"
              placeholder="1234 5678 9012 3456"
              value={field.value}
              onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={Boolean(errors.cardNumber)}
              helperText={errors.cardNumber?.message}
              inputMode="numeric"
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Expiry month"
            value={expiryMonth}
            onChange={(e) => setValue('expiryMonth', e.target.value)}
            error={Boolean(errors.expiryMonth)}
            helperText={errors.expiryMonth?.message}
            sx={{ flex: 1 }}
          >
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Expiry year"
            value={expiryYear}
            onChange={(e) => setValue('expiryYear', e.target.value)}
            error={Boolean(errors.expiryYear)}
            helperText={errors.expiryYear?.message}
            sx={{ flex: 1 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          select
          label="Card brand"
          {...register('cardBrand')}
          error={Boolean(errors.cardBrand)}
          helperText={errors.cardBrand?.message ?? 'Auto-detected from the card number'}
        >
          {CARD_BRANDS.map((brand) => (
            <MenuItem key={brand} value={brand}>
              {brand}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Notes"
          placeholder="Optional notes"
          multiline
          minRows={3}
          {...register('notes')}
          error={Boolean(errors.notes)}
          helperText={errors.notes?.message}
        />

        <Alert severity="info" icon={false} sx={{ borderRadius: 2 }}>
          <strong>CVV/CVC is intentionally not stored.</strong> Card PIN, OTP and 3DS codes are also
          never saved. This keeps your vault safe from becoming a target.
        </Alert>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Card data is encrypted in your browser before it reaches our servers.
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

export type { CardPayloadInput };