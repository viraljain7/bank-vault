import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { Star } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { ItemListSkeleton } from '../components/ui/Skeletons';
import { useVaultItems, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { PageHeader } from '../components/ui/PageHeader';
import { BankAccountCard } from '../components/vault/BankAccountCard';
import { CardListItem } from '../components/vault/CardListItem';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { VaultItem } from '../types';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { phase } = useVault();
  const enabled = phase === 'unlocked';
  const { data, isLoading } = useVaultItems({ favorite: true }, enabled);
  const mutations = useVaultMutations(enabled);
  const { toast } = useToast();

  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const items = data ?? [];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(pendingDelete._id);
      toast('Credential removed.');
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Favorites" subtitle="Your starred credentials" />

      {isLoading && enabled ? (
        <ItemListSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Star size={32} />}
          title="No favorites yet"
          description="Star a bank account or card to keep it one tap away."
        />
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) =>
            item.type === 'bank' ? (
              <Grid size={{ xs: 12, md: 6 }} key={item._id}>
                <BankAccountCard
                  item={item}
                  onEdit={() => navigate(`/banks/${item._id}/edit`)}
                  onDelete={() => setPendingDelete(item)}
                  onToggleFavorite={() =>
                    mutations.toggleFavorite.mutate({ id: item._id, favorite: false })
                  }
                />
              </Grid>
            ) : (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item._id}>
                <CardListItem
                  item={item}
                  onEdit={() => navigate(`/cards/${item._id}/edit`)}
                  onDelete={() => setPendingDelete(item)}
                  onToggleFavorite={() =>
                    mutations.toggleFavorite.mutate({ id: item._id, favorite: false })
                  }
                  onOpen={() => navigate(`/cards/${item._id}`)}
                />
              </Grid>
            ),
          )}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title ?? 'credential'}?`}
        message="This will permanently remove this credential from your vault."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </Box>
  );
}