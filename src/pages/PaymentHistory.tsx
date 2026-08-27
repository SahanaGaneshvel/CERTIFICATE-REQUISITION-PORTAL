import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select } from '../components/ui';
import styles from './PaymentHistory.module.css';

interface Transaction {
  id: string;
  sNo: number;
  verify: boolean;
  studentId: string;
  srmTransId: string;
  bankTransId: string;
  totalAmount: number;
  paymentStatus: 'success' | 'failed' | 'pending';
}

const transactions: Transaction[] = [
  {
    id: '1',
    sNo: 1,
    verify: false,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202408250001',
    bankTransId: 'PAY123456789',
    totalAmount: 600,
    paymentStatus: 'success',
  },
  {
    id: '2',
    sNo: 2,
    verify: false,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202408200002',
    bankTransId: 'PAY987654321',
    totalAmount: 200,
    paymentStatus: 'success',
  },
  {
    id: '3',
    sNo: 3,
    verify: false,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202408150003',
    bankTransId: 'PAY456789123',
    totalAmount: 300,
    paymentStatus: 'success',
  },
  {
    id: '4',
    sNo: 4,
    verify: false,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202408100004',
    bankTransId: 'PAY789123456',
    totalAmount: 400,
    paymentStatus: 'success',
  },
  {
    id: '5',
    sNo: 5,
    verify: false,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202408050005',
    bankTransId: '-',
    totalAmount: 200,
    paymentStatus: 'failed',
  },
  {
    id: '6',
    sNo: 6,
    verify: true,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202407250006',
    bankTransId: '-',
    totalAmount: 250,
    paymentStatus: 'pending',
  },
  {
    id: '7',
    sNo: 7,
    verify: true,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202407200007',
    bankTransId: '-',
    totalAmount: 550,
    paymentStatus: 'pending',
  },
  {
    id: '8',
    sNo: 8,
    verify: true,
    studentId: 'RA2311003010079',
    srmTransId: 'SRM202407150008',
    bankTransId: '-',
    totalAmount: 250,
    paymentStatus: 'pending',
  },
];

const filterOptions = [
  { value: 'all', label: 'All Transactions' },
  { value: 'success', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

export function PaymentHistory() {
  const [filter, setFilter] = useState('all');

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
        return <Badge variant="warning">Initiated and Not Completed</Badge>;
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
        <h1 className={styles.title}>Payment Transaction Log</h1>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.successBg}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalSuccess}</span>
            <span className={styles.statLabel}>Successful</span>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.failedBg}>
            <XCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalFailed}</span>
            <span className={styles.statLabel}>Failed</span>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.pendingBg}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalPending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card variant="elevated" padding="lg">
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
                  <th>Verify</th>
                  <th>Student Id</th>
                  <th>SRM Transaction Id</th>
                  <th>Bank Transaction Id</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.sNo}</td>
                    <td>
                      {transaction.verify ? (
                        <Button variant="secondary" size="sm">
                          Verify
                        </Button>
                      ) : (
                        '-'
                      )}
                    </td>
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
}
