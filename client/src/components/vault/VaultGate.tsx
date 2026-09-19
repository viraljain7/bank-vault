import { Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useVault } from '../../contexts/VaultContext';
import { SetupVaultScreen } from '../../pages/SetupVault';
import { VaultLockScreen } from '../../pages/VaultLock';

/**
 * Vault lifecycle gate. Renders setup or unlock screens whenever the vault
 * is not unlocked, so no protected page can ever display decrypted data
 * while locked.
 */
export function VaultGate() {
  const { phase } = useVault();

  if (phase === 'loading') {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
        <CircularProgress aria-label="Loading vault" />
      </Box>
    );
  }

  if (phase === 'setup-needed') {
    return <SetupVaultScreen />;
  }

  if (phase === 'locked') {
    return <VaultLockScreen />;
  }

  return <Outlet />;
}