import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import styles from './PaymentHistory.module.css';

interface PaymentRecord {
  id: string;
  srmTransId: string;
  pgTransId: string | null;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

interface Transaction {
  id: string;
  sNo: number;
  studentId: string;
  srmTransId: string;
  bankTransId: string;
  totalAmount: number;
  paymentStatus: 'success' | 'failed' | 'pending';
}

const filterOptions = [
  { value: 'all', label: 'All Transactions' },
  { value: 'success', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

export function PaymentHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ payments: PaymentRecord[] }>('/payments/history')
      .then((res) => {
        setTransactions(
          res.payments.map((p, index) => ({
            id: p.id,
            sNo: index + 1,
            studentId: user?.registerNo ?? '',
            srmTransId: p.srmTransId,
            bankTransId: p.pgTransId ?? '-',
            totalAmount: p.amount,
            paymentStatus: p.status.toLowerCase() as 'success' | 'failed' | 'pending',
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, [user?.registerNo]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.paymentStatus === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failed':
        return <Badge variant="error">Failed - Marked bounced as transaction</Badge>;
      case 'pending':
<<<<<<< HEAD
        return <Badge variant="orange">Initiated and Not Completed</Badge>;
=======
        return <Badge variant="warning">Initiated and Not Completed</Badge>;
>>>>>>> origin/feature/backend-docker-stack
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className={styles.successIcon} />;
      case 'failed':
        return <XCircle size={16} className={styles.failedIcon} />;
      case 'pending':
        return <Clock size={16} className={styles.pendingIcon} />;
      default:
        return null;
    }
  };

  const totalSuccess = transactions.filter((t) => t.paymentStatus === 'success').length;
  const totalFailed = transactions.filter((t) => t.paymentStatus === 'failed').length;
  const totalPending = transactions.filter((t) => t.paymentStatus === 'pending').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
<<<<<<< HEAD
        <p className={styles.eyebrow}>Payments</p>
=======
>>>>>>> origin/feature/backend-docker-stack
        <h1 className={styles.title}>Payment Transaction Log</h1>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
<<<<<<< HEAD
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.successBg}>
            <CheckCircle size={20} />
=======
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.successBg}>
            <CheckCircle size={24} />
>>>>>>> origin/feature/backend-docker-stack
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalSuccess}</span>
            <span className={styles.statLabel}>Successful</span>
          </div>
        </Card>
<<<<<<< HEAD
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.failedBg}>
            <XCircle size={20} />
=======
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.failedBg}>
            <XCircle size={24} />
>>>>>>> origin/feature/backend-docker-stack
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalFailed}</span>
            <span className={styles.statLabel}>Failed</span>
          </div>
        </Card>
<<<<<<< HEAD
        <Card variant="default" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.pendingBg}>
            <Clock size={20} />
=======
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.pendingBg}>
            <Clock size={24} />
>>>>>>> origin/feature/backend-docker-stack
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalPending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
<<<<<<< HEAD
      <Card variant="default" padding="lg">
=======
      <Card variant="elevated" padding="lg">
>>>>>>> origin/feature/backend-docker-stack
        <CardHeader>
          <div className={styles.tableHeader}>
            <CardTitle>Transaction History</CardTitle>
            <div className={styles.tableActions}>
              <Select
                options={filterOptions}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Student Id</th>
                  <th>SRM Transaction Id</th>
                  <th>Bank Transaction Id</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
<<<<<<< HEAD
                    <td colSpan={6} className={styles.emptyRow}>Loading...</td>
=======
                    <td colSpan={5}>Loading...</td>
>>>>>>> origin/feature/backend-docker-stack
                  </tr>
                )}
                {!isLoading && filteredTransactions.length === 0 && (
                  <tr>
<<<<<<< HEAD
                    <td colSpan={6} className={styles.emptyRow}>No transactions yet</td>
=======
                    <td colSpan={5}>No transactions yet</td>
>>>>>>> origin/feature/backend-docker-stack
                  </tr>
                )}
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.sNo}</td>
                    <td className={styles.studentId}>{transaction.studentId}</td>
                    <td className={styles.transId}>{transaction.srmTransId}</td>
                    <td className={styles.transId}>{transaction.bankTransId}</td>
                    <td className={styles.amount}>&#8377; {transaction.totalAmount}</td>
                    <td>
                      <div className={styles.statusCell}>
                        {getStatusIcon(transaction.paymentStatus)}
                        {getStatusBadge(transaction.paymentStatus)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/feature/backend-docker-stack
