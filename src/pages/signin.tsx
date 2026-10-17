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
import { resendVerificationEmail, signInWithEmailPassword, signInWithGoogle } from 'libs/auth';

const DEFAULT_REDIRECT = '/admin';

const getSafeRedirectPath = (candidate: string | null): string => {
  if (!candidate || !candidate.startsWith('/')) {
    return DEFAULT_REDIRECT;
  }
  return candidate;
};

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isEmailVerified } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectPath = getSafeRedirectPath(search.get('redirect'));
  const reason = search.get('reason');
  const showVerificationBanner = reason === 'verify-email' || (!!user && !isEmailVerified);

  useEffect(() => {
    if (!isLoading && user && isEmailVerified) {
      navigate(redirectPath, { replace: true });
    }
  }, [isEmailVerified, isLoading, navigate, redirectPath, user]);

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const signedInUser = await signInWithEmailPassword(email, password);
      if (signedInUser.emailVerified) {
        navigate(redirectPath, { replace: true });
      } else {
        setSuccessMessage('Sign-in successful. Please verify your email before accessing admin.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!user) {
      setErrorMessage('Sign in first to resend a verification email.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await resendVerificationEmail(user);
      setSuccessMessage('Verification email sent. Check your inbox.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send verification email.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5} component="form" onSubmit={handleEmailSignIn}>
            <Typography variant="h4">Sign in</Typography>
            <Typography variant="body2" color="text.secondary">
              Access your account using email/password or Google.
            </Typography>

            {showVerificationBanner ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={handleResendVerificationEmail}>
                    Resend email
                  </Button>
                }
              >
                Your email is not verified yet. Verify it to access admin.
              </Alert>
            ) : null}

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

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
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Sign in with email
            </Button>

            <Divider>or</Divider>

            <Button variant="outlined" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              Continue with Google
            </Button>

            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account? <Link href="/signup">Create one</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
