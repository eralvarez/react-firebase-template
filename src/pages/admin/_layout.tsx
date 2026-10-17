import { Navigate, Outlet, useLocation } from 'react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from 'components';

const DEFAULT_REDIRECT = '/admin';

const buildSignInPath = (redirect: string, reason?: string) => {
  const query = new URLSearchParams({
    redirect,
  });

  if (reason) {
    query.set('reason', reason);
  }

  return `/signin?${query.toString()}`;
};

export default function AdminLayout() {
  const { isLoading, user, isEmailVerified } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const redirectTarget = `${location.pathname}${location.search}` || DEFAULT_REDIRECT;

  if (!user) {
    return <Navigate to={buildSignInPath(redirectTarget)} replace />;
  }

  if (!isEmailVerified) {
    return <Navigate to={buildSignInPath(redirectTarget, 'verify-email')} replace />;
  }

  return <Outlet />;
}