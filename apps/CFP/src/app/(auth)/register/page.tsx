'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useToast } from '@packages/contexts/ToastContext';
import { ApiError } from "@packages/components/ApiError";

export default function Register() {
  const router = useRouter();
  const { post, loading } = useApi();
  const { success, danger } = useToast();
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
      danger({ message: <span>密碼與確認密碼不一致</span> });
      return;
    }

    // 密碼長度檢查
    if (formData.password.length < 6) {
      danger({ message: <span>密碼長度至少需要 6 個字元</span> });
      return;
    }

    // 建構 URL 參數（與登入頁面一致的方式）
    const url = `${API_MAP.MANAGER_REGISTER}?Account=${encodeURIComponent(formData.account)}&Email=${encodeURIComponent(formData.email)}&Name=${encodeURIComponent(formData.name)}&TaxID=${encodeURIComponent(formData.taxID)}&Password=${encodeURIComponent(formData.password)}&ConfirmPassword=${encodeURIComponent(formData.confirmPassword)}`;
    
    const res = await post<any, any>(url, {});

    if (res.success && res.status === 200) {
      success({ message: <span>註冊成功！即將跳轉至登入頁...</span> });
      setTimeout(() => {
        router.push("/login/");
      }, 1500);
    } else {
      danger({ message: <span>{res.message || "註冊失敗，請稍後再試"}</span> });
    }
  };

  return (
    <>
      <ApiError />
      <h3 className="auth-title">註冊帳號</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label="帳號"
            name="account"
            placeholder="請輸入登入帳號"
            value={formData.account}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label="使用者名稱"
            name="name"
            placeholder="請輸入使用者名稱"
            value={formData.name}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label="電子郵件"
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
            label="統編（TaxID）"
            name="taxID"
            placeholder="請輸入公司統編"
            value={formData.taxID}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label="密碼"
            name="password"
            type="password"
            placeholder="請輸入密碼（至少6個字元）"
            value={formData.password}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="mb-4">
          <Input
            label="確認密碼"
            name="confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="success" outline={false} size="lg" loading={loading === 'loading'}>
            註冊
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        已有帳號？ <Link href="/login/">返回登入</Link>
      </div>
    </>
  );
}
