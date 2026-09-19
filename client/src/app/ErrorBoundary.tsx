import { Component, type ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last-resort UI error boundary. Never leaks stack traces or sensitive data to
 * the user — it only offers a safe reload. Errors are logged to the console.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Deliberately omit the error stack from logs that could contain secrets.
    console.error('[VaultBank] UI error:', error.message);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
          <Paper elevation={0} sx={{ p: 5, borderRadius: 4, maxWidth: 420, textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2,
                bgcolor: '#FEF2F2',
                color: '#DC2626',
              }}
            >
              <ShieldAlert size={32} />
            </Box>
            <Typography variant="h3">Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              We couldn’t render this view. Your vault data remains encrypted and safe.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/dashboard';
              }}
            >
              Reload app
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}