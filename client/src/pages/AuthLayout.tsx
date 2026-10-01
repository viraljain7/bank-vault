import { Box, Paper, Typography } from "@mui/material";
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import vault from "../img/vault.png";

const FEATURES = [
  { icon: <Fingerprint size={17} />, text: "Unlock with a PIN you choose" },
  {
    icon: <LockKeyhole size={17} />,
    text: "Encrypted in your browser, not on our servers",
  },
  {
    icon: <ShieldCheck size={17} />,
    text: "Card PINs, OTPs and 3DS codes are never stored",
  },
];

/** Branded split layout used by the Clerk-powered sign-in / sign-up pages. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: "minmax(420px, 1.05fr) 1fr",
        bgcolor: "background.default",
      }}
    >
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 7,
          color: "#fff",
          background:
            "linear-gradient(150deg, #050B13 0%, #0A1C27 58%, #06323B 100%)",
          }}
          >
        <Box
          sx={{
            display: "flex",
            bgcolor: "rgba(255,255,255,0.94)",
            alignItems: "center",
            gap: 1.5,
            position: "relative",
          }}
        >
          <Box>
            <img src={vault} alt="PassVault" width={250} height={100} />
          </Box>
        </Box>

        <Box sx={{ position: "relative", maxWidth: 460 }}>
          <Typography
            variant="h2"
            sx={{ fontSize: "2rem", lineHeight: 1.2, color: "#fff" }}
          >
            Your financial credentials.
            <br />
            <Box
              component="span"
              sx={{ color: "#04DDE2", fontWeight: 600 }}
            >
              End-to-end secured.
            </Box>
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {FEATURES.map((f) => (
              <Box
                key={f.text}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 0,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(4,221,226,0.14)",
                    color: "#04DDE2",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                >
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ShieldCheck size={15} color="#04DDE2" />
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
          >
            Encrypted with AES-256-GCM
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box
          sx={{
            display: { md: "none" },
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "#04252A",
              boxShadow:
                "0 1px 2px rgba(2,140,144,0.26), 0 4px 12px rgba(2,140,144,0.18)",
              mb: 1.5,
            }}
          >
            <LockKeyhole size={26} />
          </Box>
          <Typography variant="h4" fontWeight={700}>
            PassVault
          </Typography>
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 450,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 0,
              border: "1px solid #E3DED6",
              boxShadow:
                "0 2px 4px rgba(28,26,24,0.04), 0 6px 16px rgba(28,26,24,0.07)",
            }}
          >
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mt: 3,
            }}
          >
            <KeyRound size={14} color="#B3AA9C" />
            <Typography variant="caption" color="text.secondary">
              Secrets are encrypted on your device before they are sent.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
