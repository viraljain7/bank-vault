import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  tone?: ToastTone;
  title?: string;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<ToastTone>('success');
  const [title, setTitle] = useState<string | undefined>();

  const toast = useCallback((msg: string, options: ToastOptions = {}) => {
    setMessage(msg);
    setTone(options.tone ?? 'success');
    setTitle(options.title);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3400}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={tone}
          onClose={() => setOpen(false)}
          variant="filled"
          sx={{
            minWidth: 320,
            maxWidth: 480,
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(15,23,42,0.18)',
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          {title && (
            <Box sx={{ display: 'block', fontWeight: 700, fontSize: 13.5, mb: 0.25 }}>
              {title}
            </Box>
          )}
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}