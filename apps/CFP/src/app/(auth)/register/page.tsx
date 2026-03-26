'use client';

import React from "react";
import Link from "next/link";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";

export default function Register() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 註冊邏輯待實作
    console.log("Register submitted");
  };

  return (
    <>
      <h3 className="auth-title">註冊帳號</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label="醫院/供應商名稱"
            name="companyName"
            placeholder="請輸入單位名稱"
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label="帳號"
            name="username"
            placeholder="請輸入登入帳號"
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
            required
            labelMark
          />
        </div>
        <div className="mb-3">
          <Input
            label="密碼"
            name="password"
            type="password"
            placeholder="請輸入密碼"
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
            required
            labelMark
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="success" outline={false} size="lg">
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
