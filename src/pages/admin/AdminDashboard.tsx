import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import { Card, CardContent, Badge } from '../../components/ui';
import styles from '../Dashboard.module.css';
import localStyles from './AdminDashboard.module.css';

interface TranscriptRecord {
  id: string;
  referenceNumber: string;
  appliedDate: string;
  status: 'PENDING' | 'APPLIED' | 'PROCESSING' | 'READY' | 'COLLECTED' | 'REJECTED';
  feeAmount: number;
  student: { name: string; registerNo: string };
}

interface CertificateRecord {
  id: string;
  certificateType: string;
  requestDate: string;
  status: 'PENDING' | 'GENERATED' | 'DOWNLOADED' | 'REJECTED';
  feeAmount: number;
  student: { name: string; registerNo: string };
}

interface QueueItem {
  id: string;
  type: string;
  reference: string;
  student: string;
  date: string;
  status: string;
  amount: number;
  link: string;
}

const quickActions = [
  {
    icon: <BarChart3 size={18} />,
    title: 'Analytics',
    description: 'Distribution by type and status',
    path: '/admin/analytics',
    color: 'black',
  },
  {
    icon: <FileText size={18} />,
    title: 'Transcript Requests',
    description: 'Review and issue transcripts',
    path: '/admin/transcripts',
    color: 'orange',
  },
  {
    icon: <Award size={18} />,
    title: 'Certificate Requests',
    description: 'Review and upload certificates',
    path: '/admin/certificates',
    color: 'green',
  },
];

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (['ready', 'collected', 'generated', 'downloaded'].includes(normalized)) {
    return <Badge variant="success">{status}</Badge>;
  }
  if (['processing', 'applied'].includes(normalized)) {
    return <Badge variant="info">{status}</Badge>;
  }
  if (normalized === 'rejected') {
    return <Badge variant="error">{status}</Badge>;
  }
  return <Badge variant="orange">{status}</Badge>;
}

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get<{ applications: TranscriptRecord[] }>('/admin/transcripts'),
      adminApi.get<{ requests: CertificateRecord[] }>('/admin/certificate-requests'),
    ])
      .then(([transcripts, certificates]) => {
        const fromTranscripts: QueueItem[] = transcripts.applications.map((t) => ({
          id: t.id,
          type: 'Transcript',
          reference: t.referenceNumber,
          student: `${t.student.name} (${t.student.registerNo})`,
          date: t.appliedDate,
          status: t.status,
          amount: t.feeAmount,
          link: '/admin/transcripts',
        }));
        const fromCertificates: QueueItem[] = certificates.requests.map((c) => ({
          id: c.id,
          type: c.certificateType,
          reference: c.id.slice(0, 8).toUpperCase(),
          student: `${c.student.name} (${c.student.registerNo})`,
          date: c.requestDate,
          status: c.status,
          amount: c.feeAmount,
          link: '/admin/certificates',
        }));

        const all = [...fromTranscripts, ...fromCertificates];
        setPendingCount(
          all.filter((i) => !['READY', 'COLLECTED', 'GENERATED', 'DOWNLOADED', 'REJECTED'].includes(i.status)).length
        );
        setProcessedCount(
          all.filter((i) => ['READY', 'COLLECTED', 'GENERATED', 'DOWNLOADED'].includes(i.status)).length
        );
        setQueue(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Requests', value: queue.length, icon: <Layers size={18} />, tone: 'black' },
    { label: 'Pending Review', value: pendingCount, icon: <Clock size={18} />, tone: 'orange' },
    { label: 'Issued', value: processedCount, icon: <CheckCircle size={18} />, tone: 'green' },
  ];

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Admin Office</p>
          <h1 className={styles.pageTitle}>Welcome, {admin?.name?.split(' ')[0] ?? 'Admin'}</h1>
          <p className={styles.pageSubtitle}>{formatToday()}</p>
        </div>
        <Link to="/admin/analytics" className={styles.primaryAction}>
          <BarChart3 size={16} />
          View Analytics
        </Link>
      </div>

      {/* KPI Cards */}
      <div className={`${styles.kpiGrid} ${localStyles.kpiGrid3}`}>
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

      {/* Main Grid: Recent Requests + Review Queues */}
      <div className={styles.mainGrid}>
        <section className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Requests</h2>
          </div>

          <Card variant="default" padding="none">
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        <Loader2 size={16} className={styles.spinner} /> Loading requests…
                      </td>
                    </tr>
                  )}
                  {!loading && queue.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        No requests yet
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    queue.slice(0, 8).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link to={item.link} className={styles.referenceNo}>
                            {item.reference}
                          </Link>
                        </td>
                        <td>{item.student}</td>
                        <td>{item.type}</td>
                        <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={styles.amount}>&#8377; {item.amount.toFixed(2)}</span>
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Review Queues</h2>
          </div>
          <div className={styles.actionsList}>
            {quickActions.map((action) => (
              <Link key={action.title} to={action.path} className={styles.actionLinkCard}>
                <Card variant="default" padding="none" className={styles.actionCardInner}>
                  <CardContent className={styles.actionCardContent}>
                    <span className={`${styles.actionIcon} ${styles[action.color]}`}>{action.icon}</span>
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
    </div>
  );
}
