import type { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  type SlideProps,
} from '@mui/material';

function SlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

/** Accessible modal wrapper: Escape closes, focus is trapped by MUI Dialog. */
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="modal-title"
    >
      <DialogTitle id="modal-title">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={busy} autoFocus>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={busy}
          color={danger ? 'error' : 'primary'}
          variant="contained"
          sx={danger ? { bgcolor: 'error.main' } : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}