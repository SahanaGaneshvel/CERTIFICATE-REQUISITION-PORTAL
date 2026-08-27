import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Printer } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import styles from './PaymentResult.module.css';

export function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactionId, amount, type } = location.state || {};

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className={styles.container}>
      <Card variant="elevated" padding="lg" className={styles.resultCard}>
        <div className={styles.iconWrapper + ' ' + styles.success}>
          <CheckCircle size={64} />
        </div>

        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.subtitle}>
          Your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>

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
                  <th>Fees Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{transactionId || 'TXN123456789'}</td>
                  <td>{currentDate}</td>
                  <td>
                    <span className={styles.statusSuccess}>Payment Success</span>
                  </td>
                  <td>{type || 'Transcript Fee In Person'}</td>
                  <td>&#8377; {amount?.toFixed(2) || '500.00'}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right' }}>
                    <strong>Total Fees</strong>
                  </td>
                  <td>
                    <strong>&#8377; {amount?.toFixed(2) || '500.00'}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles.successBanner}>
            <CheckCircle size={24} />
            <span>Payment Success</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="outline" leftIcon={<Printer size={18} />}>
            Print Receipt
          </Button>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            Download Receipt
          </Button>
          <Button onClick={() => navigate('/dashboard')} leftIcon={<Home size={18} />}>
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
