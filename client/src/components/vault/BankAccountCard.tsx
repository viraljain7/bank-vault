import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ChevronRight, Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VaultItem } from '../../types';
import { maskAccountNumber } from '../../lib/format';
import { FavoriteButton, ItemMenu, UpdatedTime } from './ItemActions';

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

  return (
    <Paper elevation={0} className="card-hover" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #EAF0FF 0%, #DCE6FD 100%)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Landmark size={22} />
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

      <Box
        sx={{
          mt: 2,
          px: 1.75,
          py: 1.25,
          borderRadius: 2,
          bgcolor: '#F8FAFC',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Account number
        </Typography>
        <Typography
          sx={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.02em',
            mt: 0.25,
          }}
        >
          {maskAccountNumber(last4)}
        </Typography>
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
        endIcon={<ChevronRight size={16} />}
        fullWidth
        variant="text"
        sx={{ mt: 1.5, justifyContent: 'space-between', px: 2, bgcolor: 'transparent', '&:hover': { bgcolor: '#F8FAFC' } }}
      >
        <Typography variant="body2" fontWeight={600}>Open vault entry</Typography>
      </Button>
    </Paper>
  );
}