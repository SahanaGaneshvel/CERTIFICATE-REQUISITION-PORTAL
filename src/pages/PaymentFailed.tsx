import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import styles from './PaymentResult.module.css';

export function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { amount, type, error, srmTransId } = (location.state as { amount?: number; type?: string; error?: string; srmTransId?: string }) || {};

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className={styles.container}>
      <Card variant="elevated" padding="lg" className={styles.resultCard}>
        <div className={styles.iconWrapper + ' ' + styles.failed}>
          <XCircle size={64} />
        </div>

        <h1 className={styles.title}>Payment Failed</h1>
        <p className={styles.subtitle}>
          Unfortunately, your payment could not be processed. Please try again or contact support.
        </p>

        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.detailsCard}>
          <h3 className={styles.detailsTitle}>Payment Transaction Status</h3>

          <div className={styles.detailsSection}>
            <h4>STUDENT DETAILS:</h4>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Student Id</span>
                <span className={styles.detailValue}>{user?.registerNo}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Student Name</span>
                <span className={styles.detailValue}>{user?.name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Name of the Institution</span>
                <span className={styles.detailValue}>{user?.institution}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Course</span>
                <span className={styles.detailValue}>{user?.degree} - {user?.branch}</span>
              </div>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <h4>PAYMENT DETAILS:</h4>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Payment Status</th>
                  <th>Fee Type</th>
                  <th>Fees</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{srmTransId || '-'}</td>
                  <td>{currentDate}</td>
                  <td>
                    <span className={styles.statusFailed}>Payment Failed</span>
                  </td>
                  <td>{type || 'Transcript Fee In Person'}</td>
                  <td>&#8377; {amount?.toFixed(2) || '500.00'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.failedBanner}>
            <XCircle size={24} />
            <span>Payment Failed</span>
          </div>
        </div>

        <div className={styles.troubleshootingSection}>
          <h4>Common reasons for payment failure:</h4>
          <ul>
            <li>Insufficient balance in your account</li>
            <li>Incorrect card details entered</li>
            <li>Transaction declined by your bank</li>
            <li>Network connectivity issues</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={() => navigate('/transcript')}
            leftIcon={<RefreshCw size={18} />}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            leftIcon={<Home size={18} />}
          >
            Go to Dashboard
          </Button>
          <Button variant="ghost" leftIcon={<HelpCircle size={18} />}>
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
}
