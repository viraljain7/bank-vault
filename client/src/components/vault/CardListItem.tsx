import { Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import type { CardPayload, VaultItem } from '../../types';
import { useDecrypt } from '../../hooks/useDecrypt';
import { FavoriteButton, ItemMenu, UpdatedTime } from './ItemActions';
import { PremiumCard } from './PremiumCard';

export function CardListItem({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  favoriteBusy,
  onOpen,
}: {
  item: VaultItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  favoriteBusy?: boolean;
  onOpen?: () => void;
}) {
  const payload = useDecrypt(item);

  return (
    <Paper elevation={0} className="card-hover" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.metadata.cardBrand ?? 'Credit card'} · ending {item.metadata.last4 ?? '••••'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <FavoriteButton favorite={item.favorite} onToggle={onToggleFavorite} busy={favoriteBusy} />
          <ItemMenu onEdit={onEdit} onDelete={onDelete} />
        </Stack>
      </Stack>

      <Box sx={{ mt: 2, display: 'flex' }}>
        {payload ? (
          <PremiumCard card={payload as CardPayload} last4={item.metadata.last4} size="sm" />
        ) : (
          <Skeleton variant="rounded" width={240} height={151} sx={{ borderRadius: 3 }} />
        )}
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1.5 }}
      >
        <Chip
          icon={<ShieldCheck size={13} />}
          label="CVV never stored"
          size="small"
          sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontSize: 11 }}
        />
        <UpdatedTime iso={item.updatedAt} />
      </Stack>

      <Button
        fullWidth
        variant="text"
        onClick={onOpen}
        sx={{ mt: 1.25, justifyContent: 'space-between', px: 2, '&:hover': { bgcolor: '#F8FAFC' } }}
      >
        <Typography variant="body2" fontWeight={600}>Open vault entry</Typography>
        <ChevronRight size={16} />
      </Button>
    </Paper>
  );
}