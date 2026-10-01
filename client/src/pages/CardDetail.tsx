import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack } from '@mui/material';
import { Edit3 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SecretFieldSkeleton } from '../components/ui/SecretField';
import { CardFields } from '../components/vault/VaultFields';
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
        <Stack spacing={1.5}>
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
          <SecretFieldSkeleton />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
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

      <Paper elevation={0} sx={{ p: 3, borderRadius: 0, mt: 3 }}>
        {payload ? (
          <CardFields payload={payload} resourceId={id} />
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
          </Grid>
        )}

        <Box
          sx={{
            mt: 3,
            p: 1.5,
            borderRadius: 0,
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
