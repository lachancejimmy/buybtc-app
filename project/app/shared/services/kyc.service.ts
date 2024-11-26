import { Observable } from '@nativescript/core';
import axios from 'axios';

export interface KYCDocument {
  type: 'passport' | 'driving_license' | 'national_id';
  front: string; // Base64 encoded image
  back?: string; // Base64 encoded image, required for some document types
}

export interface KYCVerification {
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  submissionDate: Date;
  verificationDate?: Date;
  rejectionReason?: string;
}

export class KYCService extends Observable {
  private static instance: KYCService;
  private readonly API_URL = 'https://api.kyc-provider.com/v1';
  private readonly API_KEY = 'your-api-key';

  private constructor() {
    super();
  }

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  public async submitVerification(
    userId: string,
    document: KYCDocument,
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
    }
  ): Promise<KYCVerification> {
    try {
      const response = await axios.post(
        `${this.API_URL}/verifications`,
        {
          userId,
          document,
          personalInfo
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: response.data.status,
        documentType: document.type,
        submissionDate: new Date(),
        verificationDate: response.data.verificationDate ? new Date(response.data.verificationDate) : undefined,
        rejectionReason: response.data.rejectionReason
      };
    } catch (error) {
      console.error('Failed to submit KYC verification:', error);
      throw error;
    }
  }

  public async getVerificationStatus(userId: string): Promise<KYCVerification> {
    try {
      const response = await axios.get(
        `${this.API_URL}/verifications/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      );

      return {
        status: response.data.status,
        documentType: response.data.documentType,
        submissionDate: new Date(response.data.submissionDate),
        verificationDate: response.data.verificationDate ? new Date(response.data.verificationDate) : undefined,
        rejectionReason: response.data.rejectionReason
      };
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw error;
    }
  }

  public async uploadDocument(file: string, type: 'front' | 'back'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post(
        `${this.API_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.documentId;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  public async resubmitVerification(
    userId: string,
    document: KYCDocument
  ): Promise<KYCVerification> {
    try {
      const response = await axios.put(
        `${this.API_URL}/verifications/${userId}`,
        { document },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: response.data.status,
        documentType: document.type,
        submissionDate: new Date(),
        verificationDate: response.data.verificationDate ? new Date(response.data.verificationDate) : undefined,
        rejectionReason: response.data.rejectionReason
      };
    } catch (error) {
      console.error('Failed to resubmit verification:', error);
      throw error;
    }
  }
}