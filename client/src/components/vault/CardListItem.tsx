import { useState, type MouseEvent } from 'react';
import { Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Nfc, ChevronRight, ShieldCheck } from 'lucide-react';
import type { CardPayload, VaultItem } from '../../types';
import { useDecrypt } from '../../hooks/useDecrypt';
import { FavoriteButton, ItemMenu, UpdatedTime } from './ItemActions';
import { PremiumCard } from './PremiumCard';
import { VaultItemDialog } from './VaultItemDialog';

export function CardListItem({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  favoriteBusy,
}: {
  item: VaultItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  favoriteBusy?: boolean;
}) {
  const payload = useDecrypt(item) as CardPayload | null;
  const [open, setOpen] = useState(false);

  /** The whole tile opens the modal, but nested controls (favorite, menu, preview eye) must not. */
  const openFromSurface = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, a, [role="menu"], [role="menuitem"]')) return;
    setOpen(true);
  };

  return (
    <>
      <Paper
        elevation={0}
        className="card-hover"
        onClick={openFromSurface}
        sx={{
          p: 2.5,
          borderRadius: 0,
          height: '100%',
          cursor: 'pointer',
          '& button, & a': { cursor: 'pointer' },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.dark',
              flexShrink: 0,
            }}
          >
            <Nfc size={22} style={{ color: 'rgba(15, 14, 14, 0.85)', flexShrink: 0 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {item.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.metadata.cardBrand ?? 'Credit card'} · ending {item.metadata.last4 ?? '••••'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FavoriteButton
              favorite={item.favorite}
              onToggle={onToggleFavorite}
              busy={favoriteBusy}
            />
            <ItemMenu onEdit={onEdit} onDelete={onDelete} />
          </Stack>
        </Stack>

        <Box sx={{ mt: 2, display: 'flex' }}>
          {payload ? (
            <PremiumCard card={payload as CardPayload} last4={item.metadata.last4} size="sm" />
          ) : (
            <Skeleton variant="rounded" width={240} height={151} sx={{ borderRadius: 0 }} />
          )}
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
          <Chip
            icon={<ShieldCheck size={13} />}
            label="CVV stored encrypted"
            size="small"
            sx={{ bgcolor: '#FBF3E4', color: '#B45309', fontSize: 11 }}
          />
          <UpdatedTime iso={item.updatedAt} />
        </Stack>

        <Button
          fullWidth
          variant="text"
          onClick={() => setOpen(true)}
          endIcon={<ChevronRight size={16} style={{ color: '#046B70' }} />}
          sx={{
            mt: 1.25,
            justifyContent: 'space-between',
            px: 2,
            bgcolor: '#F0EDE8',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: '#EBE7E0' },
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            View all details
          </Typography>
        </Button>
      </Paper>

      <VaultItemDialog item={item} payload={payload} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
