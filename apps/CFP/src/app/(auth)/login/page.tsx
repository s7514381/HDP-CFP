'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useApi } from "@packages/hooks/useApi";
import { API_MAP } from "@/lib/apiRoutes";
import { useUser } from "@/contexts/UserContext";
import { ApiError } from "@packages/components/ApiError";
import { setLocalStorage } from "@packages/lib/localstorage";
import { useToast } from '@packages/contexts/ToastContext';

export default function Login() {
  const router = useRouter();
  const { post, loading } = useApi();
  const { setUser } = useUser();
   const { success, danger } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const account = formData.get("Account") as string;
    const password = formData.get("Password") as string;

    // 根據提供之 curl 格式：/Manager/Login?Account=string&Password=string
    const url = `${API_MAP.MANAGER_LOGIN}?Account=${encodeURIComponent(account)}&Password=${encodeURIComponent(password)}`;
    
    const res = await post<string, any>(url, {});

    if (res.status === 200 && res.data) {
      // 根據範例，data 欄位即為 GUID Token
      setLocalStorage("token", res.data);
      
      // 登入成功後導向首頁 (main)
      router.push("/");
    }else{
      danger({ message: <span>{res.message}</span> });
    }
  };

  return (
    <>
      <ApiError />
      <h3 className="auth-title">登入系統</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label="帳號"
            name="Account"
            placeholder="請輸入帳號"
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="密碼"
            name="Password"
            type="password"
            placeholder="請輸入密碼"
            required
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            登入
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        <div className="mb-2">
          <Link href="/forgot-password/">忘記密碼？</Link>
        </div>
        <div>
          還沒有帳號？ <Link href="/register/">立即註冊</Link>
        </div>
      </div>
    </>
  );
}
