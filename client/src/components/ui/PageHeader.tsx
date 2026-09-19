import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function AddButton({ to, label }: { to: string; label: string }) {
  return (
    <Button component={Link} to={to} variant="contained" startIcon={<Plus size={18} />}>
      {label}
    </Button>
  );
}