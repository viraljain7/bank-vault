import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  AtSign,
  CalendarClock,
  Hash,
  IdCard,
  KeyRound,
  Lock,
  LockKeyhole,
  Nfc,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { SecretField } from '../ui/SecretField';
import type { BankPayload, CardPayload } from '../../types';

/** Inline reassurance that the value was decrypted in-browser, never by the server. */
function BrowserOnlyNote() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 1,
        bgcolor: '#E8F5EC',
        color: '#157F3C',
        typography: 'body2',
      }}
    >
      <ShieldCheck size={15} style={{ flexShrink: 0 }} />
      This credential is decrypted only in your browser.
    </Box>
  );
}

function NotesBlock({ notes }: { notes: string }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        Notes
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 0, whiteSpace: 'pre-wrap' }}>
        {notes}
      </Paper>
    </Box>
  );
}

/**
 * Full field set for a bank credential.
 *
 * Shared by the read-only detail modal and the standalone detail page so the
 * two can never drift — this is the single definition of "all details".
 */
export function BankFields({ payload, resourceId }: { payload: BankPayload; resourceId?: string }) {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Account Number"
          icon={<Hash size={16} />}
          value={payload.accountNumber}
          resourceType="bank"
          resourceId={resourceId}
          emptyLabel=""
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Customer ID"
          icon={<IdCard size={16} />}
          value={payload.customerId}
          resourceType="bank"
          resourceId={resourceId}
          sensitivity="high"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Net Banking Username"
          icon={<AtSign size={16} />}
          value={payload.netbankingUsername}
          resourceType="bank"
          resourceId={resourceId}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Net Banking Password"
          icon={<KeyRound size={16} />}
          value={payload.netbankingPassword}
          resourceType="bank"
          resourceId={resourceId}
          sensitivity="high"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Profile Password"
          icon={<Lock size={16} />}
          value={payload.profilePassword}
          resourceType="bank"
          resourceId={resourceId}
          sensitivity="high"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BrowserOnlyNote />
      </Grid>
      {payload.notes && (
        <Grid size={{ xs: 12 }}>
          <NotesBlock notes={payload.notes} />
        </Grid>
      )}
    </Grid>
  );
}

/** Full field set for a card credential. See {@link BankFields} for why this is shared. */
export function CardFields({ payload, resourceId }: { payload: CardPayload; resourceId?: string }) {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Card Number"
          icon={<Nfc size={16} />}
          value={payload.cardNumber}
          resourceType="card"
          resourceId={resourceId}
          sensitivity="high"
          autoHideMs={15_000}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Cardholder Name"
          icon={<UserRound size={16} />}
          value={payload.cardholderName}
          resourceType="card"
          resourceId={resourceId}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="Expiry"
          icon={<CalendarClock size={16} />}
          value={`${payload.expiryMonth}/${payload.expiryYear}`}
          resourceType="card"
          resourceId={resourceId}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SecretField
          label="CVV / CVC"
          icon={<LockKeyhole size={16} />}
          value={payload.cvv}
          resourceType="card"
          resourceId={resourceId}
          sensitivity="high"
          autoHideMs={15_000}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BrowserOnlyNote />
      </Grid>
      {payload.notes && (
        <Grid size={{ xs: 12 }}>
          <NotesBlock notes={payload.notes} />
        </Grid>
      )}
    </Grid>
  );
}
