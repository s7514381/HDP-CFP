'use client';

import React, { useState } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";
import FontAwesome from "@packages/components/FontAwsome";
import LanguageSelectorModal from "@/components/layouts/LanguageSelectorModal";

export default function Login() {
  const router = useRouter();
  const { post, loading } = useApi();
  const { setUser } = useUser();
  const { setMenus } = useMenu();
  const { success, danger } = useToast();
  const { languageCode, translate } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const mapAdminMenuToMenuItem = (menu: any): MenuItem => {
    const toPermission = (func: any) => {
      if (!func?.action) return [];
      const scopedPermission = func.controller
        ? `${func.controller}:${func.action}`
        : undefined;
      return [func.action, scopedPermission].filter(Boolean);
    };

    const permissions = [
      ...toPermission(menu.adminFunction),
      ...(menu.adminFunction?.childList?.flatMap(toPermission) || [])
    ];

    return {
      key: menu.id,
      label: menu.title || "",
      englishCode: menu.englishCode || undefined,
      languageResourceId: menu.languageResourceId || undefined,
      icon: menu.iconClass || undefined,
      href: menu?.adminFunction ? `/${menu?.adminFunction?.controller}` : undefined,
      isNextJsApp: true,
      permissions: permissions,
      children: menu.childList && menu.childList.length > 0
        ? menu.childList.map(mapAdminMenuToMenuItem)
        : undefined
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const account = formData.get("Account") as string;
    const password = formData.get("Password") as string;

    // 根據提供之 curl 格式：/Manager/Login?Account=string&Password=string
    const url = `${API_MAP.MANAGER_LOGIN}?Account=${encodeURIComponent(account)}&Password=${encodeURIComponent(password)}`;

    // 現在 API 回傳 LoginInfoModel { Token: Guid, AdminMenus: List<FullAdminMenuModel> }
    const res = await post<any, any>(url, {});

    if (res.status === 200 && res.data) {
      const { token, name, adminMenus } = res.data;

      if (token) {
        setLocalStorage("token", token);
      }

      setUser({ username: name || account });

      if (adminMenus && Array.isArray(adminMenus)) {
        const mappedMenus = adminMenus.map(mapAdminMenuToMenuItem);
        setMenus(mappedMenus);
      }

      // 登入成功後導向首頁 (main)
      router.push("/");
    }else{
      danger({ message: <span>{res.message}</span> });
    }
  };

  return (
    <>
      <ApiError />
      <button
        type="button"
        className="auth-language-trigger btn btn-outline-primary btn-sm"
        aria-label={translate(LANGUAGE_KEYS.common.language, '切換語言')}
        title={translate(LANGUAGE_KEYS.common.language, '切換語言')}
        onClick={() => setShowLanguageSelector(true)}
      >
        <FontAwesome icon="fa-solid fa-language" className="me-1" />
        {languageCode}
      </button>
      <h3 className="auth-title">{translate(LANGUAGE_KEYS.auth.loginSystem, '登入系統')}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.auth.account, '帳號')}
            name="Account"
            placeholder={translate(LANGUAGE_KEYS.auth.accountPlaceholder, '請輸入帳號')}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label={translate(LANGUAGE_KEYS.auth.password, '密碼')}
            name="Password"
            type="password"
            placeholder={translate(LANGUAGE_KEYS.auth.passwordPlaceholder, '請輸入密碼')}
            required
          />
        </div>
        <div className="d-grid gap-2">
          <Btn type="submit" color="primary" outline={false} size="lg" loading={loading === 'loading'}>
            {translate(LANGUAGE_KEYS.auth.login, '登入')}
          </Btn>
        </div>
      </form>
      <div className="auth-footer">
        <div className="mb-2">
          <Link href="/forgot-password/">{translate(LANGUAGE_KEYS.auth.forgotPassword, '忘記密碼？')}</Link>
        </div>
        <div>
          {translate(LANGUAGE_KEYS.auth.noAccount, '還沒有帳號？')} <Link href="/register/">{translate(LANGUAGE_KEYS.auth.registerNow, '立即註冊')}</Link>
        </div>
      </div>
      <LanguageSelectorModal show={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
    </>
  );
}
