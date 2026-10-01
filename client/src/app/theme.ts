import { alpha, createTheme } from "@mui/material/styles";

/**
 * PassVault design system.
 * Typeface: Public Sans — a humanist grotesque, chosen over Inter because its
 * open apertures and taller x-height read warmer and less clinical at small sizes.
 * Neutrals are warm paper tones. The primary is pine #1F6B4A, which sits on that
 * warm paper better than a blue did; success was pushed to teal so a green
 * primary button never reads as a confirmation.
 */
const tokens = {
  canvas: "#F5F3F0",
  surface: "#FDFCFA",
  ink: "#1C1A18",
  muted: "#6E6862",
  line: "#E4DFD7",
  primary: "#1F6B4A",
  primaryDark: "#185A3E",
  primarySoft: "#EAF3EE",
  success: "#0F766E",
  successSoft: "#E6F4F2",
  danger: "#C42B2B",
  dangerSoft: "#FBEFEE",
  warning: "#B45309",
  warningSoft: "#FBF3E4",
  // Secondary warm neutrals for hover and inset states.
  lineStrong: "#CFC8BD",
  subtle: "#F0EDE8",
};

export const COLORS = tokens;

const FONT = "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

export const FONTS = { sans: FONT, mono: MONO };

const shadows = {
  xs: "0 1px 2px rgba(28,26,24,0.05)",
  sm: "0 1px 2px rgba(28,26,24,0.04), 0 1px 3px rgba(28,26,24,0.05)",
  md: "0 2px 4px rgba(28,26,24,0.04), 0 6px 16px rgba(28,26,24,0.07)",
  lg: "0 4px 8px rgba(28,26,24,0.05), 0 14px 36px rgba(28,26,24,0.09)",
  primary: "0 1px 2px rgba(31,107,74,0.26), 0 4px 12px rgba(31,107,74,0.18)",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: tokens.canvas, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.line,
    primary: {
      main: tokens.primary,
      dark: tokens.primaryDark,
      contrastText: "#FFFFFF",
      light: tokens.primarySoft,
    },
    success: { main: tokens.success, contrastText: "#FFFFFF" },
    error: { main: tokens.danger },
    warning: { main: tokens.warning },
    info: { main: tokens.primary },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: FONT,
    // Weight is capped at 700 throughout. Heavier 800/900 faces are one of the
    // clearest tells of generated UI, and they crush Public Sans's counters.
    h1: {
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.011em",
      lineHeight: 1.3,
    },
    h2: {
      fontSize: "1.3125rem",
      fontWeight: 700,
      letterSpacing: "-0.008em",
      lineHeight: 1.35,
    },
    h3: { fontSize: "1.0625rem", fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.45 },
    h5: { fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.45 },
    h6: { fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.45 },
    subtitle1: { fontWeight: 600, fontSize: "0.9375rem", lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem", lineHeight: 1.45 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.55 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5, color: tokens.muted },
    caption: { fontSize: "0.75rem", lineHeight: 1.45, color: tokens.muted },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.06em",
      lineHeight: 1.4,
      textTransform: "uppercase",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          paddingInline: 16,
          paddingBlock: 7,
          boxShadow: "none",
          transition:
            "transform 120ms ease, box-shadow 180ms ease, background-color 180ms ease",
          "&:active": { transform: "scale(0.985)" },
        },
        containedPrimary: {
          boxShadow: shadows.primary,
          "&:hover": { boxShadow: shadows.primary },
        },
        outlined: {
          borderColor: tokens.line,
          "&:hover": {
            borderColor: tokens.lineStrong,
            backgroundColor: tokens.subtle,
          },
        },
        text: { "&:hover": { backgroundColor: tokens.subtle } },
        sizeLarge: { paddingInline: 24, paddingBlock: 10, borderRadius: 0 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.sm,
          backgroundColor: tokens.surface,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        elevation1: {
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.sm,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: tokens.surface,
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.lineStrong,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.primary,
              borderWidth: 1,
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha(tokens.primary, 0.12)}`,
            },
          },
          "& .MuiInputLabel-root": { fontWeight: 500 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 500 },
        filledSuccess: { backgroundColor: tokens.success },
        filledError: { backgroundColor: tokens.danger },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 0 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.ink,
          fontSize: 12,
          padding: "6px 10px",
          borderRadius: 0,
        },
        arrow: { color: tokens.ink },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.lg,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 0, transition: "background-color 180ms ease" },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.lg,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.line } },
    },
    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 0, backgroundColor: "#E7E2DA" } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundColor: tokens.line, height: 8 },
        bar: { borderRadius: 0 },
      },
    },
    MuiSwitch: {
      styleOverrides: { root: {} },
    },
  },
});

export const SHADOWS = shadows;

export const CHIP_COLORS = {
  primary: tokens.primarySoft,
  primaryText: tokens.primaryDark,
  success: tokens.successSoft,
  successText: tokens.success,
  danger: tokens.dangerSoft,
  dangerText: "#A32020",
  warning: tokens.warningSoft,
  warningText: "#B45309",
};
