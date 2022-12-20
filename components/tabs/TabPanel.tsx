import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export interface ITabPanelProps {
  children: ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: ITabPanelProps) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    sx={{ flex: 1 }}
  >
    {value === index && <Box>{children}</Box>}
  </Box>
);

export default TabPanel;
