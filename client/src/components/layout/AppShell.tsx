import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { CreditCard, LayoutDashboard, Lock, LockKeyhole, Menu, Search, Settings, Landmark } from 'lucide-react';
import { Brand, NavLinks, SidebarDesktop } from './Sidebar';
import { useVault } from '../../contexts/VaultContext';

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { to: '/banks', label: 'Banks', icon: <Landmark size={20} /> },
  { to: '/cards', label: 'Cards', icon: <CreditCard size={20} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/banks/new')) return 'Add Bank Account';
  if (pathname.includes('/edit')) return 'Edit Credential';
  if (pathname.startsWith('/banks')) return 'Bank Accounts';
  if (pathname.startsWith('/cards')) return 'Cards';
  if (pathname.startsWith('/favorites')) return 'Favorites';
  if (pathname.startsWith('/search')) return 'Search';
  if (pathname.startsWith('/activity')) return 'Security Activity';
  if (pathname.startsWith('/security')) return 'Security';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
}



export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { phase, lock } = useVault();
  const unlocked = phase === 'unlocked';
  const currentTitle = pageTitle(location.pathname);

  // Global ⌘/Ctrl+K → jump to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.title = currentTitle === 'Dashboard' ? 'VaultBank — Your financial credentials. Secured.' : `${currentTitle} — VaultBank`;
  }, [currentTitle]);

  const activeIndex = MOBILE_NAV.findIndex((item) =>
    item.to === '/dashboard' ? location.pathname === '/dashboard' || location.pathname === '/' : location.pathname.startsWith(item.to),
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SidebarDesktop />

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 274 }}>
          <Brand />
          <NavLinks onNavigate={() => setDrawerOpen(false)} />
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: 'flex', md: 'none' },
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
              <Menu size={22} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: '#fff',
                }}
              >
                <LockKeyhole size={17} />
              </Box>
              <Typography variant="subtitle1" fontWeight={800}>
                VaultBank
              </Typography>
            </Box>
            <IconButton aria-label="Search vault" onClick={() => navigate('/search')} sx={{ bgcolor: 'background.default' }}>
              <Search size={20} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Desktop global header */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 4,
            py: 2.5,
            height: 76,
          }}
        >
          <Box>
          
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              onClick={() => navigate('/search')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: 260,
                px: 1.5,
                py: 0.9,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.secondary',
                cursor: 'pointer',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                '&:hover': { borderColor: '#94A3B8' },
              }}
            >
              <Search size={17} />
              <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
                Search your vault…
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 6,
                  color: 'text.secondary',
                }}
              >
                ⌘K
              </Typography>
            </Box>

            <Tooltip title={unlocked ? 'Vault unlocked — tap to lock' : 'Vault protected'}>
              <Box
                onClick={() => {
                  if (unlocked) {
                    lock();
                    navigate('/dashboard');
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.25,
                  py: 0.8,
                  borderRadius: 1,
                  bgcolor: unlocked ? '#ECFDF3' : '#F1F5F9',
                  color: unlocked ? '#15803D' : '#64748B',
                  cursor: unlocked ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                {unlocked ? <Lock size={15} /> : <LockKeyhole size={15} />}
                <Typography variant="caption" fontWeight={600}>
                  {unlocked ? 'Unlocked' : 'Protected'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 3, md: 4 }, pb: { xs: 12, md: 4 }, maxWidth: 1320, mx: 'auto', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', md: 'none' },
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 1200,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation
          value={activeIndex < 0 ? 0 : activeIndex}
          showLabels
          onChange={(_, value) => {
            const target = MOBILE_NAV[value]?.to ?? '/dashboard';
            if (location.pathname !== target) navigate(target);
          }}
        >
          {MOBILE_NAV.map((item) => (
            <BottomNavigationAction key={item.to} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}