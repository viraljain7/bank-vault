import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { Landmark } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { ItemListSkeleton } from '../components/ui/Skeletons';
import { useVaultItems, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { PageHeader, AddButton } from '../components/ui/PageHeader';
import { BankAccountCard } from '../components/vault/BankAccountCard';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { VaultItem } from '../types';

export function BankAccountsPage() {
  const navigate = useNavigate();
  const { phase } = useVault();
  const enabled = phase === 'unlocked';
  const { data, isLoading } = useVaultItems({ type: 'bank' }, enabled);
  const mutations = useVaultMutations(enabled);
  const { toast } = useToast();

  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const banks = data ?? [];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(pendingDelete._id);
      toast('Bank account removed.');
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Bank Accounts"
        subtitle="Securely stored and encrypted end-to-end"
        actions={<AddButton to="/banks/new" label="Add Bank Account" />}
      />

      {isLoading && enabled ? (
        <ItemListSkeleton count={3} />
      ) : banks.length === 0 ? (
        <EmptyState
          icon={<Landmark size={32} />}
          title="No bank accounts yet"
          description="Secure your first banking credential inside your private vault."
          actionLabel="Add Bank Account"
          onAction={() => navigate('/banks/new')}
        />
      ) : (
        <Grid container spacing={2.5}>
          {banks.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item._id}>
              <BankAccountCard
                item={item}
                onEdit={() => navigate(`/banks/${item._id}/edit`)}
                onDelete={() => setPendingDelete(item)}
                onToggleFavorite={() =>
                  mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title ?? 'bank account'}?`}
        message="This will permanently remove this credential from your vault."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </Box>
  );
}