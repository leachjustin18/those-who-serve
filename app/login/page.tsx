"use client";

import { Box, Container, Stack, Typography } from "@mui/material";

import { SignInWithGoogle } from "@/components/auth/SignInWithGoogle";
import { backgroundGradient, gridOverlay } from "@/lib/theme";

export default function Login() {
  return (
    <Box
      component="main"
      sx={(theme) => ({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        backgroundImage: backgroundGradient,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: gridOverlay,
          backgroundSize: "80px 80px",
          opacity: theme.palette.mode === "dark" ? 0.3 : 0.15,
          pointerEvents: "none",
        },
      })}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 6, md: 10 }}
          alignItems="center"
        >
          <Stack spacing={3} flex={1} maxWidth={520}>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                lineHeight: 1.1,
                color: "white",
              }}
            >
              Sign in with your Google account.
            </Typography>
          </Stack>

          <Stack spacing={2} alignItems="center" width="100%" maxWidth={460}>
            <Box
              sx={{
                width: "100%",
                borderRadius: 4,
                p: 1.5,
                backgroundColor: "rgba(3, 7, 21, 0.55)",
                backdropFilter: "blur(18px)",
                boxShadow:
                  "hsla(220, 30%, 5%, 0.45) 0px 25px 80px -20px, hsla(197, 100%, 87%, 0.3) 0px 35px 80px -40px",
              }}
            >
              <SignInWithGoogle />
            </Box>
            <Typography
              variant="caption"
              align="center"
              sx={{ color: "rgba(255,255,255,0.65)" }}
            >
              By continuing you confirm you&apos;re using an approved Google
              account and accept the security practices for Those Who Serve.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
