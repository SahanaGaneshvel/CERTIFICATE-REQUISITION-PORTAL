import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, FileText, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  RadioGroup,
  FileUpload,
  Checkbox,
} from '../components/ui';
import styles from './TranscriptApplication.module.css';

const collectionModes = [
  { value: 'applicant-in-person', label: 'Applicant-In Person' },
  { value: 'applicant-by-post', label: 'Applicant-By Post' },
  { value: 'authorized-in-person', label: 'Authorized person-In Person' },
  { value: 'authorized-by-post', label: 'Authorized person-By Post' },
];

const COLLECTION_MODE_MAP: Record<string, string> = {
  'applicant-in-person': 'APPLICANT_IN_PERSON',
  'applicant-by-post': 'APPLICANT_BY_POST',
  'authorized-in-person': 'AUTHORIZED_IN_PERSON',
  'authorized-by-post': 'AUTHORIZED_BY_POST',
};

// Must match FEE_PER_ENVELOPE in backend/src/routes/transcript.ts — backend recalculates
// the authoritative fee from (notSealed + sealed), this is only a client-side estimate.
const FEE_PER_ENVELOPE = 200;

export function TranscriptApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [numberOfSets, setNumberOfSets] = useState(1);
  const [notSealed, setNotSealed] = useState(1);
  const [sealed, setSealed] = useState(1);
  const [collectionMode, setCollectionMode] = useState('applicant-in-person');
  const [authorizedPerson, setAuthorizedPerson] = useState({
    name: '',
    relationship: '',
    address: '',
    mobile: '',
  });
  const [files, setFiles] = useState({
    applicantId: null as File | null,
    markSheet: null as File | null,
    authorizedId: null as File | null,
    authorizationLetter: null as File | null,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const totalCopies = numberOfSets * 2;
  const totalEnvelopes = notSealed + sealed;
  const feeAmount = totalEnvelopes * FEE_PER_ENVELOPE;

  const isAuthorizedCollection = collectionMode.includes('authorized');
  const isByPost = collectionMode.includes('post');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    if (!files.applicantId || !files.markSheet) {
      setSubmitError('Please upload applicant ID proof and mark sheet');
      return;
    }
    if (isAuthorizedCollection && (!files.authorizedId || !files.authorizationLetter)) {
      setSubmitError('Please upload the authorized person\'s ID proof and authorization letter');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('numberOfSets', String(numberOfSets));
      formData.append('notSealed', String(notSealed));
      formData.append('sealed', String(sealed));
      formData.append('collectionMode', COLLECTION_MODE_MAP[collectionMode]);
      if (isAuthorizedCollection || isByPost) {
        formData.append('authorizedName', authorizedPerson.name);
        formData.append('authorizedRelationship', authorizedPerson.relationship);
        formData.append('authorizedAddress', authorizedPerson.address);
        formData.append('authorizedMobile', authorizedPerson.mobile);
      }
      if (files.applicantId) formData.append('applicantIdProof', files.applicantId);
      if (files.markSheet) formData.append('markSheet', files.markSheet);
      if (files.authorizedId) formData.append('authorizedIdProof', files.authorizedId);
      if (files.authorizationLetter) formData.append('authorizationLetter', files.authorizationLetter);

      const { application } = await api.post<{ application: { id: string; feeAmount: number } }>(
        '/transcripts',
        formData
      );

      navigate('/payment', {
        state: {
          entity: 'transcript',
          entityId: application.id,
          amount: application.feeAmount,
          type: 'Transcript Fee',
          description: `${numberOfSets} set(s) of Transcript`,
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementSets = () => setNumberOfSets((prev) => prev + 1);
  const decrementSets = () => setNumberOfSets((prev) => Math.max(1, prev - 1));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transcript Application Form</h1>
        <a href="#instructions" className={styles.instructionsLink}>
          <Info size={16} />
          Instructions
        </a>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Student Info */}
        <Card variant="elevated" padding="lg" className={styles.section}>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{user?.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Register No.</span>
                <span className={styles.infoValue}>{user?.registerNo}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Course</span>
                <span className={styles.infoValue}>{user?.degree} - {user?.branch}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Institution</span>
                <span className={styles.infoValue}>{user?.institution}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Details */}
        <Card variant="elevated" padding="lg" className={styles.section}>
          <CardHeader>
            <CardTitle>Transcript Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.transcriptSection}>
              <div className={styles.setsControl}>
                <label className={styles.label}>Number of sets of Transcript required</label>
                <div className={styles.setsInputGroup}>
                  <button
                    type="button"
                    className={styles.setsButton}
                    onClick={decrementSets}
                    disabled={numberOfSets <= 1}
                  >
                    <Minus size={20} />
                  </button>
                  <span className={styles.setsValue}>{numberOfSets}</span>
                  <button
                    type="button"
                    className={styles.setsButton}
                    onClick={incrementSets}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <span className={styles.setsNote}>( {totalCopies} copies per set )</span>
              </div>

              <div className={styles.infoAlert}>
                <Info size={16} />
                <div>
                  <p>* Transcript will be issued till last semester of appearance for which Grade sheets are issued.</p>
                  <p>* Candidates applying for Transcript should have cleared all the subjects at the time of applying</p>
                </div>
              </div>

              <div className={styles.envelopeSection}>
                <h4 className={styles.envelopeTitle}>
                  Provide us your preference to get Transcript in Envelope sealed and signed
                </h4>
                <div className={styles.envelopeGrid}>
                  <div className={styles.envelopeItem}>
                    <span className={styles.envelopeLabel}>Number of Transcript not to be sealed</span>
                    <Input
                      type="number"
                      min={0}
                      max={totalCopies}
                      value={notSealed}
                      onChange={(e) => setNotSealed(Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.envelopeItem}>
                    <span className={styles.envelopeLabel}>Number of Transcripts to be sealed (1 Transcript per envelope)</span>
                    <Input
                      type="number"
                      min={0}
                      max={totalCopies}
                      value={sealed}
                      onChange={(e) => setSealed(Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.envelopeItem}>
                    <span className={styles.envelopeLabel}>Total number of envelopes</span>
                    <div className={styles.totalEnvelopes}>{totalEnvelopes}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Mode */}
        <Card variant="elevated" padding="lg" className={styles.section}>
          <CardHeader>
            <CardTitle>Mode of Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="collectionMode"
              options={collectionModes}
              value={collectionMode}
              onChange={setCollectionMode}
              direction="horizontal"
            />

            {isAuthorizedCollection && (
              <div className={styles.authorizedSection}>
                <h4 className={styles.sectionSubtitle}>Authorized Person's Details</h4>
                <div className={styles.formGrid}>
                  <Input
                    label="Name"
                    placeholder="Enter authorized person's name"
                    value={authorizedPerson.name}
                    onChange={(e) =>
                      setAuthorizedPerson({ ...authorizedPerson, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Relationship with the applicant"
                    placeholder="e.g., Father, Mother, Guardian"
                    value={authorizedPerson.relationship}
                    onChange={(e) =>
                      setAuthorizedPerson({ ...authorizedPerson, relationship: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="Enter 10-digit mobile number"
                    value={authorizedPerson.mobile}
                    onChange={(e) =>
                      setAuthorizedPerson({ ...authorizedPerson, mobile: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.fullWidth}>
                  <Input
                    label="Communication Address"
                    placeholder="Enter full address"
                    value={authorizedPerson.address}
                    onChange={(e) =>
                      setAuthorizedPerson({ ...authorizedPerson, address: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            )}

            {isByPost && (
              <div className={styles.postalSection}>
                <h4 className={styles.sectionSubtitle}>Postal Address</h4>
                <Input
                  label="Communication Address"
                  placeholder="Enter complete postal address for delivery"
                  value={authorizedPerson.address}
                  onChange={(e) =>
                    setAuthorizedPerson({ ...authorizedPerson, address: e.target.value })
                  }
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card variant="elevated" padding="lg" className={styles.section}>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.uploadGrid}>
              <FileUpload
                label="Upload applicant ID proof"
                helperText="Aadhar card/DL/International Passport"
                onFileSelect={(file) => setFiles({ ...files, applicantId: file })}
                required
              />
              <FileUpload
                label="Upload applicant Mark sheet"
                helperText="Upload photocopy of consolidated Grade sheet (or) all individual semester mark sheets (upto last appearance)"
                onFileSelect={(file) => setFiles({ ...files, markSheet: file })}
                required
              />
              {isAuthorizedCollection && (
                <>
                  <FileUpload
                    label="Government ID proof of the Authorized person"
                    helperText="Aadhar card/DL/International Passport"
                    onFileSelect={(file) => setFiles({ ...files, authorizedId: file })}
                    required
                  />
                  <FileUpload
                    label="Authorization letter of the applicant with signature"
                    onFileSelect={(file) => setFiles({ ...files, authorizationLetter: file })}
                    required
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fee Details */}
        <Card variant="elevated" padding="lg" className={styles.section}>
          <CardHeader>
            <CardTitle>Fee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.feeSection}>
              {submitError && <div className={styles.infoAlert}>{submitError}</div>}
              <div className={styles.feeRow}>
                <span>Fee Details (INR)</span>
                <span className={styles.feeAmount}>
                  &#8377; {feeAmount.toFixed(2)} + Convenience Fee
                </span>
              </div>

              <Checkbox
                label={
                  <>
                    I agree with the payment <a href="#terms">Terms & Conditions</a>
                  </>
                }
                checked={agreedToTerms}
                onChange={setAgreedToTerms}
              />

              <div className={styles.paymentGateway}>
                <span>Choose Payment Gateway:</span>
                <div className={styles.gatewayOption}>
                  <input type="radio" name="gateway" value="payu" defaultChecked />
                  <img src="/payu-logo.png" alt="PayU" className={styles.gatewayLogo} />
                  <span>PayU</span>
                </div>
              </div>
            </div>

            <div className={styles.submitSection}>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<FileText size={20} />}
              >
                Proceed to PAY
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
