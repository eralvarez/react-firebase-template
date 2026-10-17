import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from 'components';

export default function AdminHome() {
  const { user } = useAuth();

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h4">Admin</Typography>
          <Typography variant="body1">
            You are authenticated and can access this protected route.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signed in as: {user?.displayName || user?.email}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}