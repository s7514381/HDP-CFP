'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const { post, loading } = useApi();
  const { danger } = useToast();
  const { translate } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = `${API_MAP.MANAGER_FORGOT_PASSWORD}?Email=${encodeURIComponent(email)}`;
    const res = await post<unknown, Record<string, never>>(url, {});

    if (res.status === 200 && res.success) {
      setSubmitted(true);
    } else {
      danger({ message: <span>{res.message || translate(LANGUAGE_KEYS.auth.sendFailed)}</span> });
    }
  };

  if (submitted) {
    return (
      <>
        <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.emailSent)}</h3>
        <div className="alert alert-success" role="alert">
          {translate(LANGUAGE_KEYS.auth.resetEmailSent)}
        </div>
        <div className="auth-footer">
          <Link href="/login/" className="btn btn-outline-primary w-100">{translate(LANGUAGE_KEYS.auth.returnLogin)}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.forgotPassword)}</h3>
      <p className="text-center text-muted mb-4">{translate(LANGUAGE_KEYS.auth.forgotPasswordDescription)}</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.email)}
            name="email"
            type="email"
            placeholder={translate(LANGUAGE_KEYS.common.emailPlaceholder)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            {translate(LANGUAGE_KEYS.auth.sendResetEmail)}
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        {translate(LANGUAGE_KEYS.auth.rememberPassword)} <Link href="/login/">{translate(LANGUAGE_KEYS.auth.returnLogin)}</Link>
      </div>
    </>
  );
}
