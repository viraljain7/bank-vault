import { alpha, createTheme } from '@mui/material/styles';

/**
 * VaultBank design system — production fintech aesthetic.
 * Canvas #F6F7F9 · Surface #FFFFFF · Ink #0F172A · Muted #64748B
 * Line #E2E8F0 · Primary #2563EB (indigo/blue) · Success #16A34A · Danger #DC2626
 */
const tokens = {
  canvas: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EBF0FF',
  success: '#16A34A',
  successSoft: '#ECFDF3',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
};

export const COLORS = tokens;

const shadows = {
  xs: '0 1px 2px rgba(15,23,42,0.05)',
  sm: '0 1px 2px rgba(15,23,42,0.05), 0 2px 8px rgba(15,23,42,0.06)',
  md: '0 2px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.08)',
  lg: '0 4px 8px rgba(15,23,42,0.06), 0 16px 40px rgba(15,23,42,0.1)',
  primary: '0 8px 20px rgba(37,99,235,0.28)',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: tokens.canvas, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.line,
    primary: { main: tokens.primary, dark: tokens.primaryDark, contrastText: '#FFFFFF', light: tokens.primarySoft },
    success: { main: tokens.success, contrastText: '#FFFFFF' },
    error: { main: tokens.danger },
    warning: { main: tokens.warning },
    info: { main: tokens.primary },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    h1: { fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.35 },
    h4: { fontSize: '1rem', fontWeight: 700 },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem', color: tokens.muted },
    caption: { fontSize: '0.75rem', color: tokens.muted },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {},
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 16,
          paddingBlock: 7,
          boxShadow: 'none',
          transition: 'transform 120ms ease, box-shadow 180ms ease, background-color 180ms ease',
          '&:active': { transform: 'scale(0.985)' },
        },
        containedPrimary: {
          boxShadow: shadows.primary,
          '&:hover': { boxShadow: shadows.primary },
        },
        outlined: {
          borderColor: tokens.line,
          '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
        },
        text: { '&:hover': { backgroundColor: '#F1F5F9' } },
        sizeLarge: { paddingInline: 24, paddingBlock: 10, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.sm,
          backgroundColor: tokens.surface,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { border: `1px solid ${tokens.line}`, boxShadow: shadows.sm },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary,
              borderWidth: 1,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(tokens.primary, 0.12)}`,
            },
          },
          '& .MuiInputLabel-root': { fontWeight: 500 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        filledSuccess: { backgroundColor: tokens.success },
        filledError: { backgroundColor: tokens.danger },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#0F172A', fontSize: 12, padding: '6px 10px' },
        arrow: { color: '#0F172A' },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 8, border: `1px solid ${tokens.line}`, boxShadow: shadows.lg } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8, transition: 'background-color 180ms ease' },
      },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 8, border: `1px solid ${tokens.line}`, boxShadow: shadows.lg } },
    },
    MuiSnackbar: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.line } },
    },
    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 8, backgroundColor: '#E8ECF2' } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 6, backgroundColor: '#E2E8F0', height: 8 },
        bar: { borderRadius: 6 },
      },
    },
    MuiSwitch: {
      styleOverrides: { root: {} },
    },
  },
});

export const SHADOWS = shadows;

export const CHIP_COLORS = {
  primary: '#EBF0FF',
  primaryText: '#1D4ED8',
  success: '#ECFDF3',
  successText: '#15803D',
  danger: '#FEF2F2',
  dangerText: '#B91C1C',
  warning: '#FFFBEB',
  warningText: '#B45309',
};