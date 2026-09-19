import type { ReactNode } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
}) {
  return (
    <Box
      className="fade-in"
      sx={{
        textAlign: 'center',
        py: 7,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(120% 120% at 30% 0%, #F5F8FF 0%, #EBF0FF 100%)',
          border: '1px dashed',
          borderColor: '#B8C7EC',
          color: 'primary.main',
          mb: 0.5,
        }}
      >
        {icon}
      </Box>
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{ bgcolor: '#EBF0FF', color: '#1D4ED8', fontWeight: 600 }}
        />
      )}
      <Box>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body2" sx={{ maxWidth: 380, mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}