import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, Modal } from '../components/ui';
import styles from './Registration.module.css';

export function Registration() {
  const { user, completeRegistration } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mobile: '',
    altMobile: '',
    email: '',
    altEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.altMobile && !/^\d{10}$/.test(formData.altMobile)) {
      newErrors.altMobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.altEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.altEmail)) {
      newErrors.altEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setShowConfirmModal(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    completeRegistration(formData);
    setIsLoading(false);
    navigate('/dashboard');
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern} />

      <div className={styles.content}>
        <div className={styles.header}>
          <img
            src="/hindustan-logo.svg"
            alt="Hindustan Institute of Technology & Science"
            className={styles.logo}
          />
          <h1 className={styles.title}>CERTIFICATE REQUISITION PORTAL</h1>
        </div>

        <Card className={styles.card} variant="elevated" padding="lg">
          <div className={styles.cardHeader}>
            <h2>Complete Your Registration</h2>
            <p>Please provide your contact details to continue</p>
          </div>

          <div className={styles.studentInfo}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name of the Candidate</span>
                <span className={styles.infoValue}>{user?.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Register No.</span>
                <span className={styles.infoValue}>{user?.registerNo}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date of Birth</span>
                <span className={styles.infoValue}>{user?.dateOfBirth}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Degree</span>
                <span className={styles.infoValue}>{user?.degree}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Branch</span>
                <span className={styles.infoValue}>{user?.branch}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Campus (Last Studied)</span>
                <span className={styles.infoValue}>{user?.campus}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <Input
                label="Mobile Number"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange('mobile')}
                leftIcon={<Phone size={20} />}
                error={errors.mobile}
                required
              />

              <Input
                label="Alternate Mobile Number"
                placeholder="Enter alternate mobile number"
                value={formData.altMobile}
                onChange={handleChange('altMobile')}
                leftIcon={<Phone size={20} />}
                error={errors.altMobile}
              />

              <Input
                label="Email ID"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange('email')}
                leftIcon={<Mail size={20} />}
                error={errors.email}
                required
              />

              <Input
                label="Alternate Email ID"
                type="email"
                placeholder="Enter alternate email address"
                value={formData.altEmail}
                onChange={handleChange('altEmail')}
                leftIcon={<Mail size={20} />}
                error={errors.altEmail}
              />
            </div>

            <div className={styles.formActions}>
              <Button type="submit" size="lg" isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </form>
        </Card>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} Hindustan Institute of Technology & Science. All rights reserved.</p>
        </footer>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Online Application Form"
        size="sm"
      >
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>
            <AlertCircle size={48} />
          </div>
          <p className={styles.modalText}>
            Please check your filled registration form once again. You are not allowed to
            change any details later. Are you sure you want to proceed to Transcript application?
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={handleConfirm}>
              OK
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
