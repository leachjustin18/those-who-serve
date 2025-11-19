import { Typography, Box } from "@mui/material";

export const SectionTitle = ({
  children,
  icon,
  ...props
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 200,
        display: "flex",
        alignItems: "center",
      }}
      gutterBottom
      {...props}
    >
      {icon && <Box sx={{ mr: 1, display: "flex" }}>{icon}</Box>}
      {children}
    </Typography>
  );
};
