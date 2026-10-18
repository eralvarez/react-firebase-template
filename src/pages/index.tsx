import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Home 3</Typography>
          <Typography variant="body1">Welcome to the home page!</Typography>
          <Button variant="contained" href="/signin">
            Go to Sign in
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
