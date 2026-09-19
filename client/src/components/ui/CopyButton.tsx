import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Check, Copy } from 'lucide-react';
import { copySecret } from '../../lib/clipboard';

interface CopyButtonProps {
  value: string;
  label?: string;
  /** Action reported to the activity feed on successful copy. */
  onCopied?: () => void;
  disabled?: boolean;
}

/**
 * Secure copy button.
 *  - copies the secret silently (never displayed in a toast)
 *  - shows a brief "Copied" affordance
 *  - clears the clipboard again after a timeout where possible
 *  - never logs or announces the actual value
 */
export function CopyButton({ value, label = 'Copy', onCopied, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copySecret(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  const labelText = copied ? 'Copied' : label;

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {copied && (
        <Typography component="span" variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
          Copied
        </Typography>
      )}
      <Tooltip title={labelText} describeChild>
        <IconButton
          aria-label={labelText}
          size="small"
          onClick={handleCopy}
          disabled={disabled || !value}
          sx={{
            border: '1px solid',
            borderColor: copied ? 'success.main' : 'divider',
            color: copied ? 'success.main' : 'text.secondary',
            '&:hover': { borderColor: copied ? 'success.main' : 'text.secondary' },
            transition: 'all 180ms ease',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}