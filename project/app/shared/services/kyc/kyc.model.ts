export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum KYCLevel {
  NONE = 0,
  BASIC = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3
}

export enum DocumentType {
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  NATIONAL_ID = 'national_id',
  PROOF_OF_ADDRESS = 'proof_of_address'
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
}

export interface KYCDocument {
  type: DocumentType;
  frontImage: string; // Base64
  backImage?: string; // Base64
  expiryDate?: string;
  issuingCountry: string;
  documentNumber: string;
}

export interface KYCVerification {
  id: string;
  userId: string;
  status: KYCStatus;
  level: KYCLevel;
  personalInfo: PersonalInfo;
  documents: KYCDocument[];
  submissionDate: Date;
  lastUpdateDate: Date;
  rejectionReason?: string;
  notes?: string;
}