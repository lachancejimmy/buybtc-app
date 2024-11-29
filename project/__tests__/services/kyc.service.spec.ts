import { KYCService } from '../../app/shared/services/kyc.service';

describe('KYCService', () => {
  let service: KYCService;

  beforeEach(() => {
    service = KYCService.getInstance();
  });

  describe('submitVerification', () => {
    it('should submit KYC verification', async () => {
      const result = await service.submitVerification(
        'user123',
        {
          type: 'passport',
          front: 'base64-image-data'
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          address: '123 Main St',
          city: 'Montreal',
          country: 'Canada',
          postalCode: 'H1A 1A1'
        }
      );

      expect(result.status).toBe('pending');
      expect(result.documentType).toBe('passport');
      expect(result.submissionDate).toBeDefined();
    });
  });

  describe('getVerificationStatus', () => {
    it('should retrieve verification status', async () => {
      const status = await service.getVerificationStatus('user123');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('documentType');
      expect(status).toHaveProperty('submissionDate');
    });
  });
});