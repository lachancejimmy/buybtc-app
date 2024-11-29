import { AuthService } from '../../app/shared/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = AuthService.getInstance();
  });

  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      const result = await service.login('test@example.com', 'password123');
      expect(result).toBeTruthy();
      expect(service.isAuthenticated).toBeTruthy();
      expect(service.currentUser).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const result = await service.login('invalid@example.com', 'wrongpass');
      expect(result).toBeFalsy();
      expect(service.isAuthenticated).toBeFalsy();
      expect(service.currentUser).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear authentication state', async () => {
      await service.login('test@example.com', 'password123');
      await service.logout();
      expect(service.isAuthenticated).toBeFalsy();
      expect(service.currentUser).toBeNull();
    });
  });
});