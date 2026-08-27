'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initialized, translate } = useLanguage();

  if (!initialized) {
    return (
      <div className="auth-bg" aria-busy="true">
        <div className="auth-card auth-loading-card" role="status" aria-label={translate(LANGUAGE_KEYS.common.loading) || undefined}>
          <img src="/images/logo-vert.png" alt={translate(LANGUAGE_KEYS.common.supplierPlatform)} className="auth-logo" />
          <span className="spinner-border text-primary" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <img src="/images/logo-vert.png" alt={translate(LANGUAGE_KEYS.common.supplierPlatform)} className="auth-logo" />
        {children}
      </div>
    </div>
  );
}
