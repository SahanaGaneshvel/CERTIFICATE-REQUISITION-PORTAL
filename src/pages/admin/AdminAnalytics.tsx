import { useEffect, useState } from 'react';
import { Award, FileText, Layers, PackageCheck } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import dashboardStyles from '../Dashboard.module.css';
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
  trend: { date: string; certificates: number; transcripts: number }[];
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

// Status color is reserved and fixed per state — never reassigned by rank or
// filter, so "Rejected" is always the same hue everywhere in the app.
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'var(--gray-400)',
  APPLIED: 'var(--primary-orange)',
  PROCESSING: 'var(--primary-orange)',
  GENERATED: 'var(--primary-green)',
  READY: 'var(--primary-green)',
  DOWNLOADED: 'var(--green-dark)',
  COLLECTED: 'var(--green-dark)',
  REJECTED: 'var(--error)',
};

// Fixed categorical order for certificate-type bars — never re-derived from sort
// order, so the same type keeps the same color across reloads and filters.
const TYPE_COLORS = ['var(--primary-orange)', 'var(--primary-green)', 'var(--gold)', 'var(--action-black)', 'var(--orange-dark)', 'var(--green-dark)'];

function KpiTile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <Card variant="default" padding="none" className={dashboardStyles.kpiCard}>
      <div className={dashboardStyles.kpiTop}>
        <span className={dashboardStyles.kpiLabel}>{label}</span>
        <span className={`${dashboardStyles.kpiIcon} ${dashboardStyles[tone]}`}>{icon}</span>
      </div>
      <span className={dashboardStyles.kpiValue}>{value}</span>
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

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const CHART_PAD = 28;

function buildLinePath(values: number[], max: number) {
  const step = (CHART_WIDTH - CHART_PAD * 2) / (values.length - 1 || 1);
  return values
    .map((v, i) => {
      const x = CHART_PAD + i * step;
      const y = CHART_HEIGHT - CHART_PAD - (v / max) * (CHART_HEIGHT - CHART_PAD * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function TrendChart({ trend }: { trend: AnalyticsResponse['trend'] }) {
  const certificates = trend.map((t) => t.certificates);
  const transcripts = trend.map((t) => t.transcripts);
  const max = Math.max(...certificates, ...transcripts, 1);
  const step = (CHART_WIDTH - CHART_PAD * 2) / (trend.length - 1 || 1);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={styles.trendChartWrapper}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className={styles.trendSvg}
        role="img"
        aria-label="Certificate and transcript requests over the last 7 days"
      >
        {gridLines.map((g) => {
          const y = CHART_HEIGHT - CHART_PAD - g * (CHART_HEIGHT - CHART_PAD * 2);
          return <line key={g} x1={CHART_PAD} y1={y} x2={CHART_WIDTH - CHART_PAD} y2={y} className={styles.gridLine} />;
        })}

        <path d={buildLinePath(certificates, max)} className={styles.lineCertificates} />
        <path d={buildLinePath(transcripts, max)} className={styles.lineTranscripts} />

        {trend.map((t, i) => {
          const x = CHART_PAD + i * step;
          const yCert = CHART_HEIGHT - CHART_PAD - (t.certificates / max) * (CHART_HEIGHT - CHART_PAD * 2);
          const yTrans = CHART_HEIGHT - CHART_PAD - (t.transcripts / max) * (CHART_HEIGHT - CHART_PAD * 2);
          return (
            <g key={t.date}>
              <circle cx={x} cy={yCert} r={4} className={styles.dotCertificates} />
              <circle cx={x} cy={yTrans} r={4} className={styles.dotTranscripts} />
              <text x={x} y={CHART_HEIGHT - 6} className={styles.axisLabel} textAnchor="middle">
                {new Date(t.date).toLocaleDateString('en-IN', { weekday: 'short' })}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.trendLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--primary-orange)' }} />
          <span className={styles.legendLabel}>Certificates</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--primary-green)' }} />
          <span className={styles.legendLabel}>Transcripts</span>
        </div>
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
    return <div className={dashboardStyles.container}>Loading analytics…</div>;
  }

  if (!data) {
    return <div className={dashboardStyles.container}>Failed to load analytics.</div>;
  }

  const totalRequests = data.totals.certificates + data.totals.transcripts;
  const totalIssued = data.totals.certificatesIssued + data.totals.transcriptsIssued;

  return (
    <div className={dashboardStyles.container}>
      <div className={dashboardStyles.pageHeader}>
        <div>
          <p className={dashboardStyles.eyebrow}>Analytics</p>
          <h1 className={dashboardStyles.pageTitle}>Certificate Distribution Overview</h1>
          <p className={dashboardStyles.pageSubtitle}>How requests break down by type, status, and time</p>
        </div>
      </div>

      <div className={dashboardStyles.kpiGrid}>
        <KpiTile icon={<Layers size={18} />} label="Total Requests" value={totalRequests} tone="black" />
        <KpiTile icon={<PackageCheck size={18} />} label="Total Issued" value={totalIssued} tone="green" />
        <KpiTile icon={<Award size={18} />} label="Certificate Requests" value={data.totals.certificates} tone="orange" />
        <KpiTile icon={<FileText size={18} />} label="Transcript Requests" value={data.totals.transcripts} tone="orange" />
      </div>

      <Card variant="default" padding="lg">
        <CardHeader>
          <div className={styles.trendHeader}>
            <CardTitle>Requests Overview</CardTitle>
            <span className={styles.periodLabel}>Last 7 days</span>
          </div>
        </CardHeader>
        <CardContent>
          <TrendChart trend={data.trend} />
        </CardContent>
      </Card>

      <div className={styles.chartsGrid}>
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Certificates by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <TypeBarChart data={data.certificatesByType} />
          </CardContent>
        </Card>

        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Certificate Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdown data={data.certificatesByStatus} labels={CERT_STATUS_LABEL} total={data.totals.certificates} />
          </CardContent>
        </Card>

        <Card variant="default" padding="lg">
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
