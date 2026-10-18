import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 60 * 1000; // Check for updates every 60 seconds

export default function ReloadPrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_scriptUrl: string, swRegistration: ServiceWorkerRegistration | undefined) {
      setRegistration(swRegistration ?? null);
    },
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed.', error);
    },
  });

  const [offlineReadyValue, setOfflineReadyValue] = offlineReady;
  const [needRefreshValue, setNeedRefreshValue] = needRefresh;

  useEffect(() => {
    if (!registration || !navigator.onLine) {
      return;
    }

    const checkForUpdates = () => {
      if (!navigator.onLine) {
        return;
      }

      void registration.update().catch((error) => {
        console.warn('PWA update check failed.', error);
      });
    };

    checkForUpdates();
    const intervalHandle = window.setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalHandle);
    };
  }, [registration]);

  const dismissPrompt = () => {
    setNeedRefreshValue(false);
    setOfflineReadyValue(false);
  };

  const handleUpdateNow = async () => {
    await updateServiceWorker(true);
  };

  if (!needRefreshValue && !offlineReadyValue) {
    return null;
  }

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={null}
      sx={{ '& .MuiPaper-root': { width: 'min(100%, 440px)', borderRadius: 2 } }}
    >
      <Alert
        severity={needRefreshValue ? 'info' : 'success'}
        action={
          <Stack direction="row" spacing={1}>
            {needRefreshValue ? (
              <Button color="inherit" size="small" onClick={handleUpdateNow}>
                Update now
              </Button>
            ) : null}
            {needRefreshValue ? (
              <Button color="inherit" size="small" onClick={dismissPrompt}>
                Later
              </Button>
            ) : null}
            {!needRefreshValue && offlineReadyValue ? (
              <Button color="inherit" size="small" onClick={dismissPrompt}>
                Dismiss
              </Button>
            ) : null}
          </Stack>
        }
      >
        {needRefreshValue ? 'Update available. Reload to use the newest version.' : 'App ready to work offline.'}
      </Alert>
    </Snackbar>
  );
}
