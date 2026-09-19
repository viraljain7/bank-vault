import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { Building2, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BankPayload, VaultItem } from '../../types';
import { useDecrypt } from '../../hooks/useDecrypt';
import { FavoriteButton, ItemMenu, UpdatedTime } from './ItemActions';
import { PremiumBankCard } from './PremiumBankCard';

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
  const payload = useDecrypt(item);

  return (
    <Paper elevation={0} className="card-hover" sx={{ p: 2.5, borderRadius: 1, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #EAF0FF 0%, #DCE6FD 100%)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
        <Building2 size={ 22} style={{ color: 'rgba(15, 14, 14, 0.85)', flexShrink: 0 }} />

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
          <FavoriteButton favorite={item.favorite} onToggle={onToggleFavorite} busy={favoriteBusy} />
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
              borderRadius: 3,
              bgcolor: 'rgba(5,150,105,0.12)',
            }}
          />
        )}
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip
          icon={<ShieldCheck size={13} />}
          label="End-to-end encrypted"
          size="small"
          sx={{ bgcolor: '#ECFDF3', color: '#15803D', fontSize: 11 }}
        />
        <UpdatedTime iso={item.updatedAt} />
      </Box>

      <Button
        component={Link}
        to={`/banks/${item._id}`}
        endIcon={<ChevronRight size={16} style={{ color: 'primary.main' }} />}
        fullWidth
        variant="text"
        sx={{ mt: 1.5, justifyContent: 'space-between', px: 2, bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: '#EEF2FF' } }}
      >
        <Typography variant="body2" fontWeight={600}>Open vault entry</Typography>
      </Button>
    </Paper>
  );
}