'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 忘記密碼邏輯待實作
    console.log("Forgot password submitted");
    setSubmitted(true);
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
        <div className="mb-4">
          <Input
            label="電子郵件"
            name="email"
            type="email"
            placeholder="example@mail.com"
            required
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg">
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
