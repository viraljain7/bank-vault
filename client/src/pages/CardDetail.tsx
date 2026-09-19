import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Edit3, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SecretField, SecretFieldSkeleton } from '../components/ui/SecretField';
import { useVaultItem, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { CardPayload } from '../types';
import { PremiumCard } from '../components/vault/PremiumCard';

export function CardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { phase } = useVault();
  const { toast } = useToast();
  const enabled = phase === 'unlocked';
  const { data: item, isLoading } = useVaultItem(id, enabled);
  const payload = useDecrypt(item as never) as CardPayload | null;
  const mutations = useVaultMutations(enabled);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(id);
      toast('Card removed.');
      navigate('/cards');
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (isLoading || !item) {
    return (
      <Box>
        <PageHeader title="Card" />
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
        actions={
          <>
            <Button variant="outlined" startIcon={<Edit3 size={18} />} onClick={() => navigate(`/cards/${item._id}/edit`)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<Trash2 size={18} />} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <PremiumCard card={payload} last4={item.metadata.last4} />

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
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
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
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
            borderRadius: 2,
            bgcolor: '#FFF7ED',
            color: '#C2410C',
            typography: 'body2',
          }}
        >
          Security note: CVV/CVC, card PIN and OTP are intentionally not stored anywhere in your vault.
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${payload?.cardNickname || item.title}?`}
        message="This will permanently remove this credential from your vault."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}