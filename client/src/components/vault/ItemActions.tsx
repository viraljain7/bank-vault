import { Chip, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { Edit3, MoreVertical, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { VaultItem } from '../../types';
import { timeAgo } from '../../lib/format';

export function FavoriteButton({
  favorite,
  onToggle,
  busy,
}: {
  favorite: boolean;
  onToggle: () => void;
  busy?: boolean;
}) {
  return (
    <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'} describeChild>
      <IconButton
        size="small"
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        disabled={busy}
        onClick={onToggle}
        sx={{ color: favorite ? '#F59E0B' : 'text.secondary' }}
      >
        <Star size={18} fill={favorite ? 'currentColor' : 'none'} />
      </IconButton>
    </Tooltip>
  );
}

export function ItemMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="More actions" describeChild>
        <IconButton
          size="small"
          aria-label="More actions"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertical size={18} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onEdit();
          }}
        >
          <Edit3 size={16} style={{ marginRight: 10 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 10 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function TypeChip({ type }: { type: VaultItem['type'] }) {
  return (
    <Chip
      label={type === 'bank' ? 'Bank account' : 'Card'}
      size="small"
      sx={{
        bgcolor: type === 'bank' ? '#EBEFFF' : '#E7F6EC',
        color: type === 'bank' ? '#1D4ED8' : '#15803D',
        fontWeight: 600,
      }}
    />
  );
}

export function UpdatedTime({ iso }: { iso: string }) {
  return <Typography variant="caption" sx={{ color: 'text.secondary' }}>{timeAgo(iso)}</Typography>;
}