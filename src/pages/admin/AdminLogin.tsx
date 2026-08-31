import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Button, Input } from '../../components/ui';
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

    if (!registerNo.trim() || !password.trim()) {
      setError('Please enter your admin ID and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(registerNo.trim(), password);
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
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.card}>
        {/* LEFT — LOGIN FORM */}
        <div className={styles.formPanel}>
          <div className={styles.formWrap}>
            <div className={styles.formHeader}>
              <h1>Admin Office Login</h1>
              <p>Staff access to the requisition portal</p>
            </div>

            <form onSubmit={handleSubmit} className={`${styles.form} ${styles.formCard}`}>
              {error && <div className={styles.errorAlert}>{error}</div>}

              <Input
                label="Admin ID"
                placeholder="Enter your admin ID"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value.toUpperCase())}
                leftIcon={<User size={18} />}
                required
                autoFocus
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                className={styles.signInButton}
              >
                Log In
              </Button>
            </form>

            <div className={styles.formFooter}>
              <p>Restricted to authorized admin office staff only.</p>
            </div>
          </div>
        </div>

        {/* RIGHT — BRAND PANEL */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <img
              src="/hindustan-logo-full.png"
              alt="Hindustan Institute of Technology & Science"
              className={styles.brandLogo}
            />

            <div className={styles.portalBadge}>
              <ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Admin Office Portal
            </div>

            <p className={styles.brandSubtext}>
              Review requests, issue certificates,
              <br />
              and track distribution analytics.
            </p>
          </div>

          <p className={styles.brandFooter}>
            &copy; {new Date().getFullYear()} Hindustan Institute of Technology &amp; Science
          </p>
        </div>
      </div>
    </div>
  );
}
