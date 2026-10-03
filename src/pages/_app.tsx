import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <main>
      <nav>
        <ul>
          <li><a href="/">Go to Home</a></li>
          <li><a href="/store">Go to Store</a></li>
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}
