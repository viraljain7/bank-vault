import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { CreditCard } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { ItemListSkeleton } from '../components/ui/Skeletons';
import { useVaultItems, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { PageHeader, AddButton } from '../components/ui/PageHeader';
import { CardListItem } from '../components/vault/CardListItem';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { VaultItem } from '../types';

export function CardsPage() {
  const navigate = useNavigate();
  const { phase } = useVault();
  const enabled = phase === 'unlocked';
  const { data, isLoading } = useVaultItems({ type: 'card' }, enabled);
  const mutations = useVaultMutations(enabled);
  const { toast } = useToast();

  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cards = data ?? [];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(pendingDelete._id);
      toast('Card removed.');
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
        title="Cards"
        subtitle="End-to-end encrypted · PIN, OTP & 3DS never stored"
        actions={<AddButton to="/cards/new" label="Add Card" />}
      />

      {isLoading && enabled ? (
        <ItemListSkeleton count={3} />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={32} />}
          title="No cards saved"
          description="Add a card to quickly access your stored card details."
          actionLabel="Add Card"
          onAction={() => navigate('/cards/new')}
        />
      ) : (
        <Grid container spacing={2.5}>
          {cards.map((item) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item._id}>
              <CardListItem
                item={item}
                onEdit={() => navigate(`/cards/${item._id}/edit`)}
                onDelete={() => setPendingDelete(item)}
                onToggleFavorite={() =>
                  mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
                }
                onOpen={() => navigate(`/cards/${item._id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title ?? 'card'}?`}
        message="This will permanently remove this credential from your vault."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </Box>
  );
}