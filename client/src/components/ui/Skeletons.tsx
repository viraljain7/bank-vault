import { Box, Grid, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Loading placeholders.
 *
 * Two rules hold everywhere below:
 * - Every placeholder uses the same MUI <Skeleton> wave animation, so there is
 *   one shimmer on screen rather than two competing ones.
 * - Widths are percentages of the real element they stand in for, never fixed
 *   pixels. A hard `width={120}` label bar looks correct on one viewport and
 *   wrong on every other one.
 */
export function CardSkeleton() {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 0, height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Skeleton width={46} height={46} sx={{ flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton width="55%" height={20} />
          <Skeleton width="38%" height={14} sx={{ mt: 0.5 }} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton width={28} height={28} />
        </Stack>
      </Stack>

      {/* Matches PremiumCard / PremiumBankCard: 1.586 aspect, 400px max */}
      <Skeleton
        variant="rectangular"
        sx={{ mt: 2, width: '100%', maxWidth: 400, aspectRatio: '1.586' }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
        <Skeleton width={148} height={24} />
        <Skeleton width={64} height={14} />
      </Stack>

      <Skeleton variant="rectangular" height={40} sx={{ mt: 1.5 }} />
    </Paper>
  );
}

/** Mirrors DashboardPage's <StatCard>: 38px icon + overline, large value, hint. */
function StatCardSkeleton({ solid }: { solid?: boolean }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 0,
        height: '100%',
        bgcolor: solid ? 'rgba(31,107,74,0.14)' : 'transparent',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Skeleton width={38} height={38} sx={{ flexShrink: 0 }} />
        <Skeleton width={104} height={12} />
      </Stack>
      <Skeleton
        width={solid ? 116 : 84}
        height={solid ? 50 : 34}
        sx={{ mt: 2.5, borderRadius: 0 }}
      />
      <Skeleton width="72%" height={12} sx={{ mt: 1.25 }} />
    </Paper>
  );
}

/** Mirrors DashboardPage's 2x2 stat grid, including the solid/plain alternation. */
export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton width="38%" height={32} />
      <Skeleton width="58%" height={16} sx={{ mt: 1 }} />

      <Grid container spacing={2.5} sx={{ mt: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <StatCardSkeleton solid={i === 0 || i === 3} />
          </Grid>
        ))}
      </Grid>

      <Skeleton width="26%" height={22} sx={{ mt: 4 }} />
      <Grid container spacing={2.5} sx={{ mt: 2 }}>
        {[0, 1].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <CardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/** The Cards, Banks, Favorites and Search lists. */
export function ItemListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, md: 6 }}>
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/** Single-column field stack, shared by the two form pages. */
export function DetailSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i}>
          <Skeleton width="24%" height={12} sx={{ mb: 0.5 }} />
          <Skeleton variant="rectangular" height={44} />
        </Box>
      ))}
    </Stack>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 0, p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="45%" height={16} />
            <Skeleton width="30%" height={12} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rectangular" width={70} height={28} sx={{ flexShrink: 0 }} />
        </Box>
      ))}
    </Paper>
  );
}

export function StatSkeleton() {
  return <StatCardSkeleton />;
}

export function GreetingLoading() {
  return (
    <Box sx={{ width: 140, height: 16 }} aria-hidden>
      <Skeleton variant="text" width="100%" height={16} />
    </Box>
  );
}
