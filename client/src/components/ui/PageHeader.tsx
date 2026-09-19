import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
}) {
  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      {backTo && (
        <Box>
          <Button
            component={Link}
            to={backTo}
            startIcon={<ArrowLeft size={16} />}
            size="small"
            color="inherit"
            sx={{ px: 1, py: 0.5, bgcolor:'bg.primary',color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            Back
          </Button>
        </Box>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
      >
        <Box>
          <Typography variant="h1">{title}</Typography>
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