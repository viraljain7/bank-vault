import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  CreditCard,
  Landmark,
  LayoutDashboard,
  Lock,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Fingerprint,
  LockKeyhole,
} from 'lucide-react';
import { Avatar, Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useVault } from '../../contexts/VaultContext';
import { initials } from '../../lib/format';
import type { ReactNode } from 'react';

const NAV_SECTIONS: Array<{
  heading: string;
  items: Array<{ to: string; label: string; icon: ReactNode; badge?: string }>;
}> = [
  {
    heading: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
  },
  {
    heading: 'Vault',
    items: [
      { to: '/banks', label: 'Bank Accounts', icon: <Landmark size={18} /> },
      { to: '/cards', label: 'Cards', icon: <CreditCard size={18} /> },
      { to: '/favorites', label: 'Favorites', icon: <Star size={18} /> },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { to: '/search', label: 'Search', icon: <Search size={18} />, badge: '⌘K' },
      { to: '/activity', label: 'Activity', icon: <Activity size={18} /> },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to: '/security', label: 'Security', icon: <ShieldCheck size={18} /> },
      { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    ],
  },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box component="nav" sx={{ px: 1.5 }}>
      {NAV_SECTIONS.map((section) => (
        <Box key={section.heading} sx={{ mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 10.5,
              mb: 0.5,
            }}
          >
            {section.heading}
          </Typography>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.05,
                    borderRadius: 1,
                    mb: 0.25,
                    position: 'relative',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? '#EBF0FF' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3.5,
                      height: isActive ? 22 : 0,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      transition: 'height 180ms ease',
                    },
                    '&:hover': { bgcolor: isActive ? '#EBF0FF' : '#F1F5F9' },
                    transition: 'background-color 180ms ease, color 180ms ease',
                  }}
                >
                  <Box sx={{ width: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Typography component="span" variant="body2" sx={{ fontWeight: 'inherit', flex: 1 }}>
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        bgcolor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                        border: isActive ? '1px solid transparent' : '1px solid #E2E8F0',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 6,
                      }}
                    >
                      {item.badge}
                    </Typography>
                  )}
                </Box>
              )}
            </NavLink>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function UserCard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { phase, hasUnlockKey, lock } = useVault();
  const navigate = useNavigate();

  const name = user?.fullName ?? 'Vault user';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const unlocked = phase === 'unlocked';

  return (
    <Box sx={{ px: 1.5, pb: 1.5 }}>
      <Box sx={{ px: 1, py: 1, borderRadius: 1, bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
              {initials(name)}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: unlocked ? '#22C55E' : '#94A3B8',
                border: '2px solid #F8FAFC',
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {email}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.75,
            borderRadius: 1,
            bgcolor: unlocked ? '#ECFDF3' : '#F1F5F9',
            color: unlocked ? '#15803D' : '#64748B',
          }}
        >
          <Fingerprint size={15} />
          <Typography variant="caption" fontWeight={600} flex={1}>
            {unlocked ? 'Vault unlocked' : 'Vault protected'}
          </Typography>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: unlocked ? '#22C55E' : '#94A3B8',
              animation: unlocked ? 'pulseDot 2s ease-in-out infinite' : 'none',
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Lock size={15} />}
          sx={{ mt: 1 }}
          onClick={() => {
            lock();
            navigate('/dashboard');
          }}
          disabled={!hasUnlockKey || !unlocked}
        >
          Lock Vault
        </Button>

        <Button
          fullWidth
          variant="text"
          startIcon={<LogOut size={15} />}
          sx={{ mt: 0.25, color: 'text.secondary', '&:hover': { color: 'error.main', backgroundColor: '#FEF2F2' } }}
          onClick={() => void signOut().then(() => navigate('/sign-in'))}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}

export function Brand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.25 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
          color: '#fff',
          boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
        }}
      >
        <LockKeyhole size={21} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          VaultBank
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          Financial credentials, secured
        </Typography>
      </Box>
    </Box>
  );
}

export function SecurityFooter() {
  return (
    <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
        <ShieldCheck size={14} />
        <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
          End-to-end encrypted
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontSize: 10.5, color: 'text.secondary' }}>
        AES-256-GCM · PBKDF2-SHA256 (210k)
      </Typography>
    </Box>
  );
}

export function SidebarDesktop() {
  const isCompact = useMediaQuery('(max-width: 1100px)');
  return (
    <Box
      sx={{
        width: isCompact ? 238 : 262,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Brand />
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 0.5, '&::-webkit-scrollbar': { width: 0 } }}>
        <NavLinks />
      </Box>
      <UserCard />
      <SecurityFooter />
    </Box>
  );
}