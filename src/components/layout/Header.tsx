import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img
          src="/hindustan-logo.png"
          alt="Hindustan Institute of Technology & Science"
          className={styles.logo}
        />
        <div className={styles.brandText}>
          <h1 className={styles.title}>HINDUSTAN</h1>
          <p className={styles.subtitle}>Institute of Technology & Science</p>
          <span className={styles.university}>(Deemed to be University)</span>
        </div>
      </div>

      <div className={styles.portalTitle}>
        <h2>
          Certificate Requisition <span>Portal</span>
        </h2>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
        </button>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userId}>{user?.registerNo}</span>
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