'use client';

import Wrap from "@packages/components/layouts/Wrap";
import WrapMain from "@packages/components/layouts/WrapMain";
import Aside from "@/components/layouts/Aside";
import MainNavBar from "@/components/layouts/MainNavBar";

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
      <MainNavBar />
      <WrapMain>
        <div className="flex-grow-1 overflow-hidden d-flex flex-column order-1">
          {children}
        </div>
        <Aside />
      </WrapMain>
    </Wrap>
  );
}
