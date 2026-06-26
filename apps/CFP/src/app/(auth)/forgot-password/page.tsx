'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useToast } from '@packages/contexts/ToastContext';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const { post, loading } = useApi();
  const { danger } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = `${API_MAP.MANAGER_FORGOT_PASSWORD}?Email=${encodeURIComponent(email)}`;
    const res = await post<any, any>(url, {});

    if (res.status === 200 && res.success) {
      setSubmitted(true);
    } else {
      danger({ message: <span>{res.message || "發送失敗，請稍後再試"}</span> });
    }
  };

  if (submitted) {
    return (
      <>
        <h3 className="auth-title">郵件已發送</h3>
        <div className="alert alert-success" role="alert">
          重設密碼的連結已發送到您的電子郵件信箱，請查收。
        </div>
        <div className="auth-footer">
          <Link href="/login/" className="btn btn-outline-primary w-100">返回登入</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="auth-title">忘記密碼</h3>
      <p className="text-center text-muted mb-4">請輸入您的電子郵件，我們將寄送重設密碼連結給您。</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label="電子郵件"
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            發送重設郵件
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        記起密碼了？ <Link href="/login/">返回登入</Link>
      </div>
    </>
  );
}
