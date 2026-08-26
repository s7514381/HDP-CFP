'use client';

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

function ResetPasswordForm() {
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { post, loading } = useApi();
  const { danger } = useToast();
  const { translate } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordMismatch)}</span> });
      return;
    }

    if (formData.newPassword.length < 6) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordTooShort)}</span> });
      return;
    }

    const url = `${API_MAP.MANAGER_RESET_PASSWORD}?Token=${encodeURIComponent(token)}&NewPassword=${encodeURIComponent(formData.newPassword)}&ConfirmPassword=${encodeURIComponent(formData.confirmPassword)}`;
    const res = await post<unknown, Record<string, never>>(url, {});

    if (res.success) {
      setDone(true);
    } else {
      danger({ message: <span>{res.message || translate(LANGUAGE_KEYS.common.saveFailed)}</span> });
    }
  };

  if (!token) {
    return (
      <>
        <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.invalidLink)}</h3>
        <div className="alert alert-danger" role="alert">
          {translate(LANGUAGE_KEYS.auth.invalidOrExpiredLink)}
        </div>
        <div className="auth-footer">
          <Link href="/forgot-password/" className="btn btn-outline-primary w-100">{translate(LANGUAGE_KEYS.auth.requestAgain)}</Link>
        </div>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.resetSuccess)}</h3>
        <div className="alert alert-success" role="alert">
          {translate(LANGUAGE_KEYS.auth.passwordResetSuccess)}
        </div>
        <div className="auth-footer">
          <Link href="/login/" className="btn btn-primary w-100">{translate(LANGUAGE_KEYS.auth.goToLogin)}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.resetPassword)}</h3>
      <p className="text-center text-muted mb-4">{translate(LANGUAGE_KEYS.auth.resetPasswordDescription)}</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.newPassword)}
            name="newPassword"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.newPasswordPlaceholder)}
            value={formData.newPassword}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-4">
          <Input
            label={translate(LANGUAGE_KEYS.auth.confirmPassword)}
            name="confirmPassword"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.confirmPasswordPlaceholder)}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            {translate(LANGUAGE_KEYS.auth.confirmResetPassword)}
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        <Link href="/login/">{translate(LANGUAGE_KEYS.auth.returnLogin)}</Link>
      </div>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
