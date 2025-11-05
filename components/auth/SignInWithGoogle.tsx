"use client";
import { Card as MuiCard, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { signIn } from "next-auth/react";
import { GoogleIcon } from "@/components/icons/Google";

const handleSignIn = () => {
  void signIn("google");
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export const SignInWithGoogle = () => (
  <Card variant="outlined">
    <Typography
      component="h1"
      variant="h4"
      sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
    >
      Sign in
    </Typography>

    <Button
      fullWidth
      variant="outlined"
      onClick={handleSignIn}
      startIcon={<GoogleIcon />}
    >
      Sign in with Google
    </Button>
  </Card>
);
