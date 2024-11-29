import { Observable } from '@nativescript/core';
import { ErrorService } from '../error.service';
import { PersonalInfo } from './kyc.model';

export class PersonalInfoValidationService extends Observable {
  private static instance: PersonalInfoValidationService;
  private errorService: ErrorService;

  private constructor() {
    super();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): PersonalInfoValidationService {
    if (!PersonalInfoValidationService.instance) {
      PersonalInfoValidationService.instance = new PersonalInfoValidationService();
    }
    return PersonalInfoValidationService.instance;
  }

  public validatePersonalInfo(info: PersonalInfo): { isValid: boolean; errors: string[] } {
    try {
      const errors: string[] = [];

      // Validate name
      if (!this.validateName(info.firstName)) {
        errors.push('Prénom invalide');
      }
      if (!this.validateName(info.lastName)) {
        errors.push('Nom invalide');
      }

      // Validate date of birth
      if (!this.validateDateOfBirth(info.dateOfBirth)) {
        errors.push('Date de naissance invalide ou âge minimum non atteint');
      }

      // Validate address
      if (!this.validateAddress(info.address)) {
        errors.push('Adresse invalide');
      }

      // Validate phone
      if (!this.validatePhone(info.phone)) {
        errors.push('Numéro de téléphone invalide');
      }

      // Validate email
      if (!this.validateEmail(info.email)) {
        errors.push('Adresse email invalide');
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

  private validateName(name: string): boolean {
    return /^[A-Za-zÀ-ÿ\s-]{2,50}$/.test(name);
  }

  private validateDateOfBirth(dob: string): boolean {
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    } catch {
      return false;
    }
  }

  private validateAddress(address: { street: string; city: string; postalCode: string; country: string }): boolean {
    return (
      address.street.length >= 5 &&
      address.city.length >= 2 &&
      this.validatePostalCode(address.postalCode, address.country) &&
      address.country.length >= 2
    );
  }

  private validatePostalCode(postalCode: string, country: string): boolean {
    const postalCodePatterns = {
      'CA': /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'US': /^\d{5}(-\d{4})?$/,
      'FR': /^\d{5}$/
    };

    const pattern = postalCodePatterns[country];
    return pattern ? pattern.test(postalCode) : true;
  }

  private validatePhone(phone: string): boolean {
    return /^\+?[\d\s-]{10,}$/.test(phone);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}