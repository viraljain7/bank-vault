import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { CalendarClock, Edit3, LockKeyhole, Nfc, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SecretField, SecretFieldSkeleton } from '../components/ui/SecretField';
import { useVaultItem } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import type { CardPayload } from '../types';

export function CardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { phase } = useVault();
  const enabled = phase === 'unlocked';
  const { data: item, isLoading } = useVaultItem(id, enabled);
  const payload = useDecrypt(item as never) as CardPayload | null;

  if (isLoading || !item) {
    return (
      <Box>
        <PageHeader title="Card" backTo="/cards" />
        <Stack spacing={1.5} >
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="fade-in" >
      <PageHeader
        title={payload?.cardNickname || item.title || 'Card'}
        subtitle={item.metadata.cardBrand}
        backTo="/cards"
        actions={
          <Button
            variant="outlined"
            startIcon={<Edit3 size={18} />}
            onClick={() => navigate(`/cards/${item._id}/edit`)}
          >
            Edit
          </Button>
        }
      />


      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mt: 3 }}>
        {payload ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Card Number" icon={<Nfc size={16} />} value={payload.cardNumber} resourceType="card" resourceId={id} sensitivity="high" autoHideMs={15_000} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Cardholder Name" icon={<UserRound size={16} />} value={payload.cardholderName} resourceType="card" resourceId={id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Expiry" icon={<CalendarClock size={16} />} value={`${payload.expiryMonth}/${payload.expiryYear}`} resourceType="card" resourceId={id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="CVV / CVC" icon={<LockKeyhole size={16} />} value={payload.cvv} resourceType="card" resourceId={id} sensitivity="high" autoHideMs={15_000} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: 1,
                  px: 1.25,
                  py: 1,
                  bgcolor: '#ECFDF3',
                  color: '#15803D',
                  typography: 'body2',
                }}
              >
                <ShieldCheck size={15} />
                This credential is decrypted only in your browser.
              </Box>
            </Grid>
            {payload.notes && (
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                    {payload.notes}
                  </Paper>
                </Box>
              </Grid>
            )}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}><SecretFieldSkeleton /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SecretFieldSkeleton /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SecretFieldSkeleton /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SecretFieldSkeleton /></Grid>
          </Grid>
        )}

        <Box
          sx={{
            mt: 3,
            p: 1.5,
            borderRadius: 1,
            bgcolor: '#FFF7ED',
            color: '#C2410C',
            typography: 'body2',
          }}
        >
          Security note: card PIN, OTP and 3DS codes are never stored. The CVV is stored encrypted
          end-to-end and revealed only when you choose to.
        </Box>
      </Paper>
    </Box>
  );
}