import Link from 'next/link';
import { ReactElement, useState, MouseEvent } from 'react';
import {
  AppBar,
  Container as MuiContainer,
  MenuItem,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  Button,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';
import { signOut, getAuth } from 'firebase/auth';
import useUser from '../../hooks/useUser';

const Container = ({
  children,
}: {
  children: ReactElement | ReactElement[];
}): ReactElement => {
  const auth = getAuth();
  const { user } = useUser();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logUserOut = () => {
    setAnchorElNav(null);
    setAnchorElUser(null);
    signOut(auth);
  };

  const pages = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Servants',
      href: '/servants',
    },
    {
      name: 'Create Calendar',
      href: '/createCalendar',
    },
  ];

  const siteTitle = 'Those Who Serve';

  const PagesLink = styled.a({
    color: 'inherit',
    textDecoration: 'none',
  });

  return (
    <>
      <AppBar position="sticky">
        <MuiContainer maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
              {siteTitle}
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                      <Link href={page.href} passHref>
                        <PagesLink>{page.name}</PagesLink>
                      </Link>
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              {siteTitle}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  <Link href={page.href} passHref>
                    <PagesLink>{page.name}</PagesLink>
                  </Link>
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                {user ? (
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.displayName} src={user.photoURL} />
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
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center" onClick={logUserOut}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </MuiContainer>
      </AppBar>

      <MuiContainer maxWidth="xl">
        <Box pt={2}>
          <main>{children}</main>
        </Box>
      </MuiContainer>
    </>
  );
};

export default Container;
