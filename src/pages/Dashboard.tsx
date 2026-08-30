import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Award,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
<<<<<<< HEAD
  Layers,
  Loader2,
=======
  TrendingUp,
>>>>>>> origin/feature/backend-docker-stack
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, CardContent, Badge } from '../components/ui';
import styles from './Dashboard.module.css';

const quickActions = [
  {
<<<<<<< HEAD
    icon: <FileText size={18} />,
=======
    icon: <FileText size={24} />,
>>>>>>> origin/feature/backend-docker-stack
    title: 'Apply for Transcript',
    description: 'Request official academic transcripts',
    path: '/transcript',
    color: 'orange',
  },
  {
<<<<<<< HEAD
    icon: <Award size={18} />,
    title: 'Certificate Request',
    description: 'Bonafide, course completion & more',
=======
    icon: <Award size={24} />,
    title: 'Certificate Request',
    description: 'Request certificates (Bonafide, Course Completion, etc.)',
>>>>>>> origin/feature/backend-docker-stack
    path: '/certificates',
    color: 'green',
  },
  {
<<<<<<< HEAD
    icon: <CreditCard size={18} />,
=======
    icon: <CreditCard size={24} />,
>>>>>>> origin/feature/backend-docker-stack
    title: 'Payment History',
    description: 'View your payment transactions',
    path: '/payment-history',
    color: 'black',
  },
];

interface Application {
  id: string;
  type: string;
  referenceNo: string;
  date: string;
  status: 'pending' | 'processing' | 'completed';
  amount: number;
}

interface TranscriptRecord {
  id: string;
  referenceNumber: string;
  appliedDate: string;
  status: 'PENDING' | 'APPLIED' | 'PROCESSING' | 'READY' | 'COLLECTED' | 'REJECTED';
  feeAmount: number;
}

interface CertificateRecord {
  id: string;
  certificateType: string;
  requestDate: string;
  status: 'PENDING' | 'GENERATED' | 'DOWNLOADED' | 'REJECTED';
  feeAmount: number;
}

function mapTranscriptStatus(status: TranscriptRecord['status']): Application['status'] {
  if (status === 'READY' || status === 'COLLECTED') return 'completed';
  if (status === 'PROCESSING' || status === 'APPLIED') return 'processing';
  return 'pending';
}

function mapCertificateStatus(status: CertificateRecord['status']): Application['status'] {
  if (status === 'GENERATED' || status === 'DOWNLOADED') return 'completed';
  return 'pending';
}

<<<<<<< HEAD
=======
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={16} className={styles.statusIconSuccess} />;
    case 'processing':
      return <Clock size={16} className={styles.statusIconWarning} />;
    case 'pending':
      return <AlertCircle size={16} className={styles.statusIconInfo} />;
    default:
      return null;
  }
};

>>>>>>> origin/feature/backend-docker-stack
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'processing':
<<<<<<< HEAD
      return <Badge variant="info">Processing</Badge>;
=======
      return <Badge variant="orange">Processing</Badge>;
>>>>>>> origin/feature/backend-docker-stack
    case 'pending':
      return <Badge variant="orange">Pending</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

<<<<<<< HEAD
function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
=======
export function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
>>>>>>> origin/feature/backend-docker-stack

  useEffect(() => {
    Promise.all([
      api.get<{ applications: TranscriptRecord[] }>('/transcripts'),
      api.get<{ requests: CertificateRecord[] }>('/certificates'),
    ])
      .then(([transcripts, certificates]) => {
        const fromTranscripts: Application[] = transcripts.applications.map((t) => ({
          id: t.id,
          type: 'Transcript',
          referenceNo: t.referenceNumber,
          date: t.appliedDate,
          status: mapTranscriptStatus(t.status),
          amount: t.feeAmount,
        }));
        const fromCertificates: Application[] = certificates.requests.map((c) => ({
          id: c.id,
          type: c.certificateType,
          referenceNo: c.id.slice(0, 8).toUpperCase(),
          date: c.requestDate,
          status: mapCertificateStatus(c.status),
          amount: c.feeAmount,
        }));
        setApplications(
          [...fromTranscripts, ...fromCertificates].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      })
<<<<<<< HEAD
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCount = applications.length;
  const completedCount = applications.filter((a) => a.status === 'completed').length;
  const processingCount = applications.filter((a) => a.status === 'processing').length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const kpis = [
    {
      label: 'Total Requests',
      value: totalCount,
      icon: <Layers size={18} />,
      tone: 'black',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: <AlertCircle size={18} />,
      tone: 'orange',
    },
    {
      label: 'Processing',
      value: processingCount,
      icon: <Clock size={18} />,
      tone: 'orange',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <CheckCircle size={18} />,
      tone: 'green',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h1 className={styles.pageTitle}>
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className={styles.pageSubtitle}>{formatToday()}</p>
        </div>
        <Link to="/certificates" className={styles.primaryAction}>
          <Award size={16} />
          New Certificate Request
        </Link>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="default" padding="none" className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={`${styles.kpiIcon} ${styles[kpi.tone]}`}>{kpi.icon}</span>
            </div>
            <span className={styles.kpiValue}>{loading ? '—' : kpi.value}</span>
          </Card>
        ))}
      </div>

      {/* Main Grid: Recent Applications + Quick Actions */}
      <div className={styles.mainGrid}>
        <section className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            <Link to="/application-status" className={styles.viewAllLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <Card variant="default" padding="none">
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference No.</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        <Loader2 size={16} className={styles.spinner} /> Loading applications…
                      </td>
                    </tr>
                  )}
                  {!loading && applications.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        No applications yet. Start with a certificate or transcript request.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    applications.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td>
                          <span className={styles.referenceNo}>{app.referenceNo}</span>
                        </td>
                        <td>{app.type}</td>
                        <td>{new Date(app.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={styles.amount}>&#8377; {app.amount.toFixed(2)}</span>
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
          </div>
          <div className={styles.actionsList}>
            {quickActions.map((action) => (
              <Link key={action.title} to={action.path} className={styles.actionLinkCard}>
                <Card variant="default" padding="none" className={styles.actionCardInner}>
                  <CardContent className={styles.actionCardContent}>
                    <span className={`${styles.actionIcon} ${styles[action.color]}`}>
                      {action.icon}
                    </span>
                    <div className={styles.actionText}>
                      <h3 className={styles.actionTitle}>{action.title}</h3>
                      <p className={styles.actionDescription}>{action.description}</p>
                    </div>
                    <ArrowRight size={16} className={styles.actionArrow} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Profile Summary */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Profile</h2>
          <Link to="/profile" className={styles.viewAllLink}>
            View Profile <ArrowRight size={14} />
          </Link>
        </div>
        <Card variant="default" padding="md">
=======
      .catch(() => {});
  }, []);

  const completedCount = applications.filter((a) => a.status === 'completed').length;
  const inProgressCount = applications.filter((a) => a.status !== 'completed').length;

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span>{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Manage your certificate requests and track your applications
          </p>
        </div>
        <div className={styles.welcomeStats}>
          <div className={styles.stat}>
            <TrendingUp size={20} />
            <span className={styles.statValue}>{applications.length}</span>
            <span className={styles.statLabel}>Total Applications</span>
          </div>
          <div className={styles.stat}>
            <CheckCircle size={20} />
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.stat}>
            <Clock size={20} />
            <span className={styles.statValue}>{inProgressCount}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Link key={action.title} to={action.path} className={styles.actionCard}>
              <Card variant="elevated" padding="lg" className={styles.actionCardInner}>
                <CardContent>
                  <div className={`${styles.actionIcon} ${styles[action.color]}`}>
                    {action.icon}
                  </div>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                  <span className={styles.actionLink}>
                    Get Started <ArrowRight size={16} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Applications */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Applications</h2>
          <Link to="/application-status" className={styles.viewAllLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <Card variant="default" padding="none">
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference No.</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5}>No applications yet</td>
                  </tr>
                )}
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span className={styles.referenceNo}>{app.referenceNo}</span>
                    </td>
                    <td>{app.type}</td>
                    <td>{new Date(app.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={styles.amount}>&#8377; {app.amount.toFixed(2)}</span>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        {getStatusIcon(app.status)}
                        {getStatusBadge(app.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Student Info Card */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Profile</h2>
        <Card variant="gradient" padding="lg">
>>>>>>> origin/feature/backend-docker-stack
          <div className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Name</span>
              <span className={styles.profileValue}>{user?.name}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Register No.</span>
              <span className={styles.profileValue}>{user?.registerNo}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Course</span>
<<<<<<< HEAD
              <span className={styles.profileValue}>
                {user?.degree} - {user?.branch}
              </span>
=======
              <span className={styles.profileValue}>{user?.degree} - {user?.branch}</span>
>>>>>>> origin/feature/backend-docker-stack
            </div>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Gender</span>
              <span className={styles.profileValue}>{user?.gender}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Admitted Year</span>
              <span className={styles.profileValue}>{user?.admittedYear}</span>
            </div>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Institution</span>
              <span className={styles.profileValue}>{user?.institution}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}