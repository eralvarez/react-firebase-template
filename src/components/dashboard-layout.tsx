import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import { signOutUser } from 'libs/auth';
import { useAuth } from './auth-context';

const DRAWER_WIDTH = 264;

export interface DashboardNavItem {
  label: string;
  to: string;
  icon?: ReactNode;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

interface DashboardLayoutProps {
  title: string;
  sidebarGroups: DashboardNavGroup[];
  bottomTabs: DashboardNavItem[];
  children: ReactNode;
}

const isPathActive = (pathname: string, to: string) =>
  pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));

const getInitials = (name: string) => {
  const words = name
    .trim()
    .split(/[\s@._+-]+/)
    .filter(Boolean);
  if (words.length > 1) {
    return `${words[0]?.[0] ?? ''}${words[words.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return words[0]?.slice(0, 2).toUpperCase() ?? '';
};

export function DashboardLayout({
  title,
  sidebarGroups,
  bottomTabs,
  children,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const location = useLocation();
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set<string>());
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [signOutError, setSignOutError] = useState('');

  const userLabel = user?.displayName?.trim() || user?.email || 'Account';
  const initials = getInitials(user?.displayName?.trim() || user?.email?.split('@')[0] || '');

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const closeMobileDrawer = () => setMobileDrawerOpen(false);

  const handleSignOut = async () => {
    setUserMenuAnchor(null);
    setSignOutError('');
    try {
      await signOutUser();
      window.location.href = '/signin';
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Failed to sign out.');
    }
  };

  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          px: 2.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Navigation
        </Typography>
        {!isDesktop ? (
          <IconButton aria-label="Close dashboard sidebar" onClick={closeMobileDrawer}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </Stack>
      <Divider />
      <Box
        component="nav"
        aria-label="Dashboard sidebar"
        sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}
      >
        {sidebarGroups.map((group) => {
          const isExpanded = !collapsedGroups.has(group.id);
          const groupItemsId = `dashboard-nav-${group.id}`;

          return (
            <Box key={group.id}>
              <List disablePadding>
                <ListItemButton
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                  aria-controls={groupItemsId}
                  sx={{ px: 2.5, py: 1 }}
                >
                  <ListItemText
                    primary={group.label}
                    slotProps={{ primary: { variant: 'overline', color: 'text.secondary' } }}
                  />
                  {isExpanded ? (
                    <ExpandLessIcon fontSize="small" color="action" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" color="action" />
                  )}
                </ListItemButton>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List id={groupItemsId} disablePadding>
                    {group.items.map((item) => (
                      <ListItemButton
                        key={`${group.id}-${item.to}`}
                        component={RouterLink}
                        to={item.to}
                        selected={isPathActive(location.pathname, item.to)}
                        onClick={closeMobileDrawer}
                        sx={{ minHeight: 44, px: 2.5, pl: 3 }}
                      >
                        {item.icon ? (
                          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                        ) : null}
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileDrawerOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            ...(isDesktop ? { position: 'relative', height: '100vh' } : {}),
          },
        }}
      >
        {sidebar}
      </Drawer>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          sx={{ zIndex: theme.zIndex.appBar, borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            {!isDesktop ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Open dashboard sidebar"
                onClick={() => setMobileDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <Button
              color="inherit"
              onClick={(event) => setUserMenuAnchor(event.currentTarget)}
              startIcon={
                <Avatar
                  src={user?.photoURL || undefined}
                  alt={userLabel}
                  sx={{ width: 32, height: 32 }}
                >
                  {initials}
                </Avatar>
              }
              aria-label={`Open account menu for ${userLabel}`}
              aria-haspopup="menu"
              aria-expanded={userMenuAnchor ? 'true' : undefined}
              sx={{
                maxWidth: { xs: 160, sm: 280 },
                minWidth: 0,
                px: 1,
                '& .MuiButton-startIcon': { mr: 1 },
              }}
            >
              <Typography
                component="span"
                variant="body2"
                noWrap
                sx={{ display: 'block', maxWidth: { xs: 104, sm: 220 } }}
              >
                {userLabel}
              </Typography>
            </Button>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
            >
              <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {signOutError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {signOutError}
          </Alert>
        ) : null}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            pb:
              !isDesktop && bottomTabs.length > 0 ? 'calc(88px + env(safe-area-inset-bottom))' : 3,
          }}
        >
          {children}
        </Box>
      </Box>

      {!isDesktop && bottomTabs.length > 0 ? (
        <Paper
          component="nav"
          aria-label="Dashboard bottom navigation"
          square
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            pb: 'env(safe-area-inset-bottom)',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <BottomNavigation
            value={bottomTabs.find((item) => isPathActive(location.pathname, item.to))?.to ?? false}
          >
            {bottomTabs.map((item) => (
              <BottomNavigationAction
                key={item.to}
                component={RouterLink}
                to={item.to}
                value={item.to}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Box>
  );
}
