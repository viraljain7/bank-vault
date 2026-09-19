import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { AtSign, Hash, IdCard, KeyRound, Building2, Lock, ShieldCheck } from 'lucide-react';
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
        <PageHeader title="Bank Account" backTo="/banks" />
        <DetailSkeleton />
      </Box>
    );
  }

  return (
    <Box className="fade-in" >
      <PageHeader
        title={payload?.nickname || item.title || 'Bank account'}
        subtitle={payload?.bankName ?? item.metadata.bankName}
        backTo="/banks"
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
            borderRadius: 1,
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
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
        <Building2 size={17} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />

          </Box>
          <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 700 }}>
            {item.metadata.bankName ?? item.title}
          </Typography>
        </Box>

        {payload ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Account Number" icon={<Hash size={16} />} value={payload.accountNumber} resourceType="bank" resourceId={id} emptyLabel="" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Customer ID" icon={<IdCard size={16} />} value={payload.customerId} resourceType="bank" resourceId={id} sensitivity="high" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Net Banking Username" icon={<AtSign size={16} />} value={payload.netbankingUsername} resourceType="bank" resourceId={id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Net Banking Password" icon={<KeyRound size={16} />} value={payload.netbankingPassword} resourceType="bank" resourceId={id} sensitivity="high" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField label="Profile Password" icon={<Lock size={16} />} value={payload.profilePassword} resourceType="bank" resourceId={id} sensitivity="high" />
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
                  <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
                    Notes
                  </Box>
                  <Paper variant="outlined" sx={{ mt: 0.5, p: 1.5, borderRadius: 1 }}>
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