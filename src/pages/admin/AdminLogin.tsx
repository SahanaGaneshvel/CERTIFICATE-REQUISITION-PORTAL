import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff, ClipboardCheck, Award } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Button, Input, Card } from '../../components/ui';
import styles from '../Login.module.css';

export function AdminLogin() {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerNo || !password) {
      setError('Please enter your admin ID and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(registerNo, password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin ID or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern} />

      <div className={styles.content}>
        <div className={styles.brandSection}>
          <div className={styles.logoContainer}>
            <img
              src="/hindustan-logo.png"
              alt="Hindustan Institute of Technology & Science"
              className={styles.logo}
            />
          </div>
          <h1 className={styles.brandTitle}>HINDUSTAN</h1>
          <p className={styles.brandSubtitle}>Institute of Technology & Science</p>
          <span className={styles.brandUniversity}>(Deemed to be University)</span>

          <div className={styles.portalBadge}>
            <span>ADMIN OFFICE PORTAL</span>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ClipboardCheck size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Review Requests</h3>
                <p>Approve, reject, and track transcript and certificate requests</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Award size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Issue Certificates</h3>
                <p>Upload generated certificates directly to student accounts</p>
              </div>
            </div>
          </div>
        </div>

        <Card className={styles.loginCard} variant="elevated" padding="lg">
          <div className={styles.cardHeader}>
            <div className={styles.avatarIcon}>
              <ShieldCheck size={32} />
            </div>
            <h2>Admin Office Login</h2>
            <p>Staff access to the requisition portal</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <Input
              label="Admin ID"
              placeholder="Enter your admin ID"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              leftIcon={<User size={20} />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              LOGIN
            </Button>
          </form>

          <div className={styles.cardFooter}>
            <p>Restricted to authorized admin office staff only.</p>
          </div>
        </Card>
      </div>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Hindustan Institute of Technology & Science. All rights reserved.</p>
      </footer>
    </div>
  );
}
