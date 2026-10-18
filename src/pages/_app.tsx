import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import theme from '../theme';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { AuthProvider, useAuth, ReloadPrompt } from 'components';
import { signOutUser } from 'libs/auth';

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { user, isEmailVerified } = useAuth();
  const { pathname } = useLocation();
  const [signOutError, setSignOutError] = useState<string>('');
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  const handleSignOut = async () => {
    setSignOutError('');
    try {
      await signOutUser();
      window.location.href = '/signin';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out.';
      setSignOutError(message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {!isAdminRoute ? (
        <AppBar position="static" color="transparent">
          <Toolbar>
            <Container maxWidth="lg" disableGutters>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={1}>
                  <Button variant="text" href="/">
                    Home
                  </Button>
                  <Button variant="text" href="/store">
                    Store
                  </Button>
                  {user ? (
                    <Button variant="text" href="/admin">
                      Admin
                    </Button>
                  ) : null}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {user ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {user.displayName || user.email}
                      </Typography>
                      {!isEmailVerified ? (
                        <Chip size="small" label="Email not verified" color="warning" />
                      ) : null}
                      <Button variant="outlined" color="inherit" onClick={handleSignOut}>
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" color="inherit" href="/signin">
                        Sign in
                      </Button>
                      <Button variant="contained" href="/signup">
                        Sign up
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Container>
          </Toolbar>
        </AppBar>
      ) : null}
      {isAdminRoute ? (
        <Box component="main" sx={{ minHeight: '100vh' }}>
          <ReloadPrompt />
          <Outlet />
        </Box>
      ) : (
        <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
          {signOutError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {signOutError}
            </Alert>
          ) : null}
          <ReloadPrompt />
          <Outlet />
        </Container>
      )}
    </Box>
  );
}
