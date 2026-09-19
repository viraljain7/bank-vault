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
  banks: {
    bg: 'linear-gradient(135deg, #EEF3FF 0%, #FFFFFF 100%)',
    line: 'linear-gradient(90deg, #2563EB, rgba(37,99,235,0))',
    border: 'rgba(37,99,235,0.16)',
    chip: '#E0E9FF',
    text: '#2563EB',
    glow: 'rgba(37,99,235,0.18)',
  },
  cards: {
    bg: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
    line: 'linear-gradient(90deg, #059669, rgba(5,150,105,0))',
    border: 'rgba(5,150,105,0.16)',
    chip: '#D9F4E6',
    text: '#059669',
    glow: 'rgba(5,150,105,0.16)',
  },
  favorites: {
    bg: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
    line: 'linear-gradient(90deg, #B45309, rgba(180,83,9,0))',
    border: 'rgba(180,83,9,0.16)',
    chip: '#FCEFC7',
    text: '#B45309',
    glow: 'rgba(180,83,9,0.15)',
  },
  vault: {
    bg: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)',
    line: 'linear-gradient(90deg, #6D28D9, rgba(109,40,217,0))',
    border: 'rgba(109,40,217,0.16)',
    chip: '#EBE4FD',
    text: '#6D28D9',
    glow: 'rgba(109,40,217,0.16)',
  },
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
  tone: { bg: string; line: string; border: string; chip: string; text: string; glow: string };
  hint?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 2.5,
        pr: { xs: 2.5, sm: 3 },
        height: '100%',
        borderRadius: 1.5,
        background: tone.bg,
        border: '1px solid',
        borderColor: tone.border,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 16px 34px -8px ${tone.glow}`,
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tone.line }} />
      <Box
        sx={{
          position: 'absolute',
          top: -38,
          right: -38,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tone.glow} 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: tone.chip,
            color: tone.text,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.65)',
          }}
        >
          {icon}
        </Box>
        {hint && (
          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: 6,
              bgcolor: tone.chip,
              color: tone.text,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {hint}
          </Box>
        )}
      </Stack>

      <Typography
        sx={{
          mt: 2.25,
          fontSize: { xs: '1.8rem', sm: '2rem' },
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: '#0F172A',
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary', mt: 0.75 }}>
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
        sx={{ mb: 3, }}
      >
        <Box
        >
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
          <StatCard icon={<Landmark size={21} />} label="Bank Accounts" value={overview.data?.banks ?? 0} tone={STAT_TONES.banks} hint={`${totalCount} total`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<CreditCard size={21} />} label="Cards" value={overview.data?.cards ?? 0} tone={STAT_TONES.cards} hint="AES-256" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<Star size={21} />} label="Favorites" value={overview.data?.favorites ?? 0} tone={STAT_TONES.favorites} hint="Quick access" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<ShieldCheck size={21} />} label="Vault Status" value="Protected" tone={STAT_TONES.vault} hint={phase === 'unlocked' ? 'Unlocked' : 'Locked'} />
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