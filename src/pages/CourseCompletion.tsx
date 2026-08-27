import React, { useState } from 'react';
import { FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

interface Certificate {
  id: string;
  name: string;
  status: 'generated' | 'not-generated';
  downloadUrl?: string;
}

const certificates: Certificate[] = [
  { id: '1', name: 'Course Completion Certificate', status: 'not-generated' },
  { id: '2', name: 'Provisional Certificate', status: 'not-generated' },
  { id: '3', name: 'Bonafide Certificate', status: 'generated', downloadUrl: '#' },
];

export function CourseCompletion() {
  const { user } = useAuth();
  const [certificateType, setCertificateType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateType || !purpose) {
      alert('Please select both certificate type and purpose');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert('Certificate request submitted successfully!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Course Completion</h1>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>
          <FileText size={18} />
          Bonafide
        </button>
        <button className={styles.tab}>
          <FileText size={18} />
          Train Concession
        </button>
        <button className={styles.tab}>
          <FileText size={18} />
          Course Completion
        </button>
        <button className={styles.tab}>
          <FileText size={18} />
          SRM Future Professor Scheme
        </button>
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
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td>{cert.name}</td>
                    <td>
                      {cert.status === 'generated' ? (
                        <div className={styles.certificateActions}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={16} />}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download size={16} />}
                          >
                            Download
                          </Button>
                        </div>
                      ) : (
                        <span className={styles.notGenerated}>
                          <AlertCircle size={16} />
                          Course Completion certificate Not Generated.
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
