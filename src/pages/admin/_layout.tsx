import { Outlet } from 'react-router';
import {
  AuthGuard,
  DashboardLayout,
  type DashboardNavGroup,
  type DashboardNavItem,
} from 'components';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

const sidebarGroups: DashboardNavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { label: 'Admin overview', to: '/admin', icon: <DashboardOutlinedIcon /> },
      { label: 'Store', to: '/store', icon: <StorefrontOutlinedIcon /> },
    ],
  },
  {
    id: 'site',
    label: 'Site',
    items: [{ label: 'Home', to: '/', icon: <HomeOutlinedIcon /> }],
  },
];

const bottomTabs: DashboardNavItem[] = [
  { label: 'Admin', to: '/admin', icon: <DashboardOutlinedIcon /> },
  { label: 'Store', to: '/store', icon: <StorefrontOutlinedIcon /> },
  { label: 'Home', to: '/', icon: <HomeOutlinedIcon /> },
];

export default function AdminLayout() {
  return (
    <AuthGuard>
      <DashboardLayout title="Admin" sidebarGroups={sidebarGroups} bottomTabs={bottomTabs}>
        <Outlet />
      </DashboardLayout>
    </AuthGuard>
  );
}
