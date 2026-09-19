import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { CreditCard, Landmark, Plus, ShieldCheck, Star, LockKeyhole } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { DashboardSkeleton } from '../components/ui/Skeletons';
import { useVaultOverview, useVaultItems, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { greeting } from '../lib/format';
import { BankAccountCard } from '../components/vault/BankAccountCard';
import { CardListItem } from '../components/vault/CardListItem';
import { ConfirmDialog } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import type { VaultItem } from '../types';

const STAT_TONES = {
  banks: { soil: '#EBF0FF', text: 'primary.main' },
  cards: { soil: '#ECFDF3', text: 'success.main' },
  favorites: { soil: '#FFFBEB', text: '#B45309' },
  vault: { soil: '#EDE9FE', text: '#6D28D9' },
};

function StatCard({
  icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: { soil: string; text: string };
  hint?: string;
}) {
  return (
    <Paper elevation={0} className="card-hover" sx={{ p: 2.5, borderRadius: 1, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: tone.soil,
            color: tone.text,
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
          {hint}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ mt: 1.75, fontSize: '1.6rem', fontWeight: 800 }}>
        {value}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', mt: 0.25 }}>
        {label}
      </Typography>
    </Paper>
  );
}

export function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { phase } = useVault();
  const { toast } = useToast();

  const enabled = phase === 'unlocked';
  const overview = useVaultOverview(enabled);
  const items = useVaultItems({}, enabled);
  const mutations = useVaultMutations(enabled);

  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const recent = useMemo(() => (items.data ?? []).slice(0, 4), [items.data]);
  const totalCount = (overview.data?.banks ?? 0) + (overview.data?.cards ?? 0);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await mutations.remove.mutateAsync(pendingDelete._id);
      toast('Credential removed from your vault.');
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error' });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }, [pendingDelete, mutations.remove, toast]);

  if (enabled && (overview.isLoading || items.isLoading)) {
    return <DashboardSkeleton />;
  }

  const firstName = user?.firstName ?? user?.username ?? 'there';
  const isEmpty = (items.data ?? []).length === 0;

  return (
    <Box className="fade-in ">
      {/* Greeting + quick actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3,mt:2 }}
      >
        <Box>
          <Typography variant="h1">{greeting()}, {firstName}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Everything in your vault is encrypted before it reaches the server.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<CreditCard size={18} />} onClick={() => navigate('/cards/new')}>
            Add Card
          </Button>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/banks/new')}>
            Add Bank
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<Landmark size={19} />} label="Bank Accounts" value={overview.data?.banks ?? 0} tone={STAT_TONES.banks} hint={`${totalCount} total`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<CreditCard size={19} />} label="Cards" value={overview.data?.cards ?? 0} tone={STAT_TONES.cards} hint="AES-256" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<Star size={19} />} label="Favorites" value={overview.data?.favorites ?? 0} tone={STAT_TONES.favorites} hint="Quick access" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<ShieldCheck size={19} />} label="Vault Status" value="Protected" tone={STAT_TONES.vault} hint={phase === 'unlocked' ? 'Unlocked' : 'Locked'} />
        </Grid>
      </Grid>

      {/* Security strip */}
      <Paper
        elevation={0}
        sx={{
          mt: 2.5,
          p: 2,
          px: 2.5,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(90deg, #F8FAFC 0%, #EBF0FF 100%)',
          border: '1px solid',
          borderColor: '#DCE4F8',
        }}
      >
        <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff', flexShrink: 0 }}>
          <LockKeyhole size={20} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">End-to-end encrypted vault</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            AES-256-GCM client-side encryption · PBKDF2-SHA256 unlock key (210,000 rounds) · CVV encrypted end-to-end · PIN, OTP & 3DS never stored
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          onClick={() => navigate('/security')}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          View security
        </Button>
      </Paper>

      {/* Recent credentials */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 2 }}>
        <Box>
          <Typography variant="h3">Recent Credentials</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Your most recently updated vault items
          </Typography>
        </Box>
        <Button variant="text" size="small" onClick={() => navigate('/activity')}>
          View activity
        </Button>
      </Stack>

      {isEmpty || recent.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 1, mt: 1 }}>
          <EmptyState
            icon={<LockKeyhole size={30} />}
            title="Your vault is ready"
            description="Start by saving your first bank account or payment card. Everything you add is encrypted on this device before storage."
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, pb: 4 }}>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/banks/new')}>
              Add Bank Account
            </Button>
            <Button variant="outlined" startIcon={<CreditCard size={18} />} onClick={() => navigate('/cards/new')}>
              Add Card
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {recent.map((item) =>
            item.type === 'bank' ? (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item._id}>
                <BankAccountCard
                  item={item}
                  onEdit={() => navigate(`/banks/${item._id}/edit`)}
                  onDelete={() => setPendingDelete(item)}
                  onToggleFavorite={() =>
                    mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
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
                    mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
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