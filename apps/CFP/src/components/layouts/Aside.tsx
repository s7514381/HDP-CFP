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
export default function Aside() {
  const { menus } = useMenu();
  const { translate, translateByLanguageResourceId } = useLanguage();
  const getLabel = (menu: Pick<MenuItem, 'label' | 'englishCode' | 'languageResourceId'>) => {
    if (menu.languageResourceId) {
      return translateByLanguageResourceId(menu.languageResourceId, menu.label);
    }

    const serialNumber = getMenuLanguageResourceSerialNumber(menu.englishCode);
    return serialNumber ? translate(serialNumber, menu.label) : menu.label;
  };
  /** Route navigation. */
  const router = useRouter();
  /** Current route. */
  const pathname = usePathname();
  /** Sidebar visibility. */
  const [isOpen, setIsOpen] = useState(true);
  /** Collapsed menu items. */
  const [collapse, setCollapse] = useState<string[]>([]);
  /** Toggle a menu item. */
  const onCollapse = (key: string) => {
    if (collapse.includes(key)) {
      setCollapse(collapse.filter((k) => k !== key));
    } else {
      setCollapse([...collapse, key]);
    }
  };
  /** Check whether a child route is active. */
  const isActive = (href: string | undefined) => {
    if (!href) return false;
    /** Normalize both route values before comparing them. */
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    const cleanHref = href.replace(/^\/|\/$/g, "");
    return cleanPathname === cleanHref;
  };

  /** Expand the parent menu when its child route becomes active. */
  useEffect(() => {
    menus.forEach((menu) => {
      if (menu.children) {
        const hasActiveChild = menu.children.some((child) => isActive(child.href));
        if (hasActiveChild && !collapse.includes(menu.key)) {
          setCollapse((prev) => [...prev, menu.key]);
        }
      }
    });
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
                <Btn color="link" onClick={() => menu.href && router.push(menu.href)} className={`${pathname === menu.href ? "active" : ""} aside-item`}>
                      <FontAwesome icon={menu.icon} className="me-2" /> {getLabel(menu)}
                </Btn>) : (
                <a href={menu.href} className={`${pathname === menu.href ? "active" : ""} aside-item`}>
                  <FontAwesome icon={menu.icon} className="me-2" /> {getLabel(menu)}
                </a>
                )
              ) : (
                <Btn color="link" className={`aside-item d-flex align-items-center ${collapse.includes(menu.key) && "active"}`} onClick={() => onCollapse(menu.key)}>
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
                      <FontAwesome icon={item.icon} className="me-2" />{" "}
                      {getLabel(item)}
                    </Btn>
                    ) : (
                    <a href={item.href} className={`${isActive(item.href) ? "active aside-item" : "aside-item"}`}>
                      <FontAwesome icon={item.icon} className="me-2" />{" "}
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
