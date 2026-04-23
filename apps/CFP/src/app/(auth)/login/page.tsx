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
import { useMenu } from "@/contexts/MenuContext";
import { MenuItem } from "@/config/menus";

// 假資料：模擬未來 API 回傳的選單結構
const mockApiMenus: MenuItem[] = [
  {
      key: "Admin",
      icon: `fa-solid fa-user-group`,
      label: "系統管理",
      href: undefined,
      children:[
          {
              key: "AdminFunction",
              icon: `fa-solid fa-list-ul`,
              label: "系統功能管理",
              href: "/AdminFunction",
              isNextJsApp: true,
          },
          {
              key: "AdminMenu",
              icon: `fa-solid fa-list-ul`,
              label: "選單管理",
              href: "/AdminMenu",
              isNextJsApp: true,
          },
      ]
  },
  {
      key: "Manager",
      icon: `fa-solid fa-user-group`,
      label: "帳號管理",
      href: '/Manager',
      isNextJsApp: true,
  },
  {
      key: "BaseData",
      icon: `fa-solid fa-user-group`,
      label: "基本資料",
      href: undefined,
      children:[
          {
              key: "Supplier",
              icon: `fa-solid fa-list-ul`,
              label: "供應商管理",
              href: "/Supplier",
              isNextJsApp: true,
          },
          {
              key: "Material",
              icon: `fa-solid fa-list-ul`,
              label: "料號維護",
              href: "/Material",
              isNextJsApp: true,
          },
          {
              key: "MaterialGroup",
              icon: `fa-solid fa-list-ul`,
              label: "群組維護",
              href: "/MaterialGroup",
              isNextJsApp: true,
          }
      ]
  },
  {
      key: "Compare",
      icon: `fa-solid fa-user-group`,
      label: "對照狀態",
      href: undefined,
      children:[
          {
              key: "BuyerCompare",
              icon: `fa-solid fa-list-ul`,
              label: "買方料號對照",
              href: "/BuyerCompare",
              isNextJsApp: true,
          },
          {
              key: "SellerCompare",
              icon: `fa-solid fa-list-ul`,
              label: "賣方料號對照",
              href: "/SellerCompare",
              isNextJsApp: true,
          },
      ]
  },
  {
      key: "Notification",
      icon: `fa-solid fa-bullhorn`,
      label: "通知狀態",
      href: undefined,
      children:[
          {
              key: "MaterialNotify",
              icon: `fa-solid fa-list-ul`,
              label: "建置通知",
              href: "/MaterialNotify",
              isNextJsApp: true,
          },
          {
              key: "StatusQuery",
              icon: `fa-solid fa-list-ul`,
              label: "狀態查詢",
              href: "/StatusQuery",
              isNextJsApp: true,
          },
          {
              key: "NotifyStatusReport",
              icon: `fa-solid fa-list-ul`,
              label: "狀態報表",
              href: "/NotifyStatusReport",
              isNextJsApp: true,
          },
      ]
  },
];

export default function Login() {
  const router = useRouter();
  const { post, loading } = useApi();
  const { setUser } = useUser();
  const { setMenus } = useMenu();
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

      // 模擬從 API 取得選單：這裡先寫入靜態的假資料
      // TODO: 等後端 API 加上選單結構後，改為 setMenus(res.data.menus) 或類似的結構
      setMenus(mockApiMenus);

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
