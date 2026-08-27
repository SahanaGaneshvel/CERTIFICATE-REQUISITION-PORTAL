import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import styles from './Login.module.css';

export function Login() {
  const [registerNo, setRegisterNo] = useState('');
  const [dob, setDob] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCaptcha] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerNo || !dob || !captcha) {
      setError('Please fill in all fields');
      return;
    }

    if (captcha.toUpperCase() !== generatedCaptcha) {
      setError('Invalid captcha. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(registerNo, dob);
      if (success) {
        navigate('/registration');
      } else {
        setError('Invalid credentials. Please try again.');
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
              src="/hindustan-logo.svg"
              alt="Hindustan Institute of Technology & Science"
              className={styles.logo}
            />
          </div>
          <h1 className={styles.brandTitle}>HINDUSTAN</h1>
          <p className={styles.brandSubtitle}>Institute of Technology & Science</p>
          <span className={styles.brandUniversity}>(Deemed to be University)</span>

          <div className={styles.portalBadge}>
            <span>CERTIFICATE REQUISITION PORTAL</span>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Shield size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Secure Access</h3>
                <p>Your data is protected with enterprise-grade security</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Quick Processing</h3>
                <p>Get your certificates processed efficiently</p>
              </div>
            </div>
          </div>
        </div>

        <Card className={styles.loginCard} variant="elevated" padding="lg">
          <div className={styles.cardHeader}>
            <div className={styles.avatarIcon}>
              <User size={32} />
            </div>
            <h2>Student Login</h2>
            <p>Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}

            <Input
              label="Register Number"
              placeholder="Enter your register number"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              leftIcon={<User size={20} />}
              required
            />

            <Input
              label="Date of Birth"
              type={showPassword ? 'text' : 'password'}
              placeholder="DDMMYYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              leftIcon={<Calendar size={20} />}
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

            <div className={styles.captchaSection}>
              <Input
                label="Word Verification"
                placeholder="Enter the code shown below"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                required
              />
              <div className={styles.captchaBox}>
                <span className={styles.captchaText}>{generatedCaptcha}</span>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              LOGIN
            </Button>
          </form>

          <div className={styles.cardFooter}>
            <p>
              Need help? Contact <a href="mailto:support@hindustanuniv.ac.in">support@hindustanuniv.ac.in</a>
            </p>
          </div>
        </Card>
      </div>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Hindustan Institute of Technology & Science. All rights reserved.</p>
      </footer>
    </div>
  );
}
