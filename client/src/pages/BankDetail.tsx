import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Landmark } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DetailSkeleton } from '../components/ui/Skeletons';
import { SecretField, SecretFieldSkeleton } from '../components/ui/SecretField';
import { useVaultItem, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { BankPayload } from '../types';
import { Button } from '@mui/material';
import { Edit3, Trash2 } from 'lucide-react';

export function BankDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { phase } = useVault();
  const { toast } = useToast();
  const enabled = phase === 'unlocked';
  const { data: item, isLoading } = useVaultItem(id, enabled);
  const payload = useDecrypt(item as never) as BankPayload | null;
  const mutations = useVaultMutations(enabled);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(id);
      toast('Bank account removed.');
      navigate('/banks');
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (isLoading || !item) {
    return (
      <Box>
        <PageHeader title="Bank Account" />
        <DetailSkeleton />
      </Box>
    );
  }

  return (
    <Box className="fade-in" sx={{ maxWidth: 680 }}>
      <PageHeader
        title={payload?.nickname || item.title || 'Bank account'}
        subtitle={payload?.bankName ?? item.metadata.bankName}
        actions={
          <>
            <Button variant="outlined" startIcon={<Edit3 size={18} />} onClick={() => navigate(`/banks/${item._id}/edit`)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<Trash2 size={18} />} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 2,
            px: 1.75,
            py: 1.25,
            mb: 2.5,
            background: 'linear-gradient(135deg, #EAF0FF 0%, #F5F8FF 100%)',
            border: '1px solid',
            borderColor: '#DCE6FD',
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
            <Landmark size={17} />
          </Box>
          <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 700 }}>
            {item.metadata.bankName ?? item.title}
          </Typography>
        </Box>

        {payload ? (
          <Stack spacing={2.5}>
            <SecretField label="Account Number" value={payload.accountNumber} resourceType="bank" resourceId={id} emptyLabel="" />
            <SecretField label="Customer ID" value={payload.customerId} resourceType="bank" resourceId={id} sensitivity="high" />
            <SecretField label="Net Banking Username" value={payload.netbankingUsername} resourceType="bank" resourceId={id} />
            <SecretField label="Net Banking Password" value={payload.netbankingPassword} resourceType="bank" resourceId={id} sensitivity="high" />
            <SecretField label="Profile Password" value={payload.profilePassword} resourceType="bank" resourceId={id} sensitivity="high" />
            {payload.notes && (
              <Box>
                <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
                  Notes
                </Box>
                <Paper variant="outlined" sx={{ mt: 0.5, p: 1.5, borderRadius: 2 }}>
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
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${payload?.nickname || item.title}?`}
        message="This will permanently remove this credential from your vault."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}