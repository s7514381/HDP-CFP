'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

export default function Register() {
  const router = useRouter();
  const { post, loading } = useApi();
  const { success, danger } = useToast();
  const { translate } = useLanguage();
  const [formData, setFormData] = useState({
    account: "",
    email: "",
    name: "",
    taxID: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 密碼確認
    if (formData.password !== formData.confirmPassword) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordMismatch)}</span> });
      return;
    }

    // 密碼長度檢查
    if (formData.password.length < 6) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.auth.passwordTooShort)}</span> });
      return;
    }

    // 建構 URL 參數（與登入頁面一致的方式）
    const url = `${API_MAP.MANAGER_REGISTER}?Account=${encodeURIComponent(formData.account)}&Email=${encodeURIComponent(formData.email)}&Name=${encodeURIComponent(formData.name)}&TaxID=${encodeURIComponent(formData.taxID)}&Password=${encodeURIComponent(formData.password)}&ConfirmPassword=${encodeURIComponent(formData.confirmPassword)}`;

    const res = await post<unknown, Record<string, never>>(url, {});

    if (res.success && res.status === 200) {
      success({ message: <span>{translate(LANGUAGE_KEYS.auth.registerSuccess)}</span> });
      setTimeout(() => {
        router.push("/login/");
      }, 1500);
    } else {
      danger({ message: <span>{res.message || translate(LANGUAGE_KEYS.auth.registerFailed)}</span> });
    }
  };

  return (
    <>
      <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.registerAccount)}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.account)}
            name="account"
            placeholder={translate(LANGUAGE_KEYS.auth.accountPlaceholder)}
            value={formData.account}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.userName)}
            name="name"
            placeholder={translate(LANGUAGE_KEYS.auth.userNamePlaceholder)}
            value={formData.name}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.email)}
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.taxId)}
            name="taxID"
            placeholder={translate(LANGUAGE_KEYS.auth.taxIdPlaceholder)}
            value={formData.taxID}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.password)}
            name="password"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.passwordPlaceholder)}
            value={formData.password}
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
          <Btn type="submit" color="success" outline={false} size="lg" loading={loading === 'loading'}>
            {translate(LANGUAGE_KEYS.auth.register)}
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        {translate(LANGUAGE_KEYS.auth.hasAccount)} <Link href="/login/">{translate(LANGUAGE_KEYS.auth.returnLogin)}</Link>
      </div>
    </>
  );
}
