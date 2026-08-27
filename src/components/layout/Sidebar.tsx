import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CreditCard,
  FileText,
  GraduationCap,
  ClipboardList,
  Calendar,
  Building2,
  BarChart3,
  Bus,
  Wallet,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
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
    label: 'Personal Details',
    path: '/profile',
  },
  {
    icon: <CreditCard size={20} />,
    label: 'Fee Payment',
    path: '/fee-payment',
  },
  {
    icon: <BarChart3 size={20} />,
    label: 'Grade / Mark & Credit',
    path: '/grades',
  },
  {
    icon: <GraduationCap size={20} />,
    label: 'Course Status',
    path: '/course-status',
  },
  {
    icon: <Calendar size={20} />,
    label: 'Academic Calendar/Planner',
    path: '/academic-calendar',
  },
  {
    icon: <ClipboardList size={20} />,
    label: 'Student Course Registration',
    path: '/course-registration',
  },
  {
    icon: <FileText size={20} />,
    label: 'Attendance Details',
    path: '/attendance',
  },
  {
    icon: <FileText size={20} />,
    label: 'Exam Provisional Results',
    path: '/provisional-results',
  },
  {
    icon: <FileText size={20} />,
    label: 'Exam Revaluation Results',
    path: '/revaluation-results',
  },
  {
    icon: <Calendar size={20} />,
    label: 'Timetable',
    path: '/timetable',
  },
  {
    icon: <Building2 size={20} />,
    label: 'Hostel',
    path: '/hostel',
  },
  {
    icon: <FileText size={20} />,
    label: 'Internal Mark Details',
    path: '/internal-marks',
  },
  {
    icon: <Bus size={20} />,
    label: 'Transport Details',
    path: '/transport',
  },
  {
    icon: <Wallet size={20} />,
    label: 'Finance Details',
    path: '/finance',
  },
  {
    icon: <Bell size={20} />,
    label: 'Notice Board',
    path: '/notices',
  },
  {
    icon: <MessageSquare size={20} />,
    label: 'Student Feedback',
    path: '/feedback',
  },
  {
    icon: <FileText size={20} />,
    label: 'ABC ID Generation',
    path: '/abc-id',
  },
  {
    icon: <Bus size={20} />,
    label: 'Transport Booking',
    path: '/transport-booking',
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      <button className={styles.mobileToggle} onClick={onToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.studentInfo}>
          <div className={styles.studentAvatar}>
            <User size={32} />
          </div>
          <div className={styles.studentDetails}>
            <span className={styles.studentName}>Student Portal</span>
            <span className={styles.studentInstitution}>HITS</span>
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
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userId}>RA2311003010079</span>
            <span className={styles.userName}>VIJAY BALA MAHALINGAM</span>
            <span className={styles.timestamp}>Thu 27-Aug-2026 09:51:16</span>
          </div>
        </div>
      </aside>

      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  );
}
