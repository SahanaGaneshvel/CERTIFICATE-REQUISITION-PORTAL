export interface User {
  id: string;
  registerNo: string;
  name: string;
  dateOfBirth: string;
  degree: string;
  branch: string;
  campus: string;
  gender: string;
  admittedYear: number;
  institution: string;
  mobileNumber: string;
  alternateMobile?: string;
  email: string;
  alternateEmail?: string;
  isRegistered: boolean;
}

export interface TranscriptApplication {
  id: string;
  referenceNumber: string;
  registerNumber: string;
  numberOfSets: number;
  notSealed: number;
  sealed: number;
  totalEnvelopes: number;
  collectionMode: 'applicant-in-person' | 'applicant-by-post' | 'authorized-in-person' | 'authorized-by-post';
  authorizedPerson?: {
    name: string;
    relationship: string;
    address: string;
    mobile: string;
  };
  applicantIdProof?: string;
  markSheet?: string;
  authorizedIdProof?: string;
  authorizationLetter?: string;
  feeAmount: number;
  status: 'pending' | 'applied' | 'processing' | 'ready' | 'collected';
  appliedDate: string;
  paymentStatus: 'pending' | 'success' | 'failed';
}

export interface CertificateRequest {
  id: string;
  certificateType: string;
  purpose: string;
  status: 'pending' | 'generated' | 'downloaded';
  requestDate: string;
}

export interface PaymentTransaction {
  id: string;
  srmTransId: string;
  pgTransId: string;
  dateTime: string;
  status: 'success' | 'failed' | 'pending';
  feeType: string;
  amount: number;
}
