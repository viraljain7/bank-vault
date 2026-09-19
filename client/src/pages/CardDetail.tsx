import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Edit3 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SecretField, SecretFieldSkeleton } from '../components/ui/SecretField';
import { useVaultItem } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import type { CardPayload } from '../types';
import { PremiumCard } from '../components/vault/PremiumCard';

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
        <Stack spacing={1.5} sx={{ maxWidth: 680 }}>
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="fade-in" sx={{ maxWidth: 680 }}>
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

      <PremiumCard card={payload} last4={item.metadata.last4} />

      <Paper elevation={0} sx={{ p: 3, borderRadius: 1, mt: 3 }}>
        {payload ? (
          <Stack spacing={2.5}>
            <SecretField label="Card Number" value={payload.cardNumber} resourceType="card" resourceId={id} sensitivity="high" autoHideMs={15_000} />
            <SecretField label="Cardholder Name" value={payload.cardholderName} resourceType="card" resourceId={id} />
            <SecretField label="Expiry" value={`${payload.expiryMonth}/${payload.expiryYear}`} resourceType="card" resourceId={id} />
            {payload.notes && (
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  {payload.notes}
                </Paper>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <SecretFieldSkeleton />
            <SecretFieldSkeleton />
            <SecretFieldSkeleton />
          </Stack>
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
          Security note: CVV/CVC, card PIN and OTP are intentionally not stored anywhere in your vault.
        </Box>
      </Paper>
    </Box>
  );
}