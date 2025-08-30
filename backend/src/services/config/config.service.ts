export class ConfigService {
  private static instance: ConfigService;
  private config: Map<string, any>;

  private constructor() {
    this.config = new Map();
    this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): void {
    // Load configuration from environment variables
    this.config.set('NODE_ENV', process.env.NODE_ENV || 'development');
    this.config.set('PORT', parseInt(process.env.PORT || '3000'));
    this.config.set('JWT_SECRET', process.env.JWT_SECRET || 'your-secret-key');
    this.config.set('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN || '24h');
    this.config.set('DATABASE_URL', process.env.DATABASE_URL);
    this.config.set('REDIS_HOST', process.env.REDIS_HOST || 'localhost');
    this.config.set('REDIS_PORT', parseInt(process.env.REDIS_PORT || '6379'));
    this.config.set('REDIS_PASSWORD', process.env.REDIS_PASSWORD);
    this.config.set('EMAIL_HOST', process.env.EMAIL_HOST);
    this.config.set('EMAIL_PORT', parseInt(process.env.EMAIL_PORT || '587'));
    this.config.set('EMAIL_USER', process.env.EMAIL_USER);
    this.config.set('EMAIL_PASS', process.env.EMAIL_PASS);
    this.config.set('EMAIL_FROM', process.env.EMAIL_FROM || 'noreply@elms.com');
  }

  get(key: string): any {
    return this.config.get(key);
  }

  getString(key: string, defaultValue?: string): string {
    const value = this.config.get(key);
    return value || defaultValue || '';
  }

  getNumber(key: string, defaultValue?: number): number {
    const value = this.config.get(key);
    return typeof value === 'number' ? value : defaultValue || 0;
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.config.get(key);
    return typeof value === 'boolean' ? value : defaultValue || false;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }
}
