import { LogOut, ShieldCheck, Bell } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import styles from '../../components/layout/Header.module.css';

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  const { admin } = useAdminAuth();

  return (
    <header className={styles.header}>
      <div className={styles.portalTitle}>
        <h2>ADMIN OFFICE PORTAL</h2>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
        </button>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{admin?.name}</span>
            <span className={styles.userId}>{admin?.registerNo}</span>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
