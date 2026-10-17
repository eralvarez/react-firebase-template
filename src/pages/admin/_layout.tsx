import { Outlet } from 'react-router';
import { AuthGuard } from 'components';

export default function AdminLayout() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}