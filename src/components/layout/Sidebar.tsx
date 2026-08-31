import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Award,
  ClipboardCheck,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <User size={20} />,
    label: 'My Profile',
    path: '/profile',
  },
  {
    icon: <FileText size={20} />,
    label: 'Apply for Transcript',
    path: '/transcript',
  },
  {
    icon: <Award size={20} />,
    label: 'Certificate Request',
    path: '/certificates',
  },
  {
    icon: <ClipboardCheck size={20} />,
    label: 'Application Status',
    path: '/application-status',
  },
  {
    icon: <CreditCard size={20} />,
    label: 'Payment History',
    path: '/payment-history',
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return now.toLocaleDateString('en-IN', options).replace(/,/g, '');
  };

  return (
    <>
      <button className={styles.mobileToggle} onClick={onToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.studentInfo}>
          <div className={styles.studentAvatar}>
            <img src="/hindustan-logo.png" alt="Hindustan Institute of Technology & Science" className={styles.studentLogo} />
          </div>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.label} className={styles.menuItem}>
              {item.children ? (
                <>
                  <button
                    className={styles.menuButton}
                    onClick={() => toggleExpand(item.label)}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    <span className={styles.menuArrow}>
                      {expandedItems.includes(item.label) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className={styles.submenu}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `${styles.submenuLink} ${isActive ? styles.active : ''}`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `${styles.menuLink} ${isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}

          {/* Logout Button */}
          <div className={styles.menuItem}>
            <button className={styles.menuLink} onClick={logout}>
              <span className={styles.menuIcon}><LogOut size={20} /></span>
              <span className={styles.menuLabel}>Logout</span>
            </button>
          </div>
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userId}>{user?.registerNo || 'Student'}</span>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.timestamp}>{formatDate()}</span>
          </div>
        </div>
      </aside>

      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  );
}
