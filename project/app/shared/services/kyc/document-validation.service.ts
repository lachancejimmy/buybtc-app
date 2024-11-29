import { Observable } from '@nativescript/core';
import { ErrorService } from '../error.service';
import { DocumentType, KYCDocument } from './kyc.model';

export class DocumentValidationService extends Observable {
  private static instance: DocumentValidationService;
  private errorService: ErrorService;

  private constructor() {
    super();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): DocumentValidationService {
    if (!DocumentValidationService.instance) {
      DocumentValidationService.instance = new DocumentValidationService();
    }
    return DocumentValidationService.instance;
  }

  public async validateDocument(document: KYCDocument): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Validate image format and size
      if (!this.validateImageFormat(document.frontImage)) {
        errors.push('Format d\'image invalide. Utilisez JPG ou PNG.');
      }

      if (document.backImage && !this.validateImageFormat(document.backImage)) {
        errors.push('Format d\'image invalide pour le verso. Utilisez JPG ou PNG.');
      }

      // Validate expiry date if provided
      if (document.expiryDate && !this.validateExpiryDate(document.expiryDate)) {
        errors.push('Le document est expiré ou la date d\'expiration est invalide.');
      }

      // Validate document number format based on type
      if (!this.validateDocumentNumber(document.type, document.documentNumber)) {
        errors.push('Numéro de document invalide.');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  private validateImageFormat(base64Image: string): boolean {
    // Validate image format and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFormats = ['image/jpeg', 'image/png'];
    
    try {
      const imageData = base64Image.split(',')[1];
      const binarySize = atob(imageData).length;
      
      if (binarySize > maxSize) {
        return false;
      }

      const format = base64Image.split(';')[0].split(':')[1];
      return validFormats.includes(format);
    } catch {
      return false;
    }
  }

  private validateExpiryDate(expiryDate: string): boolean {
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      return expiry > today;
    } catch {
      return false;
    }
  }

  private validateDocumentNumber(type: DocumentType, number: string): boolean {
    switch (type) {
      case DocumentType.PASSPORT:
        return /^[A-Z0-9]{6,12}$/.test(number);
      case DocumentType.DRIVING_LICENSE:
        return /^[A-Z0-9]{10,15}$/.test(number);
      case DocumentType.NATIONAL_ID:
        return /^[A-Z0-9]{8,15}$/.test(number);
      default:
        return true;
    }
  }
}