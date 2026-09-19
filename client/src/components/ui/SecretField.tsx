import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { reportActivity } from '../../crypto/sessionKey';
import { SENSITIVE_REVEAL_TIMEOUT_MS, type AuditResourceType } from '../../types';
import { CopyButton } from './CopyButton';
import { maskGeneric } from '../../lib/format';

export interface SecretFieldProps {
  label: string;
  value: string;
  icon?: ReactNode;
  sensitivity?: 'standard' | 'high';
  /** How long a revealed value stays visible (only applies to 'high'). */
  autoHideMs?: number;
  /** Hidden from reveal entirely (e.g. per product rules). */
  revealDisabled?: boolean;
  disabled?: boolean;
  resourceType?: AuditResourceType;
  resourceId?: string;
  emptyLabel?: string;
}

/**
 * Reusable masked / revealable secret field.
 *
 * - Masked by default; never exposes the value to screen readers while masked.
 * - Eye toggle to reveal / hide with keyboard access.
 * - 'high' sensitivity requires an explicit confirmation dialog before the
 *   value is shown, and auto-hides again after `autoHideMs`.
 * - Copy button never surfaces the copied value.
 */
export function SecretField({
  label,
  value,
  icon,
  sensitivity = 'standard',
  autoHideMs = SENSITIVE_REVEAL_TIMEOUT_MS,
  revealDisabled,
  disabled,
  resourceType = 'bank',
  resourceId,
  emptyLabel = 'Not set',
}: SecretFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [hiding, setHiding] = useState(false);
  const isHigh = sensitivity === 'high';

  const clearAutoHide = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };

  const hide = useCallback(() => {
    clearAutoHide();
    setHiding(true);
    setTimeout(() => {
      setRevealed(false);
      setHiding(false);
    }, 150);
  }, [autoHideTimer]);

  useEffect(() => {
    return () => clearAutoHide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestReveal = () => {
    if (isHigh) {
      setConfirmOpen(true);
      return;
    }
    showValue();
  };

  const confirmReveal = () => {
    setConfirmOpen(false);
    showValue();
  };

  const showValue = () => {
    if (revealDisabled || disabled || !value) return;
    setRevealed(true);
    reportActivity('REVEAL', resourceType, resourceId);
    if (isHigh) {
      clearAutoHide();
      setAutoHideTimer(setTimeout(() => hide(), autoHideMs));
    }
  };

  const toggle = () => {
    if (revealed) {
      hide();
    } else {
      requestReveal();
    }
  };

  const hasValue = Boolean(value);
  const displayValue = revealed && hasValue ? value : maskGeneric(hasValue ? value : undefined);

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          px: 1.5,
          py: 1,
          bgcolor: 'background.paper',
          transition: 'opacity 150ms ease',
          opacity: hiding ? 0.5 : 1,
        }}
      >
        {icon && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', color: 'text.secondary', flexShrink: 0 }}>
            {icon}
          </Box>
        )}
        <Typography
          component="span"
          sx={{
            fontFamily: revealed ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
            flex: 1,
            overflowWrap: 'anywhere',
            minHeight: 24,
            lineHeight: 1.4,
          }}
        >
          {hasValue ? displayValue : emptyLabel}
        </Typography>

        {!revealed && (
          <button
            type="button"
            aria-label={`Reveal ${label}`}
            onClick={toggle}
            disabled={disabled || !hasValue}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'inline-flex',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <Eye size={18} />
          </button>
        )}
        {revealed && (
          <button
            type="button"
            aria-label={`Hide ${label}`}
            onClick={toggle}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'inline-flex',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <EyeOff size={18} />
          </button>
        )}

        <CopyButton
          value={hasValue ? value : ''}
          disabled={!hasValue || disabled}
          onCopied={() => reportActivity('COPY', resourceType, resourceId)}
        />
      </Box>

      {isHigh && hasValue && !revealed && (
        <Typography variant="caption" sx={{ color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <AlertTriangle size={13} /> Highly sensitive — shown only after confirmation.
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} color="#D97706" />
          Reveal sensitive information?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            This information is highly sensitive. It will auto-hide shortly after being revealed.
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Reveal <strong>{label}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disableElevation>
            Cancel
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={confirmReveal}
            startIcon={revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          >
            Reveal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function SecretFieldSkeleton() {
  return (
    <Box>
      <Box className="skeleton-shimmer" sx={{ width: 120, height: 12, mb: 1 }} />
      <Box className="skeleton-shimmer" sx={{ height: 44 }} />
    </Box>
  );
}