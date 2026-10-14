export type EnvironmentName = 'production' | 'uat' | 'development' | 'unspecified';

export function getConfiguredEnvironment(): EnvironmentName {
  const configured = String(import.meta.env.VITE_APP_ENV || '').trim().toLowerCase();
  if (configured === 'production' || configured === 'prod') return 'production';
  if (configured === 'uat' || configured === 'staging') return 'uat';
  if (configured === 'development' || configured === 'dev' || import.meta.env.DEV) return 'development';
  return 'unspecified';
}

export function normalizeApiBaseUrl(value: string | undefined | null): string {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function validateApiConfiguration(environment: EnvironmentName, apiBaseUrl: string): string[] {
  const normalized = normalizeApiBaseUrl(apiBaseUrl);
  const issues: string[] = [];

  if (normalized && !/^https?:\/\//i.test(normalized)) {
    issues.push('API base URL must be absolute when configured.');
  }

  if ((environment === 'production' || environment === 'uat') && !normalized) {
    issues.push(`${environment} requires an explicit API base URL.`);
  }

  if ((environment === 'production' || environment === 'uat') && /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(normalized)) {
    issues.push(`${environment} cannot use a localhost API base URL.`);
  }

  return issues;
}

