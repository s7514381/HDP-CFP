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
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordMismatch, '密碼與確認密碼不一致')}</span> });
      return;
    }

    if (formData.newPassword.length < 6) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordTooShort, '密碼長度至少需要 6 個字元')}</span> });
      return;
    }

    const url = `${API_MAP.MANAGER_RESET_PASSWORD}?Token=${encodeURIComponent(token)}&NewPassword=${encodeURIComponent(formData.newPassword)}&ConfirmPassword=${encodeURIComponent(formData.confirmPassword)}`;
    const res = await post<unknown, Record<string, never>>(url, {});

    if (res.success) {
      setDone(true);
    } else {
      danger({ message: <span>{res.message || translate(LANGUAGE_KEYS.common.saveFailed, '重設失敗，請重新申請忘記密碼')}</span> });
    }
  };

  if (!token) {
    return (
      <>
        <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.invalidLink, '連結無效')}</h3>
        <div className="alert alert-danger" role="alert">
          {translate(LANGUAGE_KEYS.auth.invalidOrExpiredLink, '重設連結無效或已過期，請重新申請。')}
        </div>
        <div className="auth-footer">
          <Link href="/forgot-password/" className="btn btn-outline-primary w-100">{translate(LANGUAGE_KEYS.auth.requestAgain, '重新申請')}</Link>
        </div>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.resetSuccess, '重設成功')}</h3>
        <div className="alert alert-success" role="alert">
          {translate(LANGUAGE_KEYS.auth.passwordResetSuccess, '密碼已重設成功，請使用新密碼登入。')}
        </div>
        <div className="auth-footer">
          <Link href="/login/" className="btn btn-primary w-100">{translate(LANGUAGE_KEYS.auth.goToLogin, '前往登入')}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.resetPassword, '重設密碼')}</h3>
      <p className="text-center text-muted mb-4">{translate(LANGUAGE_KEYS.auth.resetPasswordDescription, '請輸入您的新密碼（至少 6 個字元）。')}</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.newPassword, '新密碼')}
            name="newPassword"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.newPasswordPlaceholder, '請輸入新密碼')}
            value={formData.newPassword}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-4">
          <Input
            label={translate(LANGUAGE_KEYS.auth.confirmPassword, '確認密碼')}
            name="confirmPassword"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.confirmPasswordPlaceholder, '請再次輸入新密碼')}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            {translate(LANGUAGE_KEYS.auth.confirmResetPassword, '確認重設密碼')}
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        <Link href="/login/">{translate(LANGUAGE_KEYS.auth.returnLogin, '返回登入')}</Link>
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
