import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Award, Menu, X, BarChart3 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import styles from '../../components/layout/Sidebar.module.css';
import localStyles from './AdminSidebar.module.css';

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin/dashboard' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
  { icon: <FileText size={20} />, label: 'Transcript Requests', path: '/admin/transcripts' },
  { icon: <Award size={20} />, label: 'Certificate Requests', path: '/admin/certificates' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const { admin } = useAdminAuth();

  return (
    <>
      <button className={styles.mobileToggle} onClick={onToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.studentInfo}>
          <div className={localStyles.brandLockup}>
            <span className={localStyles.brandName}>HINDUSTAN</span>
            <span className={localStyles.brandSubtitle}>Institute of Technology &amp; Science</span>
            <span className={localStyles.brandUniversity}>(Deemed to be University)</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.label} className={styles.menuItem}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `${styles.menuLink} ${isActive ? styles.active : ''}`}
                onClick={() => isOpen && onToggle()}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userId}>{admin?.registerNo}</span>
            <span className={styles.userName}>{admin?.name}</span>
          </div>
        </div>
      </aside>

      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  );
}
