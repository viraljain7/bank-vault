import { useState, type MouseEvent } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Building2, ChevronRight, ShieldCheck } from 'lucide-react';
import type { BankPayload, VaultItem } from '../../types';
import { useDecrypt } from '../../hooks/useDecrypt';
import { FavoriteButton, ItemMenu, UpdatedTime } from './ItemActions';
import { PremiumBankCard } from './PremiumBankCard';
import { VaultItemDialog } from './VaultItemDialog';

export function BankAccountCard({
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
  const last4 = item.metadata.last4;
  const bankName = item.metadata.bankName ?? 'Bank account';
  const payload = useDecrypt(item) as BankPayload | null;
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
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
              <Building2 size={22} style={{ color: 'rgba(15, 14, 14, 0.85)', flexShrink: 0 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap>
                {bankName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {item.title}
              </Typography>
            </Box>
          </Stack>
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
            <PremiumBankCard bank={payload as BankPayload} last4={last4} size="sm" />
          ) : (
            <Box
              sx={{
                width: 240,
                aspectRatio: '1.586',
                borderRadius: 0,
                bgcolor: 'rgba(5,150,105,0.12)',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Chip
            icon={<ShieldCheck size={13} />}
            label="End-to-end encrypted"
            size="small"
            sx={{ bgcolor: '#E8F5EC', color: '#157F3C', fontSize: 11 }}
          />
          <UpdatedTime iso={item.updatedAt} />
        </Box>

        <Button
          onClick={() => setOpen(true)}
          endIcon={<ChevronRight size={16} style={{ color: '#046B70' }} />}
          fullWidth
          variant="text"
          sx={{
            mt: 1.5,
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
