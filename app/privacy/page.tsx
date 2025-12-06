import { Container, Typography, Stack, Divider, Box } from "@mui/material";

export const metadata = {
  title: "Privacy Policy | Those Who Serve",
};

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Last updated: {new Date().getFullYear()}
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h5">Overview</Typography>
          <Typography variant="body1">
            Those Who Serve is used to schedule and notify members of the 39th
            St Church of Christ about their serving assignments. We collect the
            minimum information needed to manage the schedule and send you
            notifications.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">Information We Collect</Typography>
          <Typography variant="body1">
            - Name and email address from your Google sign-in.
          </Typography>
          <Typography variant="body1">
            - Optional profile details provided by administrators (roles,
            unavailable dates, notes, and profile photo).
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">How We Use Your Information</Typography>
          <Typography variant="body1">
            - To authenticate your account with Google.
          </Typography>
          <Typography variant="body1">
            - To generate and manage serving schedules stored in Firebase.
          </Typography>
          <Typography variant="body1">
            - To send schedule notifications via email when a month is
            finalized.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">Data Storage</Typography>
          <Typography variant="body1">
            Data is stored in Google Firebase/Firestore and accessed only by
            authorized administrators of the congregation.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">Sharing</Typography>
          <Typography variant="body1">
            We do not sell or share your information with third parties. Google
            and Firebase process data as part of authentication and hosting.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">Your Choices</Typography>
          <Typography variant="body1">
            If you need corrections or removal of your information, contact a
            congregation administrator. You can revoke Google access from your
            Google account settings at any time.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h6">Questions</Typography>
          <Typography variant="body1">
            For any privacy questions, please contact the Those Who Serve
            administrators at the 39th St Church of Christ.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
