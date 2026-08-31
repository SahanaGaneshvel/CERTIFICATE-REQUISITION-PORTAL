import { useEffect, useState } from 'react';
import { Award, FileText, TrendingUp, PackageCheck } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import styles from './AdminAnalytics.module.css';

interface AnalyticsResponse {
  totals: {
    certificates: number;
    transcripts: number;
    certificatesIssued: number;
    transcriptsIssued: number;
  };
  certificatesByType: { type: string; count: number }[];
  certificatesByStatus: { status: string; count: number }[];
  transcriptsByStatus: { status: string; count: number }[];
}

const CERT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  GENERATED: 'Generated',
  DOWNLOADED: 'Downloaded',
  REJECTED: 'Rejected',
};

const TRANSCRIPT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  APPLIED: 'Applied',
  PROCESSING: 'Processing',
  READY: 'Ready',
  COLLECTED: 'Collected',
  REJECTED: 'Rejected',
};

// Status color is reserved and fixed per state — never reassigned by rank or filter,
// so "Rejected" is always the same hue everywhere in the app.
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'var(--gray-400)',
  APPLIED: 'var(--info)',
  PROCESSING: 'var(--info)',
  GENERATED: 'var(--success)',
  READY: 'var(--success)',
  DOWNLOADED: 'var(--primary-green)',
  COLLECTED: 'var(--primary-green)',
  REJECTED: 'var(--error)',
};

// Fixed categorical order for certificate-type bars — never re-derived from sort
// order, so the same type keeps the same color across reloads and filters.
const TYPE_COLORS = ['var(--primary-orange)', 'var(--primary-green)', 'var(--gold)', 'var(--gray-600)', 'var(--orange-dark)', 'var(--green-dark)'];

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card variant="default" padding="md" className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </Card>
  );
}

function TypeBarChart({ data }: { data: { type: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return <p className={styles.emptyState}>No certificate requests yet.</p>;
  }

  return (
    <div className={styles.barChart} role="img" aria-label="Certificates distributed by type">
      {data.map((d, i) => (
        <div key={d.type} className={styles.barRow}>
          <span className={styles.barLabel} title={d.type}>
            {d.type}
          </span>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                width: `${(d.count / max) * 100}%`,
                background: TYPE_COLORS[i % TYPE_COLORS.length],
              }}
            />
          </div>
          <span className={styles.barValue}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBreakdown({
  data,
  labels,
  total,
}: {
  data: { status: string; count: number }[];
  labels: Record<string, string>;
  total: number;
}) {
  if (total === 0) {
    return <p className={styles.emptyState}>No requests yet.</p>;
  }

  return (
    <div className={styles.statusBreakdown}>
      <div className={styles.stackedBar} role="img" aria-label="Status breakdown">
        {data
          .filter((d) => d.count > 0)
          .map((d) => (
            <div
              key={d.status}
              className={styles.stackedSegment}
              style={{ width: `${(d.count / total) * 100}%`, background: STATUS_COLOR[d.status] ?? 'var(--gray-400)' }}
              title={`${labels[d.status] ?? d.status}: ${d.count}`}
            />
          ))}
      </div>
      <div className={styles.legend}>
        {data.map((d) => (
          <div key={d.status} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: STATUS_COLOR[d.status] ?? 'var(--gray-400)' }} />
            <span className={styles.legendLabel}>{labels[d.status] ?? d.status}</span>
            <span className={styles.legendValue}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get<AnalyticsResponse>('/admin/analytics')
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className={styles.container}>Loading analytics...</div>;
  }

  if (!data) {
    return <div className={styles.container}>Failed to load analytics.</div>;
  }

  const totalRequests = data.totals.certificates + data.totals.transcripts;
  const totalIssued = data.totals.certificatesIssued + data.totals.transcriptsIssued;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Analytics</p>
        <h1 className={styles.title}>Certificate Distribution Overview</h1>
      </div>

      <div className={styles.statsGrid}>
        <StatTile icon={<TrendingUp size={20} />} label="Total Requests" value={totalRequests} />
        <StatTile icon={<PackageCheck size={20} />} label="Total Issued" value={totalIssued} />
        <StatTile icon={<Award size={20} />} label="Certificate Requests" value={data.totals.certificates} />
        <StatTile icon={<FileText size={20} />} label="Transcript Requests" value={data.totals.transcripts} />
      </div>

      <div className={styles.chartsGrid}>
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Certificates by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <TypeBarChart data={data.certificatesByType} />
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Certificate Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdown data={data.certificatesByStatus} labels={CERT_STATUS_LABEL} total={data.totals.certificates} />
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Transcript Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdown data={data.transcriptsByStatus} labels={TRANSCRIPT_STATUS_LABEL} total={data.totals.transcripts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
