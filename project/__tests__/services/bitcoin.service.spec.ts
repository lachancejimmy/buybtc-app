import { BitcoinService } from '../../app/shared/services/crypto/bitcoin.service';

describe('BitcoinService', () => {
  let service: BitcoinService;

  beforeEach(() => {
    service = BitcoinService.getInstance();
  });

  describe('validateAddress', () => {
    it('should validate correct Bitcoin addresses', () => {
      expect(service.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBeTruthy();
      expect(service.validateAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBeTruthy();
    });

    it('should reject invalid Bitcoin addresses', () => {
      expect(service.validateAddress('invalid-address')).toBeFalsy();
      expect(service.validateAddress('')).toBeFalsy();
    });
  });

  describe('getCurrentPrice', () => {
    it('should fetch current Bitcoin price', async () => {
      const price = await service.getCurrentPrice();
      expect(price).toHaveProperty('CAD');
      expect(price).toHaveProperty('USD');
      expect(price).toHaveProperty('EUR');
      expect(typeof price.CAD).toBe('number');
    });
  });
});