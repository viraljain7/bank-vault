import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit3, Star } from 'lucide-react';
import { SecretFieldSkeleton } from '../ui/SecretField';
import { formatDateTime } from '../../lib/format';
import type { BankPayload, CardPayload, DecryptedPayload, VaultItem } from '../../types';
import { TypeChip, UpdatedTime } from './ItemActions';
import { BankFields, CardFields } from './VaultFields';

/**
 * Read-only modal that shows a credential in full.
 *
 * Replaces the "click through to a detail page" flow: the list card already
 * holds the decrypted payload in memory, so opening this needs no refetch and
 * no extra decryption round-trip.
 */
export function VaultItemDialog({
  item,
  payload,
  open,
  onClose,
}: {
  item: VaultItem;
  payload: DecryptedPayload | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isBank = item.type === 'bank';
  const bank = isBank ? (payload as BankPayload | null) : null;
  const card = isBank ? null : (payload as CardPayload | null);

  const title = bank?.nickname || card?.cardNickname || item.title;
  const subtitle =
    bank?.bankName ?? item.metadata.bankName ?? card?.cardBrand ?? item.metadata.cardBrand;

  const editPath = `/${isBank ? 'banks' : 'cards'}/${item._id}/edit`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="vault-item-dialog-title"
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle id="vault-item-dialog-title" sx={{ pb: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {isBank ? 'Bank account' : 'Credit card'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
            {item.metadata.last4 ? ` · ending ${item.metadata.last4}` : ''}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          <TypeChip type={item.type} />
          {item.favorite && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                bgcolor: '#FFF7ED',
                color: '#B45309',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Star size={13} style={{ flexShrink: 0 }} /> Favorite
            </Box>
          )}
          <UpdatedTime iso={item.updatedAt} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Created {formatDateTime(item.createdAt)}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {payload ? (
          isBank ? (
            <BankFields payload={bank!} resourceId={item._id} />
          ) : (
            <CardFields payload={card!} resourceId={item._id} />
          )
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretFieldSkeleton />
            </Grid>
          </Grid>
        )}

        <Box
          sx={{
            mt: 3,
            p: 1.5,
            bgcolor: '#FFF7ED',
            color: '#C2410C',
            typography: 'body2',
          }}
        >
          {isBank
            ? 'Security note: account credentials are stored encrypted end-to-end and each field is revealed only when you choose to.'
            : 'Security note: card PIN, OTP and 3DS codes are never stored. The CVV is stored encrypted end-to-end and revealed only when you choose to.'}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit3 size={18} />}
          onClick={() => {
            onClose();
            navigate(editPath);
          }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
