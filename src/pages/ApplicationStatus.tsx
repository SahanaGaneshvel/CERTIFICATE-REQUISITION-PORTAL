import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Select } from '../components/ui';
import { api } from '../lib/api';
import styles from './ApplicationStatus.module.css';

interface TranscriptApplication {
  id: string;
  referenceNumber: string;
  appliedDate: string;
  status: 'PENDING' | 'APPLIED' | 'PROCESSING' | 'READY' | 'COLLECTED' | 'REJECTED';
  numberOfSets: number;
  feeAmount: number;
  collectionMode: string;
}

interface CertificateRequest {
  id: string;
  certificateType: string;
  purpose: string;
  requestDate: string;
  status: 'PENDING' | 'GENERATED' | 'DOWNLOADED' | 'REJECTED';
  feeAmount: number;
}

type ApplicationType = 'all' | 'transcript' | 'certificate';
type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

const typeOptions = [
  { value: 'all', label: 'All Applications' },
  { value: 'transcript', label: 'Transcripts Only' },
  { value: 'certificate', label: 'Certificates Only' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

function getTranscriptStatusCategory(status: TranscriptApplication['status']): StatusFilter {
  if (status === 'REJECTED') return 'rejected';
  if (status === 'READY' || status === 'COLLECTED') return 'completed';
  if (status === 'PROCESSING' || status === 'APPLIED') return 'processing';
  return 'pending';
}

function getCertificateStatusCategory(status: CertificateRequest['status']): StatusFilter {
  if (status === 'REJECTED') return 'rejected';
  if (status === 'GENERATED' || status === 'DOWNLOADED') return 'completed';
  return 'pending';
}

export function ApplicationStatus() {
  const [transcripts, setTranscripts] = useState<TranscriptApplication[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [typeFilter, setTypeFilter] = useState<ApplicationType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ applications: TranscriptApplication[] }>('/transcripts'),
      api.get<{ requests: CertificateRequest[] }>('/certificates'),
    ])
      .then(([transcriptRes, certificateRes]) => {
        setTranscripts(transcriptRes.applications);
        setCertificates(certificateRes.requests);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'orange' | 'error'; label: string }> = {
      PENDING: { variant: 'orange', label: 'Pending' },
      APPLIED: { variant: 'orange', label: 'Applied' },
      PROCESSING: { variant: 'orange', label: 'Processing' },
      READY: { variant: 'success', label: 'Ready' },
      COLLECTED: { variant: 'success', label: 'Collected' },
      GENERATED: { variant: 'success', label: 'Generated' },
      DOWNLOADED: { variant: 'success', label: 'Downloaded' },
      REJECTED: { variant: 'error', label: 'Rejected' },
    };
    const c = map[status] || { variant: 'orange' as const, label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'REJECTED') return <XCircle size={16} className={styles.iconError} />;
    if (['READY', 'COLLECTED', 'GENERATED', 'DOWNLOADED'].includes(status))
      return <CheckCircle size={16} className={styles.iconSuccess} />;
    if (['PROCESSING', 'APPLIED'].includes(status))
      return <Clock size={16} className={styles.iconWarning} />;
    return <AlertCircle size={16} className={styles.iconInfo} />;
  };

  const downloadTranscript = async (id: string) => {
    try {
      const { url } = await api.get<{ url: string }>(`/files?entity=transcript&id=${id}&field=generatedTranscriptKey`);
      window.open(url, '_blank');
    } catch {
      alert('Transcript not available yet');
    }
  };

  const downloadCertificate = async (id: string) => {
    try {
      const { url } = await api.get<{ url: string }>(`/files?entity=certificate&id=${id}&field=generatedCertificateKey`);
      window.open(url, '_blank');
      await api.post(`/certificates/${id}/mark-downloaded`).catch(() => {});
    } catch {
      alert('Certificate not available yet');
    }
  };

  const filteredT = transcripts.filter((t) => {
    if (typeFilter === 'certificate') return false;
    if (statusFilter === 'all') return true;
    return getTranscriptStatusCategory(t.status) === statusFilter;
  });

  const filteredC = certificates.filter((c) => {
    if (typeFilter === 'transcript') return false;
    if (statusFilter === 'all') return true;
    return getCertificateStatusCategory(c.status) === statusFilter;
  });

  const total = transcripts.length + certificates.length;
  const pending = transcripts.filter((t) => getTranscriptStatusCategory(t.status) === 'pending').length +
                  certificates.filter((c) => getCertificateStatusCategory(c.status) === 'pending').length;
  const processing = transcripts.filter((t) => getTranscriptStatusCategory(t.status) === 'processing').length;
  const completed = transcripts.filter((t) => getTranscriptStatusCategory(t.status) === 'completed').length +
                    certificates.filter((c) => getCertificateStatusCategory(c.status) === 'completed').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Applications</p>
        <h1 className={styles.title}>Application Status</h1>
        <p className={styles.subtitle}>Track all your transcript and certificate requests</p>
      </div>

      <div className={styles.statsGrid}>
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.totalBg}`}><FileText size={20} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </Card>
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pendingBg}`}><AlertCircle size={20} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </Card>
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.processingBg}`}><Clock size={20} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{processing}</span>
            <span className={styles.statLabel}>Processing</span>
          </div>
        </Card>
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.completedBg}`}><CheckCircle size={20} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </Card>
      </div>

      <div className={styles.quickActions}>
        <Link to="/transcript" className={styles.quickAction}>
          <FileText size={18} /><span>New Transcript Request</span><ArrowRight size={14} />
        </Link>
        <Link to="/certificates" className={styles.quickAction}>
          <Award size={18} /><span>New Certificate Request</span><ArrowRight size={14} />
        </Link>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader>
          <div className={styles.tableHeader}>
            <CardTitle>All Applications</CardTitle>
            <div className={styles.filters}>
              <Select options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ApplicationType)} />
              <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {filteredT.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}><FileText size={18} /> Transcript Applications</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Reference No.</th>
                          <th>Applied Date</th>
                          <th>Sets</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredT.map((app) => (
                          <tr key={app.id}>
                            <td className={styles.refNo}>{app.referenceNumber}</td>
                            <td>{new Date(app.appliedDate).toLocaleDateString('en-IN')}</td>
                            <td>{app.numberOfSets} set(s)</td>
                            <td className={styles.amount}>Rs. {app.feeAmount}</td>
                            <td>
                              <div className={styles.statusCell}>
                                {getStatusIcon(app.status)}
                                {getStatusBadge(app.status)}
                              </div>
                            </td>
                            <td>
                              {(app.status === 'READY' || app.status === 'COLLECTED') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Download size={14} />}
                                  onClick={() => downloadTranscript(app.id)}
                                >
                                  Download
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredC.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}><Award size={18} /> Certificate Requests</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Certificate Type</th>
                          <th>Purpose</th>
                          <th>Request Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredC.map((req) => (
                          <tr key={req.id}>
                            <td className={styles.certType}>{req.certificateType}</td>
                            <td>{req.purpose}</td>
                            <td>{new Date(req.requestDate).toLocaleDateString('en-IN')}</td>
                            <td>
                              <div className={styles.statusCell}>
                                {getStatusIcon(req.status)}
                                {getStatusBadge(req.status)}
                              </div>
                            </td>
                            <td>
                              {(req.status === 'GENERATED' || req.status === 'DOWNLOADED') && (
                                <div className={styles.actions}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<Eye size={14} />}
                                    onClick={() => downloadCertificate(req.id)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={<Download size={14} />}
                                    onClick={() => downloadCertificate(req.id)}
                                  >
                                    Download
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredT.length === 0 && filteredC.length === 0 && (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>No Applications Found</h3>
                  <p>You have not submitted any applications yet.</p>
                  <div className={styles.emptyActions}>
                    <Link to="/transcript">
                      <Button variant="primary" leftIcon={<FileText size={16} />}>
                        Apply for Transcript
                      </Button>
                    </Link>
                    <Link to="/certificates">
                      <Button variant="outline" leftIcon={<Award size={16} />}>
                        Request Certificate
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}