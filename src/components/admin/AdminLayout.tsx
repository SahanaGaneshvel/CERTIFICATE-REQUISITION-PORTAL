import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuth } from '../../context/AdminAuthContext';
import styles from '../layout/DashboardLayout.module.css';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.main}>
        <AdminHeader onLogout={handleLogout} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
