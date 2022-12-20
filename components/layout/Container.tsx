import { useRouter } from 'next/router';
import { useState, MouseEvent } from 'react';
import {
  Typography,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Container as MuiContainer,
  MenuItem,
  Toolbar,
  Box,
  IconButton,
  Menu,
  Tooltip,
  Avatar,
} from '@mui/material';

import {
  Home as HomeIcon,
  Work as WorkIcon,
  Groups as GroupsIcon,
  CalendarMonth as CalendarMonthIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { signOut, getAuth } from 'firebase/auth';
import { createFirebaseApp } from '../../firebase/clientApp';
import { useUser } from '../../context/userContext';
import type { SyntheticEvent, ReactNode } from 'react';

const Container = ({
  title,
  children,
}: {
  children: ReactNode;
  title?: string;
}): JSX.Element => {
  const router = useRouter();
  const routeValue = router.pathname;

  const handleChange = (_: SyntheticEvent, route: string) => {
    router.push(route);
  };

  const siteTitle = `Those Who Serve ${title ? `- ${title}` : ''}`;
  const app = createFirebaseApp();
  const auth = getAuth(app);

  const { user } = useUser();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logUserOut = async () => {
    setAnchorElUser(null);
    await signOut(auth);
  };

  return (
    <>
      <AppBar position="sticky">
        <MuiContainer maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
              {siteTitle}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />
            <>
              <Tooltip title="Open settings">
                {user ? (
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      src={user?.photoURL ?? undefined}
                      alt={user?.displayName ?? undefined}
                    />
                  </IconButton>
                ) : (
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenUserMenu}
                    color="inherit"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                )}
              </Tooltip>

              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem>
                  <Typography textAlign="center" onClick={logUserOut}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          </Toolbar>
        </MuiContainer>
      </AppBar>

      <MuiContainer maxWidth="xl">
        <Box pt={2}>
          <main>{children}</main>
        </Box>
      </MuiContainer>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={routeValue} onChange={handleChange} showLabels>
          <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
          <BottomNavigationAction
            label="Jobs"
            value="/jobs"
            icon={<WorkIcon />}
          />
          <BottomNavigationAction
            label="Servants"
            value="/servants"
            icon={<GroupsIcon />}
          />
          <BottomNavigationAction
            label="Calendar"
            value="/calendar"
            icon={<CalendarMonthIcon />}
          />
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default Container;
