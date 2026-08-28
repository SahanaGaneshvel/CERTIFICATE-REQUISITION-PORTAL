import React, { useEffect, useState } from 'react';
import { Download, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Badge } from '../components/ui';
import styles from './CourseCompletion.module.css';

const certificateTypes = [
  { value: '', label: 'Select Certificate' },
  { value: 'bonafide', label: 'Bonafide Certificate' },
  { value: 'course-completion', label: 'Course Completion Certificate' },
  { value: 'character', label: 'Character Certificate' },
  { value: 'medium-instruction', label: 'Medium of Instruction Certificate' },
];

const purposes = [
  { value: '', label: 'Select Purpose' },
  { value: 'higher-studies', label: 'Higher Studies' },
  { value: 'employment', label: 'Employment' },
  { value: 'visa', label: 'Visa Application' },
  { value: 'bank-loan', label: 'Bank Loan' },
  { value: 'other', label: 'Other' },
];

interface CertificateRequestRecord {
  id: string;
  certificateType: string;
  status: 'PENDING' | 'GENERATED' | 'DOWNLOADED' | 'REJECTED';
}

export function CourseCompletion() {
  const { user } = useAuth();
  const [certificateType, setCertificateType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [requests, setRequests] = useState<CertificateRequestRecord[]>([]);

  const loadRequests = () => {
    api
      .get<{ requests: CertificateRequestRecord[] }>('/certificates')
      .then((res) => setRequests(res.requests))
      .catch(() => {});
  };

  useEffect(loadRequests, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!certificateType || !purpose) {
      alert('Please select both certificate type and purpose');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/certificates', { certificateType, purpose });
      setCertificateType('');
      setPurpose('');
      loadRequests();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const { url } = await api.get<{ url: string }>(
        `/files?entity=certificate&id=${id}&field=generatedCertificateKey`
      );
      window.open(url, '_blank');
      await api.post(`/certificates/${id}/mark-downloaded`).catch(() => {});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to fetch certificate');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Certificate Request</h1>
        <p className={styles.subtitle}>Request various certificates for your academic and professional needs</p>
      </div>

      {/* Certificate Request Form */}
      <Card variant="elevated" padding="lg" className={styles.section}>
        <CardHeader>
          <div className={styles.cardHeaderWithBadge}>
            <CardTitle>Certificate Request</CardTitle>
            <Badge variant="green">New Request</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {submitError && <p className={styles.notGenerated}>{submitError}</p>}
            <div className={styles.formGrid}>
              <Select
                label="Certificate"
                options={certificateTypes}
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                placeholder="Select Certificate"
                required
              />
              <Select
                label="Purpose"
                options={purposes}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Select Purpose"
                required
              />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" isLoading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Certificate Download Section */}
      <Card variant="elevated" padding="lg" className={styles.section}>
        <CardHeader>
          <div className={styles.cardHeaderWithBadge}>
            <CardTitle>Course Completion Certificate Download</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>View Certificate</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={2}>No certificate requests yet</td>
                  </tr>
                )}
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.certificateType}</td>
                    <td>
                      {req.status === 'GENERATED' || req.status === 'DOWNLOADED' ? (
                        <div className={styles.certificateActions}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={16} />}
                            onClick={() => handleDownload(req.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download size={16} />}
                            onClick={() => handleDownload(req.id)}
                          >
                            Download
                          </Button>
                        </div>
                      ) : (
                        <span className={styles.notGenerated}>
                          <AlertCircle size={16} />
                          {req.status === 'REJECTED' ? 'Request rejected.' : 'Not generated yet.'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Info */}
      <Card variant="gradient" padding="lg" className={styles.section}>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{user?.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Register No.</span>
              <span className={styles.infoValue}>{user?.registerNo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Course</span>
              <span className={styles.infoValue}>{user?.degree} - {user?.branch}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <span className={styles.infoValue}>{user?.gender}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Admitted Year</span>
              <span className={styles.infoValue}>{user?.admittedYear}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Institution</span>
              <span className={styles.infoValue}>{user?.institution}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
