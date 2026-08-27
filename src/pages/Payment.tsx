import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Smartphone, Shield, Lock } from 'lucide-react';
import { Card, Button, Input, RadioGroup } from '../components/ui';
import { api } from '../lib/api';
import styles from './Payment.module.css';

const paymentMethods = [
  { value: 'card', label: 'Credit/Debit Card', description: 'Visa, Mastercard, RuPay' },
  { value: 'netbanking', label: 'Net Banking', description: 'All major banks supported' },
  { value: 'upi', label: 'UPI', description: 'Google Pay, PhonePe, Paytm' },
];

interface LocationState {
  entity?: 'transcript' | 'certificate';
  entityId?: string;
  amount?: number;
  type?: string;
  description?: string;
}

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { entity, entityId, amount = 500, type = 'Transcript Fee', description = '1 set of Transcript' } =
    (location.state as LocationState) || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!entity || !entityId) {
      navigate('/dashboard', { replace: true });
    }
  }, [entity, entityId, navigate]);

  const convenienceFee = Math.round(amount * 0.02);
  const totalAmount = amount + convenienceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity || !entityId) return;
    setError('');
    setIsProcessing(true);

    try {
      const { payment } = await api.post<{ payment: { srmTransId: string } }>('/payments/initiate', {
        entity,
        entityId,
      });

      // In production the browser would redirect to the real payment gateway here,
      // which calls POST /api/payments/callback server-to-server on completion.
      // No gateway is integrated yet, so /payments/mock-complete (disabled by the
      // backend once NODE_ENV=production) stands in for that redirect for now.
      await api.post('/payments/mock-complete', { srmTransId: payment.srmTransId, succeed: true }).catch(() => {
        // In a real deployment this route won't exist once a gateway is wired up; ignore.
      });

      navigate('/payment-success', {
        state: { srmTransId: payment.srmTransId, amount: totalAmount, type },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentWrapper}>
        {/* Order Summary */}
        <Card variant="elevated" padding="lg" className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <img src="/hindustan-logo.png" alt="HITS" className={styles.logo} />
            <div>
              <h2 className={styles.institutionName}>Hindustan Institute of Technology & Science</h2>
              <p className={styles.portalName}>Certificate Requisition Portal</p>
            </div>
          </div>

          <div className={styles.summaryContent}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>

            <div className={styles.summaryItem}>
              <span>Fee Type</span>
              <span className={styles.summaryValue}>{type}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Description</span>
              <span className={styles.summaryValue}>{description}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Base Amount</span>
              <span className={styles.summaryValue}>&#8377; {amount.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Convenience Fee (2%)</span>
              <span className={styles.summaryValue}>&#8377; {convenienceFee.toFixed(2)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span className={styles.totalAmount}>&#8377; {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.securityBadges}>
            <div className={styles.securityBadge}>
              <Shield size={16} />
              <span>Secure Payment</span>
            </div>
            <div className={styles.securityBadge}>
              <Lock size={16} />
              <span>256-bit SSL</span>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card variant="elevated" padding="lg" className={styles.paymentCard}>
          <h2 className={styles.paymentTitle}>Payment Details</h2>

          {error && <p className={styles.disclaimer} style={{ color: '#dc2626' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <RadioGroup
              name="paymentMethod"
              label="Select Payment Method"
              options={paymentMethods}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

            <div className={styles.paymentForm}>
              {paymentMethod === 'card' && (
                <div className={styles.cardForm}>
                  <div className={styles.cardIcons}>
                    <img src="/visa.svg" alt="Visa" />
                    <img src="/mastercard.svg" alt="Mastercard" />
                    <img src="/rupay.svg" alt="RuPay" />
                  </div>

                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                    leftIcon={<CreditCard size={20} />}
                    required
                  />

                  <Input
                    label="Cardholder Name"
                    placeholder="Name as on card"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                    required
                  />

                  <div className={styles.cardRow}>
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, expiry: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="CVV"
                      type="password"
                      placeholder="***"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cvv: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className={styles.netbankingForm}>
                  <Input
                    label="Select Your Bank"
                    placeholder="Choose your bank"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    leftIcon={<Building2 size={20} />}
                    required
                  />
                  <p className={styles.formNote}>
                    You will be redirected to your bank's website to complete the payment.
                  </p>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className={styles.upiForm}>
                  <Input
                    label="UPI ID"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    leftIcon={<Smartphone size={20} />}
                    required
                  />
                  <div className={styles.upiApps}>
                    <span>Or pay using:</span>
                    <div className={styles.upiAppIcons}>
                      <button type="button" className={styles.upiApp}>
                        <img src="/gpay.svg" alt="Google Pay" />
                      </button>
                      <button type="button" className={styles.upiApp}>
                        <img src="/phonepe.svg" alt="PhonePe" />
                      </button>
                      <button type="button" className={styles.upiApp}>
                        <img src="/paytm.svg" alt="Paytm" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isProcessing}
              className={styles.payButton}
            >
              Pay &#8377; {totalAmount.toFixed(2)}
            </Button>

            <p className={styles.disclaimer}>
              By proceeding, you agree to our Terms of Service and Privacy Policy.
              Payment is processed securely by PayU.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
