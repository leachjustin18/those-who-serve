"use client";

import {
  Box,
  Stack,
  Typography,
  Link as MuiLink,
} from "@mui/material";

import { SignInWithGoogle } from "@/components/auth/SignInWithGoogle";
import { backgroundGradient, gridOverlay } from "@/lib/theme";
import Link from "next/link";
import packageJson from "@/package.json";

export default function Login() {
  const accentGradient =
    "linear-gradient(135deg, #5AC2E7 0%, #6E90F2 48%, #D982F0 85%)";
  const ambientGradient =
    "linear-gradient(135deg, rgba(236,251,247,0.96) 0%, rgba(244,247,255,0.94) 55%, rgba(253,242,255,0.98) 100%)";

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundImage: `${ambientGradient}, ${backgroundGradient}`,
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage: gridOverlay,
        backgroundSize: "80px 80px",
        opacity: 0.12,
        pointerEvents: "none",
      },


    }}>

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: { xs: "-120px", md: "-220px" },
          right: { xs: "-50px", md: "-100px" },
          width: { xs: 300, md: 420 },
          height: { xs: 300, md: 420 },
          background:
            "radial-gradient(circle, rgba(218,241,255,0.7) 0%, rgba(218,241,255,0) 70%)",
          filter: "blur(2px)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: { xs: "-120px", md: "-200px" },
          left: { xs: "-60px", md: "-120px" },
          width: { xs: 320, md: 400 },
          height: { xs: 320, md: 400 },
          background:
            "radial-gradient(circle, rgba(255,226,239,0.85) 0%, rgba(255,226,239,0) 75%)",
          filter: "blur(6px)",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",

          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(118,169,250,0.45) 0%, rgba(118,169,250,0) 70%)",
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />


      <Stack spacing={4} alignContent="center" alignItems="center" pt={12} px={2}>
        <Stack
          spacing={3}
          sx={{
            backgroundColor: "rgba(255,255,255,0.75)",
            borderRadius: 5,
            p: { xs: 3, md: 4 },
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 30px 70px rgba(125, 153, 183, 0.25)",
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 5,
              borderRadius: 999,
              background: accentGradient,
            }}
          />
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontSize: "clamp(2.5rem, 4vw, 3.4rem)",
              lineHeight: 1.15,
              color: "#0f1729",
            }}
            textAlign="center"
          >
            Sign in with your {<br />}
            Google account.
          </Typography>
        </Stack>

        <Stack
          spacing={3}
          alignItems="center"
          width="100%"
          maxWidth={460}
          sx={{
            position: "relative",
          }}
        >



          <SignInWithGoogle />


          <Typography
            variant="caption"
            align="center"
            sx={{ color: "rgba(52,63,92,0.75)" }}
          >
            By continuing you confirm you&apos;re using an approved Google
            account and accept the security practices for Those Who Serve.
          </Typography>
          <MuiLink
            component={Link}
            href="/privacy"
            underline="hover"
            sx={{ color: "rgba(52,63,92,0.85)", fontWeight: 600 }}
          >
            Privacy Policy
          </MuiLink>
          <Typography variant="caption" sx={{ color: "rgba(52,63,92,0.65)" }}>
            Version {packageJson.version}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
