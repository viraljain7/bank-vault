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

type Tone = { chip: string; text: string };

const STAT_TONES: Record<'cards' | 'favorites', Tone> = {
  cards: { chip: '#E6F4F2', text: '#0F766E' },
  favorites: { chip: '#FBF3E4', text: '#B45309' },
};

/**
 * Two treatments, not four colours. The filled tiles carry the eye and sit on
 * opposite corners of the grid so the row reads as one rhythm; the plain tiles
 * stay on the warm surface. No gradients — the impact is the size of the
 * numeral against a solid field.
 */
function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
  fill,
  live,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
  fill?: string;
  live?: boolean;
}) {
  const solid = Boolean(fill);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: { xs: 2.5, sm: 3 },
        height: '100%',
        borderRadius: 0,
        bgcolor: solid ? fill : 'background.paper',
        border: solid ? '1px solid rgba(255,255,255,0.08)' : '1px solid',
        borderColor: solid ? undefined : 'divider',
        color: solid ? '#fff' : 'text.primary',
        transition: solid ? 'none' : 'border-color 160ms ease',
        '&:hover': solid ? {} : { borderColor: '#CFC8BD' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 38,
            height: 38,
            borderRadius: 0,
            bgcolor: solid ? 'rgba(255,255,255,0.14)' : tone?.chip,
            color: solid ? '#fff' : tone?.text,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="overline"
          sx={{ color: solid ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}
        >
          {label}
        </Typography>
        {live && (
          <Box
            className="pulse-dot"
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#3DD68C',
              ml: 'auto',
              mr: 0.25,
            }}
          />
        )}
      </Box>

      <Typography
        className="tabular"
        sx={{
          mt: 2.5,
          fontSize: solid
            ? { xs: '2.75rem', sm: '3.25rem' }
            : { xs: '1.875rem', sm: '2.125rem' },
          fontWeight: 700,
          lineHeight: 1,
          color: solid ? '#fff' : 'text.primary',
        }}
      >
        {value}
      </Typography>

      {hint && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1.25, color: solid ? 'rgba(255,255,255,0.82)' : 'text.secondary' }}
        >
          {hint}
        </Typography>
      )}
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
        sx={{ mb: 3, }}
      >
        <Box
        >
          <Typography variant="h1">{greeting()}, {firstName}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Items are encrypted on this device before they are sent to the server.
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

      {/* Stats — filled tile top-left and bottom-right, plain tiles between */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            icon={<Landmark size={20} />}
            label="Bank Accounts"
            value={overview.data?.banks ?? 0}
            hint={`${totalCount} items saved in total`}
            fill="#1F6B4A"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            icon={<CreditCard size={20} />}
            label="Cards"
            value={overview.data?.cards ?? 0}
            hint="CVV numbers stored encrypted"
            tone={STAT_TONES.cards}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            icon={<Star size={20} />}
            label="Favorites"
            value={overview.data?.favorites ?? 0}
            hint="Starred for quick access"
            tone={STAT_TONES.favorites}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            icon={<ShieldCheck size={20} />}
            label="Vault Status"
            value={phase === 'unlocked' ? 'Unlocked' : 'Protected'}
            hint={phase === 'unlocked' ? 'Tap Protected above to lock' : 'Nothing to unlock'}
            fill="#1C1A18"
            live={phase === 'unlocked'}
          />
        </Grid>
      </Grid>

      {/* Security strip */}
      <Paper
        elevation={0}
        sx={{
          mt: 2.5,
          p: 2,
          px: 2.5,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ width: 40, height: 40, borderRadius: 0, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff', flexShrink: 0 }}>
          <LockKeyhole size={20} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">End-to-end encrypted vault</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            Encrypted with AES-256-GCM on this device. CVV numbers are stored encrypted too, and PINs, OTPs and 3DS codes are never stored at all.
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
            The last four items you changed
          </Typography>
        </Box>
        <Button variant="text" size="small" onClick={() => navigate('/activity')}>
          View activity
        </Button>
      </Stack>

      {isEmpty || recent.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 0, mt: 1 }}>
          <EmptyState
            icon={<LockKeyhole size={30} />}
            title="Nothing saved yet"
            description="Add a bank account or a card to get started. Anything you save is encrypted on this device first."
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