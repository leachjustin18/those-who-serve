import { SvgIcon, type SvgIconProps } from "@mui/material";

/**
 * Calendar icon component for displaying in the bottom navigation.
 */
export const CalendarIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-10H7v5h7v-5z" />
    </SvgIcon>
  );
};
