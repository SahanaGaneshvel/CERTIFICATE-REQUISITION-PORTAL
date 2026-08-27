import { useEffect, useState } from 'react';
import { Eye, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select, Modal } from '../../components/ui';
import styles from '../PaymentHistory.module.css';
import detailStyles from './AdminDetail.module.css';

interface CertificateRecord {
  id: string;
  certificateType: string;
  purpose: string;
  feeAmount: number;
  status: 'PENDING' | 'GENERATED' | 'DOWNLOADED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  generatedCertificateKey: string | null;
  requestDate: string;
  reviewNote: string | null;
  student: { name: string; registerNo: string; email: string; mobileNumber: string };
}

const statusFilters = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'GENERATED', label: 'Generated' },
  { value: 'DOWNLOADED', label: 'Downloaded' },
  { value: 'REJECTED', label: 'Rejected' },
];

const nextStatusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'GENERATED', label: 'Generated' },
  { value: 'DOWNLOADED', label: 'Downloaded' },
  { value: 'REJECTED', label: 'Rejected' },
];

function statusBadge(status: string) {
  if (status === 'GENERATED' || status === 'DOWNLOADED') return <Badge variant="success">{status}</Badge>;
  if (status === 'REJECTED') return <Badge variant="error">{status}</Badge>;
  return <Badge variant="info">{status}</Badge>;
}

function statusIcon(status: string) {
  if (status === 'GENERATED' || status === 'DOWNLOADED') return <CheckCircle size={16} className={styles.successIcon} />;
  if (status === 'REJECTED') return <XCircle size={16} className={styles.failedIcon} />;
  return <Clock size={16} className={styles.pendingIcon} />;
}

export function AdminCertificates() {
  const [requests, setRequests] = useState<CertificateRecord[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<CertificateRecord | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = () => {
    setIsLoading(true);
    adminApi
      .get<{ requests: CertificateRecord[] }>('/admin/certificate-requests')
      .then((res) => setRequests(res.requests))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter);

  const openDetail = (record: CertificateRecord) => {
    setSelected(record);
    setNewStatus(record.status);
    setReviewNote(record.reviewNote ?? '');
    setCertificateFile(null);
    setActionError('');
  };

  const viewFile = async () => {
    if (!selected) return;
    try {
      const { url } = await adminApi.get<{ url: string }>(
        `/files?entity=certificate&id=${selected.id}&field=generatedCertificateKey`
      );
      window.open(url, '_blank');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  const saveStatus = async () => {
    if (!selected) return;
    setIsSaving(true);
    setActionError('');
    try {
      await adminApi.patch(`/admin/certificate-requests/${selected.id}/status`, {
        status: newStatus,
        reviewNote: reviewNote || undefined,
      });
      setSelected(null);
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadCertificate = async () => {
    if (!selected || !certificateFile) return;
    setIsSaving(true);
    setActionError('');
    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);
      await adminApi.post(`/admin/certificate-requests/${selected.id}/upload-certificate`, formData);
      setSelected(null);
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to upload certificate');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Certificate Requests</h1>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className={styles.tableHeader}>
            <CardTitle>Requests</CardTitle>
            <div className={styles.tableActions}>
              <Select options={statusFilters} value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Certificate</th>
                  <th>Purpose</th>
                  <th>Fee</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8}>Loading...</td>
                  </tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>No requests found</td>
                  </tr>
                )}
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td className={styles.studentId}>
                      {req.student.name} ({req.student.registerNo})
                    </td>
                    <td>{req.certificateType}</td>
                    <td>{req.purpose}</td>
                    <td className={styles.amount}>&#8377; {req.feeAmount.toFixed(2)}</td>
                    <td>
                      <Badge variant={req.paymentStatus === 'SUCCESS' ? 'success' : req.paymentStatus === 'FAILED' ? 'error' : 'warning'}>
                        {req.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        {statusIcon(req.status)}
                        {statusBadge(req.status)}
                      </div>
                    </td>
                    <td>{new Date(req.requestDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Button variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => openDetail(req)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Certificate Request" size="lg">
        {selected && (
          <div className={detailStyles.detail}>
            <div className={detailStyles.infoGrid}>
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Student</span>
                <span className={detailStyles.infoValue}>
                  {selected.student.name} ({selected.student.registerNo})
                </span>
              </div>
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Contact</span>
                <span className={detailStyles.infoValue}>
                  {selected.student.email || 'n/a'} · {selected.student.mobileNumber || 'n/a'}
                </span>
              </div>
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Certificate Type</span>
                <span className={detailStyles.infoValue}>{selected.certificateType}</span>
              </div>
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Purpose</span>
                <span className={detailStyles.infoValue}>{selected.purpose}</span>
              </div>
              <div className={detailStyles.infoItem}>
                <span className={detailStyles.infoLabel}>Fee / Payment</span>
                <span className={detailStyles.infoValue}>
                  &#8377; {selected.feeAmount.toFixed(2)} — {selected.paymentStatus}
                </span>
              </div>
            </div>

            {selected.generatedCertificateKey && (
              <div className={detailStyles.filesSection}>
                <h4>Uploaded Certificate</h4>
                <div className={detailStyles.fileButtons}>
                  <Button variant="secondary" size="sm" onClick={viewFile}>
                    View Certificate
                  </Button>
                </div>
              </div>
            )}

            {actionError && <div className={detailStyles.errorAlert}>{actionError}</div>}

            <div className={detailStyles.actionSection}>
              <h4>Update Status</h4>
              <div className={detailStyles.actionRow}>
                <Select options={nextStatusOptions} value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
                <Button onClick={saveStatus} isLoading={isSaving}>
                  Save Status
                </Button>
              </div>
              <textarea
                className={detailStyles.noteInput}
                placeholder="Optional review note"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className={detailStyles.actionSection}>
              <h4>Upload Generated Certificate</h4>
              <div className={detailStyles.actionRow}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="secondary"
                  leftIcon={<Upload size={16} />}
                  onClick={uploadCertificate}
                  isLoading={isSaving}
                  disabled={!certificateFile}
                >
                  Upload &amp; Mark Generated
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
