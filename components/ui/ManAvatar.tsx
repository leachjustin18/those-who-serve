import { Avatar } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const ManAvatar = ({
  name,
  photo,
}: {
  name: string;
  photo?: string;
}) => {
  let initials;

  if (!photo) {
    initials = name
      .split(" ")
      .map((word) => word[0])
      .join("");
  }

  return (
    <Avatar
      alt={name}
      src={photo ?? undefined}
      sx={(theme) => ({
        width: 44,
        height: 44,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      })}
    >
      {initials}
    </Avatar>
  );
};
