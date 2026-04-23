"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMenu } from "@/contexts/MenuContext";
import { ListGroup, ListGroupItem } from "@packages/components/bootstrap5/ListGroup";
import FontAwesome from "@packages/components/FontAwsome";
import { Btn } from "@packages/components/bootstrap5/Btn";

/**
 * 需要身份驗證授權的側邊欄
 * @param param0
 * @returns
 */
export default function Aside() {
  const { menus } = useMenu();
  /** 路由導向 */
  const router = useRouter();
  /** 當前網頁路徑 */
  const pathname = usePathname();
  /** 開啟關閉整個側邊欄 */
  const [isOpen, setIsOpen] = useState(true);
  /** 折疊選單項目 */
  const [collapse, setCollapse] = useState<string[]>([]);
  /** 處理折疊選單 */
  const onCollapse = (key: string) => {
    if (collapse.includes(key)) {
      setCollapse(collapse.filter((k) => k !== key));
    } else {
      setCollapse([...collapse, key]);
    }
  };
  /** 判斷子選單是否為目前路徑 */
  const isActive = (href: string | undefined, parentKey: string) => {
    /** 將pathname與href的前後斜線都先拿掉後再進行比對 */
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    const cleanHref = href?.replace(/^\/|\/$/g, "");
    const isActive = cleanPathname === cleanHref;
    if (isActive && !collapse.includes(parentKey)) {
      onCollapse(parentKey);
    }
    return isActive;
  };

  return (
    <aside className={`no-print wrap-aside ${isOpen ? "show" : ""}`}>
      <ListGroup flush={true}>
        {menus.map((menu) => (
          <ListGroupItem key={menu.key} container="li">
            {
              /** 判斷使用連結還是按鈕 */
              menu.href ? (
                // 如果是next js app使用router.push元件，反之使用a標籤讓功能可以導回傳統頁面
                menu.isNextJsApp ? (
                <Btn color="link" onClick={() => router.push(menu.href as string)} className={`${pathname === menu.href ? "active" : ""} aside-item`}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {menu.label}
                </Btn>) : (
                <a href={menu.href} className={`${pathname === menu.href ? "active" : ""} aside-item`}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {menu.label}
                </a>
                )
              ) : (
                <Btn color="link" className={`aside-item d-flex align-items-center ${collapse.includes(menu.key) && "active"}`} onClick={() => onCollapse(menu.key)}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {menu.label}
                  <FontAwesome icon={`fa-solid fa-angle-down ${collapse.includes(menu.key) ? "fa-rotate-0" : "fa-rotate-270"}`} className="ms-auto"/>
                </Btn>
              )
            }
            {menu?.children && menu?.children?.length > 0 && (
              <ListGroup flush={true} className={`collapse ${collapse.includes(menu.key) ? "show" : ""}`}>
                {menu.children.map((item) => (
                  <ListGroupItem key={item.key} href={item.href}>
                    {/* 如果是next js app使用router.push，反之使用a標籤讓功能可以導回傳統頁面 */}
                    {item.isNextJsApp ? (
                    <Btn color="link" onClick={() => router.push(item.href as string)} className={`${isActive(item.href as string, menu.key) ? "active aside-item" : "aside-item"}`}>
                      <FontAwesome icon={item.icon} className="me-2" />{" "}
                      {item.label}
                    </Btn>
                    ) : (
                    <a href={item.href} className={`${isActive(item.href as string, menu.key) ? "active aside-item" : "aside-item"}`}>
                      <FontAwesome icon={item.icon} className="me-2" />{" "}
                      {item.label}
                    </a>
                    )}
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </ListGroupItem>
        ))}
      </ListGroup>
      <Btn className="side-btn" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesome icon="fa-solid fa-caret-left" />
      </Btn>
    </aside>
  );
}
