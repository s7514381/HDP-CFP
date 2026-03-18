'use client';

import Wrap from "@packages/components/layouts/Wrap";
import { NavBar, NavBarNav, NavLink } from "@packages/components/bootstrap5/NavBar";

/**
 * 與原本供應商平台的 layout相同，但改用BS5來進行結構
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <Wrap>
      <NavBar brand="我的專案" brandHref="/" theme="dark" bg="dark" expand="lg" className="mb-4">
        <NavBarNav>
          <NavLink label="首頁" href="/" />
          <NavLink label="測試頁面" href="/test" />
          <NavLink label="CRUD 範例" href="/testCRUD" />
        </NavBarNav>
      </NavBar>
      <div className="container">
        {children}
      </div>
    </Wrap>
  );
}
