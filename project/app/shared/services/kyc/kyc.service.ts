import { Observable } from '@nativescript/core';
import axios from 'axios';
import { SecureStorage } from '@nativescript/secure-storage';
import { ErrorService } from '../error.service';
import { NotificationService } from '../notification.service';
import { DocumentValidationService } from './document-validation.service';
import { PersonalInfoValidationService } from './personal-info-validation.service';
import { 
  KYCVerification, 
  KYCStatus, 
  KYCLevel, 
  PersonalInfo, 
  KYCDocument 
} from './kyc.model';

export class KYCService extends Observable {
  private static instance: KYCService;
  private readonly API_URL = 'https://api.kyc-provider.com/v1';
  private secureStorage: SecureStorage;
  private errorService: ErrorService;
  private notificationService: NotificationService;
  private documentValidation: DocumentValidationService;
  private personalInfoValidation: PersonalInfoValidationService;

  private constructor() {
    super();
    this.secureStorage = new SecureStorage();
    this.errorService = ErrorService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.documentValidation = DocumentValidationService.getInstance();
    this.personalInfoValidation = PersonalInfoValidationService.getInstance();
  }

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  public async startVerification(userId: string, personalInfo: PersonalInfo): Promise<KYCVerification> {
    try {
      // Validate personal info
      const validation = this.personalInfoValidation.validatePersonalInfo(personalInfo);
      if (!validation.isValid) {
        throw new Error(`Validation des informations personnelles échouée: ${validation.errors.join(', ')}`);
      }

      const verification: KYCVerification = {
        id: Date.now().toString(),
        userId,
        status: KYCStatus.IN_PROGRESS,
        level: KYCLevel.NONE,
        personalInfo,
        documents: [],
        submissionDate: new Date(),
        lastUpdateDate: new Date()
      };

      await this.saveVerification(verification);
      return verification;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async submitDocument(verificationId: string, document: KYCDocument): Promise<KYCVerification> {
    try {
      // Validate document
      const validation = await this.documentValidation.validateDocument(document);
      if (!validation.isValid) {
        throw new Error(`Validation du document échouée: ${validation.errors.join(', ')}`);
      }

      const verification = await this.getVerification(verificationId);
      if (!verification) {
        throw new Error('Vérification non trouvée');
      }

      verification.documents.push(document);
      verification.lastUpdateDate = new Date();
      verification.status = KYCStatus.PENDING_REVIEW;

      await this.saveVerification(verification);
      await this.notifyDocumentSubmission(verification);

      return verification;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async getVerificationStatus(verificationId: string): Promise<KYCStatus> {
    try {
      const verification = await this.getVerification(verificationId);
      return verification?.status || KYCStatus.NOT_STARTED;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  private async saveVerification(verification: KYCVerification): Promise<void> {
    await this.secureStorage.set({
      key: `kyc_verification_${verification.id}`,
      value: JSON.stringify(verification)
    });
  }

  private async getVerification(verificationId: string): Promise<KYCVerification | null> {
    try {
      const data = await this.secureStorage.get({
        key: `kyc_verification_${verificationId}`
      });
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async notifyDocumentSubmission(verification: KYCVerification): Promise<void> {
    await this.notificationService.sendLocalNotification({
      title: 'Document KYC soumis',
      body: 'Votre document a été soumis avec succès et est en cours de vérification.'
    });
  }
}