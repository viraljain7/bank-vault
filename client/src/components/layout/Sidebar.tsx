import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Avatar, Box, Button, Typography, useMediaQuery } from "@mui/material";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useVault } from "../../contexts/VaultContext";
import { initials } from "../../lib/format";
import type { ReactNode } from "react";
import vault from "../../img/vault.png";

const NAV_SECTIONS: Array<{
  heading: string;
  items: Array<{ to: string; label: string; icon: ReactNode; badge?: string }>;
}> = [
  {
    heading: "Overview",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    heading: "Vault",
    items: [
      { to: "/banks", label: "Bank Accounts", icon: <Landmark size={18} /> },
      { to: "/cards", label: "Cards", icon: <CreditCard size={18} /> },
      { to: "/favorites", label: "Favorites", icon: <Star size={18} /> },
    ],
  },
  {
    heading: "Tools",
    items: [
      {
        to: "/search",
        label: "Search",
        icon: <Search size={18} />,
        badge: "⌘K",
      },
      { to: "/activity", label: "Activity", icon: <Activity size={18} /> },
    ],
  },
  {
    heading: "Account",
    items: [
      { to: "/security", label: "Security", icon: <ShieldCheck size={18} /> },
      { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
    ],
  },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box component="nav" sx={{ px: 0 }}>
      {NAV_SECTIONS.map((section) => (
        <Box key={section.heading} sx={{ mb: 1.5 }}>
          <Typography
            variant="overline"
            sx={{ px: 2, display: "block", color: "text.secondary", mb: 0.5 }}
          >
            {section.heading}
          </Typography>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {({ isActive }) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pl: 2,
                    pr: 1.5,
                    py: 1.05,
                    borderRadius: 0,
                    color: isActive ? "primary.main" : "text.secondary",
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? "inset 2px 0 0 0 #1F6B4A" : "none",
                    "&:hover": { bgcolor: isActive ? "transparent" : "#F0EDE8" },
                    transition: "background-color 160ms ease, color 160ms ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontWeight: "inherit", flex: 1 }}
                  >
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: isActive ? "primary.main" : "text.secondary",
                        bgcolor: "transparent",
                        border: isActive
                          ? "1px solid rgba(31,107,74,0.28)"
                          : "1px solid #E4DFD7",
                        px: 0.6,
                        py: 0.15,
                        borderRadius: 0,
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

  const name = user?.fullName ?? "Vault user";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const unlocked = phase === "unlocked";

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ px: 1.25, py: 1.25, borderRadius: 0, bgcolor: "#F0EDE8" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {initials(name)}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: unlocked ? "#12A374" : "#B3AA9C",
                border: "2px solid #F0EDE8",
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block" }}
            >
              {email}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Lock size={15} />}
          sx={{ mt: 1.25, borderRadius: 0 }}
          onClick={() => {
            lock();
            navigate("/dashboard");
          }}
          disabled={!hasUnlockKey || !unlocked}
        >
          Lock Vault
        </Button>

        <Button
          fullWidth
          variant="text"
          startIcon={<LogOut size={15} />}
          sx={{
            mt: 0.25,
            borderRadius: 0,
            color: "text.secondary",
            "&:hover": { color: "error.main", backgroundColor: "#FBEFEE" },
          }}
          onClick={() => void signOut().then(() => navigate("/sign-in"))}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}

export function Brand() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 2.25,
      }}
    >
      <Box>
        <img src={vault} alt="PassVault" width={50} height={50} />
      </Box>

      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ lineHeight: 1.15 }}
        >
          PassVault
        </Typography>
      </Box>
    </Box>
  );
}

export function SecurityFooter() {
  return (
    <Box
      sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "success.main",
        }}
      >
        <ShieldCheck size={14} />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary" }}
        >
          End-to-end encrypted
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: 10.5, color: "text.secondary" }}
      >
        AES-256-GCM · PBKDF2-SHA256 (210k)
      </Typography>
    </Box>
  );
}

export function SidebarDesktop() {
  const isCompact = useMediaQuery("(max-width: 1100px)");
  return (
    <Box
      sx={{
        width: isCompact ? 238 : 262,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Brand />
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pt: 0.5,
          "&::-webkit-scrollbar": { width: 0 },
        }}
      >
        <NavLinks />
      </Box>
      <UserCard />
      <SecurityFooter />
    </Box>
  );
}
