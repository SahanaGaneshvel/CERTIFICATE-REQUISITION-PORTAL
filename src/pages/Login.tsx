import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import styles from './Login.module.css';

export function Login() {
  const [registerNo, setRegisterNo] = useState('');
  const [dob, setDob] = useState('');
  const [captcha, setCaptcha] = useState('');
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

    if (!registerNo.trim() || !dob.trim() || !captcha.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (captcha.toUpperCase() !== generatedCaptcha) {
      setError('Invalid captcha. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(
        registerNo.trim(),
        dob.trim()
      );

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
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.card}>
        {/* LEFT — LOGIN FORM */}
        <div className={styles.formPanel}>
          <div className={styles.formWrap}>
            <div className={styles.formHeader}>
              <h1>Welcome Back!</h1>
              <p>Sign in with your student credentials to continue</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`${styles.form} ${styles.formCard}`}
            >
              {error && (
                <div className={styles.errorAlert}>
                  {error}
                </div>
              )}

              {/* REGISTER NUMBER */}
              <Input
                label="Register Number"
                placeholder="Enter your register number"
                value={registerNo}
                onChange={(e) =>
                  setRegisterNo(e.target.value.toUpperCase())
                }
                leftIcon={<User size={18} />}
                required
              />

              {/* DATE OF BIRTH */}
              <Input
                label="Date of Birth"
                type="text"
                placeholder="DD-MM-YYYY"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                leftIcon={<Calendar size={18} />}
                required
              />

              {/* CAPTCHA */}
              <div className={styles.captchaSection}>
                <Input
                  label="Word Verification"
                  placeholder="Enter the code shown below"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  required
                />

                <div className={styles.captchaBoxWrap}>
                  <span className={styles.captchaLabel}>
                    Code
                  </span>

                  <div className={styles.captchaBox}>
                    <span className={styles.captchaText}>
                      {generatedCaptcha}
                    </span>
                  </div>
                </div>
              </div>

              {/* SIGN IN */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                className={styles.signInButton}
              >
                Sign In
              </Button>
            </form>

            <div className={styles.formFooter}>
              <p>
                Need help? Contact{' '}
                <a href="mailto:support@hindustanuniv.ac.in">
                  support@hindustanuniv.ac.in
                </a>
              </p>
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
              Certificate Requisition Portal
            </div>

            <p className={styles.brandSubtext}>
              A unified platform to request, track,
              <br />
              and manage academic certificates.
            </p>
          </div>

          <p className={styles.brandFooter}>
            &copy; {new Date().getFullYear()} Hindustan Institute of
            Technology &amp; Science
          </p>
        </div>
      </div>
    </div>
  );
}