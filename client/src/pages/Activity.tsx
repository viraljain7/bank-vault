import { Box, Paper, Typography } from '@mui/material';
import {
  Activity as ActivityIcon,
  Clock,
  Copy,
  Edit3,
  Eye,
  FolderLock,
  KeyRound,
  Lock,
  Search,
  Trash2,
  UnlockKeyhole,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeletons';
import { useActivity } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { formatDateTime, timeAgo } from '../lib/format';
import type { AuditAction } from '../types';

const ACTION_META: Record<AuditAction, { icon: React.ReactNode; color: string; label: string }> = {
  CREATE: { icon: <Edit3 size={16} />, color: '#1D4ED8', label: 'Credential created' },
  UPDATE: { icon: <Edit3 size={16} />, color: '#1D4ED8', label: 'Credential updated' },
  DELETE: { icon: <Trash2 size={16} />, color: '#B91C1C', label: 'Credential deleted' },
  REVEAL: { icon: <Eye size={16} />, color: '#B45309', label: 'Sensitive value revealed' },
  COPY: { icon: <Copy size={16} />, color: '#15803D', label: 'Value copied' },
  LOGIN: { icon: <KeyRound size={16} />, color: '#1D4ED8', label: 'Signed in' },
  LOCK: { icon: <Lock size={16} />, color: '#6B7280', label: 'Vault locked' },
  UNLOCK: { icon: <UnlockKeyhole size={16} />, color: '#15803D', label: 'Vault unlocked' },
  SETUP: { icon: <FolderLock size={16} />, color: '#1D4ED8', label: 'Vault set up' },
  SEARCH: { icon: <Search size={16} />, color: '#6B7280', label: 'Searched vault' },
  READ: { icon: <ActivityIcon size={16} />, color: '#6B7280', label: 'Credential opened' },
};

function ActionRow({ action, createdAt }: { action: AuditAction; createdAt: string }) {
  const meta = ACTION_META[action] ?? ACTION_META.READ;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: `${meta.color}1A`,
          color: meta.color,
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {meta.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {timeAgo(createdAt)}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
        {formatDateTime(createdAt)}
      </Typography>
    </Box>
  );
}

export function ActivityPage() {
  const { phase } = useVault();
  const { data, isLoading } = useActivity();
  const events = data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = events.filter((e) => new Date(e.createdAt) >= today);
  const earlierEvents = events.filter((e) => new Date(e.createdAt) < today);

  if (phase !== 'unlocked') return <TableSkeleton />;

  if (isLoading) return <TableSkeleton rows={8} />;

  return (
    <Box className="fade-in" >
      <PageHeader title="Security Activity" subtitle="A non-sensitive log of vault events" />

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        {events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Clock size={36} color="#9CA3AF" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No activity recorded yet.
            </Typography>
          </Box>
        )}

        {todayEvents.length > 0 && (
          <>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Today
            </Typography>
            {todayEvents.map((e) => (
              <ActionRow key={`${e.createdAt}-${e.action}`} action={e.action} createdAt={e.createdAt} />
            ))}
          </>
        )}

        {earlierEvents.length > 0 && (
          <Box sx={{ mt: todayEvents.length > 0 ? 3 : 0 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Earlier
            </Typography>
            {earlierEvents.map((e) => (
              <ActionRow key={`${e.createdAt}-${e.action}`} action={e.action} createdAt={e.createdAt} />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}