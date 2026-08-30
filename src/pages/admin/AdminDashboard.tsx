import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Award, Clock, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import { Card, CardContent, Badge } from '../../components/ui';
import styles from '../Dashboard.module.css';

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
    icon: <FileText size={24} />,
    title: 'Transcript Requests',
    description: 'Review, approve, and issue transcript applications',
    path: '/admin/transcripts',
    color: 'orange',
  },
  {
    icon: <Award size={24} />,
    title: 'Certificate Requests',
    description: 'Review and upload generated certificates',
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
    return <Badge variant="warning">{status}</Badge>;
  }
  if (normalized === 'rejected') {
    return <Badge variant="error">{status}</Badge>;
  }
  return <Badge variant="info">{status}</Badge>;
}

export function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

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
      .catch(() => {});
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome, <span>{admin?.name?.split(' ')[0]}</span>
          </h1>
          <p className={styles.welcomeSubtitle}>Review requests and issue certificates for students</p>
        </div>
        <div className={styles.welcomeStats}>
          <div className={styles.stat}>
            <TrendingUp size={20} />
            <span className={styles.statValue}>{queue.length}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
          <div className={styles.stat}>
            <Clock size={20} />
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statLabel}>Pending Review</span>
          </div>
          <div className={styles.stat}>
            <CheckCircle size={20} />
            <span className={styles.statValue}>{processedCount}</span>
            <span className={styles.statLabel}>Issued</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Review Queues</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Link key={action.title} to={action.path} className={styles.actionCard}>
              <Card variant="elevated" padding="lg" className={styles.actionCardInner}>
                <CardContent>
                  <div className={`${styles.actionIcon} ${styles[action.color]}`}>{action.icon}</div>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                  <span className={styles.actionLink}>
                    Open queue <ArrowRight size={16} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
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
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={6}>No requests yet</td>
                  </tr>
                )}
                {queue.slice(0, 8).map((item) => (
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
                    <td>
                      <div className={styles.statusCell}>{getStatusBadge(item.status)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
