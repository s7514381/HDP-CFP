"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMenu } from "@/contexts/MenuContext";
import { ListGroup, ListGroupItem } from "@packages/components/bootstrap5/ListGroup";
import FontAwesome from "@packages/components/FontAwsome";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMenuLanguageResourceSerialNumber, MenuItem } from "@/config/menus";

/** Authenticated application sidebar. */
const normalizePath = (path: string) => {
  const pathWithoutQuery = path.split(/[?#]/, 1)[0];
  return pathWithoutQuery.replace(/^\/+|\/+$/g, "") || "/";
};

const isRouteActive = (pathname: string, href: string | undefined) => {
  if (!href) return false;
  const cleanPathname = normalizePath(pathname);
  const cleanHref = normalizePath(href);
  return cleanPathname === cleanHref
    || (cleanHref !== "/" && cleanPathname.startsWith(`${cleanHref}/`));
};

const hasActiveChild = (pathname: string, menu: MenuItem): boolean =>
  menu.children?.some((child) => isRouteActive(pathname, child.href) || hasActiveChild(pathname, child)) ?? false;

const isMenuActive = (pathname: string, menu: MenuItem) =>
  isRouteActive(pathname, menu.href) || hasActiveChild(pathname, menu);

const getInUseMenuKeys = (pathname: string, menus: MenuItem[]) =>
  menus
    .filter((menu) => Boolean(menu.children?.length) && isMenuActive(pathname, menu))
    .map((menu) => menu.key);

export default function Aside() {
  const { menus } = useMenu();
  const { translate, translateByLanguageResourceId } = useLanguage();
  const getLabel = (menu: Pick<MenuItem, 'label' | 'englishCode' | 'languageResourceId'>) => {
    if (menu.languageResourceId) {
      return translateByLanguageResourceId(menu.languageResourceId) || menu.label;
    }

    const serialNumber = getMenuLanguageResourceSerialNumber(menu.englishCode);
    return serialNumber ? translate(serialNumber) : menu.label;
  };
  /** Route navigation. */
  const router = useRouter();
  /** Current route. */
  const pathname = usePathname();
  /** Sidebar visibility. */
  const [isOpen, setIsOpen] = useState(true);
  /** Expanded menu keys. In-use parents stay open when another group is expanded. */
  const [collapse, setCollapse] = useState<string[]>([]);
  const inUseMenuKeys = getInUseMenuKeys(pathname, menus);
  /** Toggle a menu item. */
  const onCollapse = (key: string) => {
    setCollapse((prev) => {
      if (prev.includes(key)) {
        return prev.filter((menuKey) => menuKey !== key);
      }

      const expandedInUseMenuKeys = prev.filter((menuKey) => inUseMenuKeys.includes(menuKey));
      return Array.from(new Set([...expandedInUseMenuKeys, key]));
    });
  };
  /** Check whether the current route belongs to a menu route. */
  const isActive = (href: string | undefined) => isRouteActive(pathname, href);

  /** Keep the in-use parent open and close other groups after the route changes. */
  useEffect(() => {
    setCollapse(getInUseMenuKeys(pathname, menus));
  }, [pathname, menus]);

  return (
    <aside className={`no-print wrap-aside ${isOpen ? "show" : ""}`}>
      <ListGroup flush={true}>
        {menus.map((menu) => (
          <ListGroupItem key={menu.key} container="li">
            {
              menu.href ? (
                // Use router navigation for Next.js routes and anchors otherwise.
                menu.isNextJsApp ? (
                <Btn color="link" onClick={() => menu.href && router.push(menu.href)} className={`${isMenuActive(pathname, menu) ? "active" : ""} aside-item`}>
                      <FontAwesome icon={menu.icon} className="me-2" /> {getLabel(menu)}
                </Btn>) : (
                <a href={menu.href} className={`${isMenuActive(pathname, menu) ? "active" : ""} aside-item`}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {getLabel(menu)}
                </a>
                )
              ) : (
                <Btn color="link" className={`aside-item d-flex align-items-center ${isMenuActive(pathname, menu) ? "active" : ""}`} onClick={() => onCollapse(menu.key)}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {getLabel(menu)}
                  <FontAwesome icon={`fa-solid fa-angle-down ${collapse.includes(menu.key) ? "fa-rotate-0" : "fa-rotate-270"}`} className="ms-auto"/>
                </Btn>
              )
            }
            {menu?.children && menu?.children?.length > 0 && (
              <ListGroup flush={true} className={`collapse ${collapse.includes(menu.key) ? "show" : ""}`}>
                {menu.children.map((item) => (
                  <ListGroupItem key={item.key} href={item.href}>
                    {item.isNextJsApp ? (
                    <Btn color="link" onClick={() => item.href && router.push(item.href)} className={`${isActive(item.href) ? "active aside-item" : "aside-item"}`}>
                      {getLabel(item)}
                    </Btn>
                    ) : (
                    <a href={item.href} className={`${isActive(item.href) ? "active aside-item" : "aside-item"}`}>
                      {getLabel(item)}
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
