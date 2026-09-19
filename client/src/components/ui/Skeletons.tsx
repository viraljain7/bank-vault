import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';

function CardSkeletonRow() {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }} className="card-hover">
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Skeleton width={140} height={22} />
          <Skeleton width={90} height={16} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
      <Skeleton width={200} height={14} sx={{ mt: 2 }} />
      <Skeleton width={160} height={14} sx={{ mt: 1 }} />
      <Skeleton width={110} height={14} sx={{ mt: 1 }} />
      <Box sx={{ mt: 2 }}>
        <Skeleton width={90} height={18} />
      </Box>
    </Paper>
  );
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton width={260} height={28} />
      <Skeleton width={180} height={16} sx={{ mt: 1 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
        {[0, 1, 2].map((i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
            <Skeleton width={90} height={14} />
            <Skeleton width={40} height={32} sx={{ mt: 1 }} />
          </Paper>
        ))}
      </Stack>
      <Skeleton width={200} height={22} sx={{ mt: 4 }} />
      <Stack spacing={2} sx={{ mt: 2 }}>
        {[0, 1].map((i) => (
          <CardSkeletonRow key={i} />
        ))}
      </Stack>
    </Box>
  );
}

export function ItemListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeletonRow key={i} />
      ))}
    </Stack>
  );
}

export function DetailSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i}>
          <Skeleton width={150} height={12} sx={{ mb: 0.5 }} />
          <Skeleton height={44} />
        </Box>
      ))}
    </Stack>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="45%" height={16} />
            <Skeleton width="30%" height={12} />
          </Box>
          <Skeleton width={70} height={28} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Paper>
  );
}

export function StatSkeleton() {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, flex: 1 }}>
      <Skeleton width={80} height={14} />
      <Skeleton width={48} height={32} sx={{ mt: 1 }} />
    </Paper>
  );
}

export function GreetingLoading() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Loading your vault…
    </Typography>
  );
}