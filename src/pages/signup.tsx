import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from 'components';
import { signInWithGoogle, signUpWithEmailPassword } from 'libs/auth';

const DEFAULT_REDIRECT = '/admin';

const getSafeRedirectPath = (candidate: string | null): string => {
  if (!candidate || !candidate.startsWith('/')) {
    return DEFAULT_REDIRECT;
  }
  return candidate;
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isEmailVerified } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectPath = getSafeRedirectPath(search.get('redirect'));

  useEffect(() => {
    if (!isLoading && user && isEmailVerified) {
      navigate(redirectPath, { replace: true });
    }
  }, [isEmailVerified, isLoading, navigate, redirectPath, user]);

  const handleEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmailPassword({
        displayName,
        email,
        password,
      });
      const next = new URLSearchParams({
        reason: 'verify-email',
        redirect: redirectPath,
      });
      navigate(`/signin?${next.toString()}`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to continue with Google.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5} component="form" onSubmit={handleEmailSignUp}>
            <Typography variant="h4">Sign up</Typography>
            <Typography variant="body2" color="text.secondary">
              Create an account to access the admin area.
            </Typography>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              fullWidth
              autoComplete="name"
              disabled={isSubmitting}
            />
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              autoComplete="email"
              disabled={isSubmitting}
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <TextField
              type="password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Create account
            </Button>

            <Divider>or</Divider>

            <Button variant="outlined" onClick={handleGoogleSignUp} disabled={isSubmitting}>
              Sign up with Google
            </Button>

            <Typography variant="body2" color="text.secondary">
              Already have an account? <Link href="/signin">Sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
