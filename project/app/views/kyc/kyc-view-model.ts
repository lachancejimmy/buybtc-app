import { Observable } from '@nativescript/core';
import { Camera } from '@nativescript/camera';
import { ImageSource } from '@nativescript/core';
import { KYCService } from '../../shared/services/kyc/kyc.service';
import { 
  KYCStatus, 
  DocumentType, 
  PersonalInfo, 
  KYCDocument 
} from '../../shared/services/kyc/kyc.model';

export class KYCViewModel extends Observable {
  private kycService: KYCService;
  private _verificationId: string;
  private _personalInfo: PersonalInfo;
  private _documentTypes: string[];
  private _selectedDocumentIndex: number;
  private _frontPhotoSource: string;
  private _backPhotoSource: string;
  private _documentNumber: string;
  private _documentExpiry: string;
  private _status: KYCStatus;
  private _showPersonalInfo: boolean;
  private _showDocuments: boolean;

  constructor() {
    super();
    this.kycService = KYCService.getInstance();
    this.initialize();
  }

  private initialize(): void {
    this._status = KYCStatus.NOT_STARTED;
    this._showPersonalInfo = true;
    this._showDocuments = false;
    this._documentTypes = Object.values(DocumentType);
    this._selectedDocumentIndex = 0;
    
    this._personalInfo = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      },
      phone: '',
      email: ''
    };
  }

  get personalInfo(): PersonalInfo {
    return this._personalInfo;
  }

  get documentTypes(): string[] {
    return this._documentTypes;
  }

  get selectedDocumentIndex(): number {
    return this._selectedDocumentIndex;
  }

  set selectedDocumentIndex(value: number) {
    if (this._selectedDocumentIndex !== value) {
      this._selectedDocumentIndex = value;
      this.notifyPropertyChange('selectedDocumentIndex', value);
    }
  }

  get frontPhotoSource(): string {
    return this._frontPhotoSource;
  }

  get backPhotoSource(): string {
    return this._backPhotoSource;
  }

  get documentNumber(): string {
    return this._documentNumber;
  }

  set documentNumber(value: string) {
    if (this._documentNumber !== value) {
      this._documentNumber = value;
      this.notifyPropertyChange('documentNumber', value);
      this.notifyPropertyChange('canSubmitDocument', this.canSubmitDocument);
    }
  }

  get documentExpiry(): string {
    return this._documentExpiry;
  }

  set documentExpiry(value: string) {
    if (this._documentExpiry !== value) {
      this._documentExpiry = value;
      this.notifyPropertyChange('documentExpiry', value);
      this.notifyPropertyChange('canSubmitDocument', this.canSubmitDocument);
    }
  }

  get showPersonalInfo(): boolean {
    return this._showPersonalInfo;
  }

  get showDocuments(): boolean {
    return this._showDocuments;
  }

  get statusText(): string {
    switch (this._status) {
      case KYCStatus.NOT_STARTED:
        return 'Non commencé';
      case KYCStatus.IN_PROGRESS:
        return 'En cours';
      case KYCStatus.PENDING_REVIEW:
        return 'En attente de vérification';
      case KYCStatus.APPROVED:
        return 'Approuvé';
      case KYCStatus.REJECTED:
        return 'Rejeté';
      default:
        return '';
    }
  }

  get statusColor(): string {
    switch (this._status) {
      case KYCStatus.APPROVED:
        return '#28a745';
      case KYCStatus.REJECTED:
        return '#dc3545';
      case KYCStatus.PENDING_REVIEW:
        return '#ffc107';
      default:
        return '#6c757d';
    }
  }

  get canSubmitDocument(): boolean {
    return !!(
      this._frontPhotoSource &&
      this._documentNumber &&
      this._documentExpiry
    );
  }

  async submitPersonalInfo(): Promise<void> {
    try {
      const verification = await this.kycService.startVerification('user123', this._personalInfo);
      this._verificationId = verification.id;
      this._status = verification.status;
      this._showPersonalInfo = false;
      this._showDocuments = true;
      
      this.notifyPropertyChange('status', this._status);
      this.notifyPropertyChange('showPersonalInfo', false);
      this.notifyPropertyChange('showDocuments', true);
    } catch (error) {
      console.error('Failed to submit personal info:', error);
    }
  }

  async takeFrontPhoto(): Promise<void> {
    try {
      const image = await Camera.takePicture();
      this._frontPhotoSource = image.toBase64String('jpg');
      this.notifyPropertyChange('frontPhotoSource', this._frontPhotoSource);
      this.notifyPropertyChange('canSubmitDocument', this.canSubmitDocument);
    } catch (error) {
      console.error('Failed to take front photo:', error);
    }
  }

  async takeBackPhoto(): Promise<void> {
    try {
      const image = await Camera.takePicture();
      this._backPhotoSource = image.toBase64String('jpg');
      this.notifyPropertyChange('backPhotoSource', this._backPhotoSource);
    } catch (error) {
      console.error('Failed to take back photo:', error);
    }
  }

  async submitDocument(): Promise<void> {
    try {
      const document: KYCDocument = {
        type: this._documentTypes[this._selectedDocumentIndex] as DocumentType,
        frontImage: this._frontPhotoSource,
        backImage: this._backPhotoSource,
        documentNumber: this._documentNumber,
        expiryDate: this._documentExpiry,
        issuingCountry: this._personalInfo.nationality
      };

      const verification = await this.kycService.submitDocument(this._verificationId, document);
      this._status = verification.status;
      this.notifyPropertyChange('status', this._status);
    } catch (error) {
      console.error('Failed to submit document:', error);
    }
  }
}