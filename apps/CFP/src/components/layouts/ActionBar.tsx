"use client";
import Container from "@packages/components/bootstrap5/Container";
import { usePathname } from "next/navigation";
import { getMenuLanguageResourceSerialNumber, MenuItem } from "@/config/menus";
import { useMenu } from "@/contexts/MenuContext";
import { useLanguage } from "@/contexts/LanguageContext";

type ActionBarProps = {
    readonly title?: string;
    readonly children?: React.ReactNode;
}

/** Find a menu title by route. */
const findMenuItem = (pathname: string, items: MenuItem[]): MenuItem | undefined => {
  for (const item of items) {
    // Normalize paths before comparing them.
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    const cleanHref = item.href?.replace(/^\/|\/$/g, "");

    if (cleanHref && cleanPathname === cleanHref) {
      return item;
    }

    // Search child menus recursively.
    if (item.children) {
      const found = findMenuItem(pathname, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

/** Page action bar with optional actions. */
export default function ActionBar({title, children}: ActionBarProps) {
  const pathname = usePathname();
  const { menus } = useMenu();
  const { translate, translateByLanguageResourceId } = useLanguage();

  const getMenuLabel = (menuItem?: MenuItem) => {
    if (!menuItem) return undefined;
    if (menuItem.languageResourceId) {
      return translateByLanguageResourceId(menuItem.languageResourceId) || menuItem.label;
    }

    const serialNumber = getMenuLanguageResourceSerialNumber(menuItem.englishCode);
    return serialNumber ? translate(serialNumber) : menuItem.label;
  };

  // Prefer an explicit title and otherwise resolve the route title.
  const menuItem = title ? undefined : findMenuItem(pathname, menus);
  const displayTitle = title
    ? (/^[A-Z]{2}\d{4}$/.test(title) ? translate(title) : title)
    : getMenuLabel(menuItem);

  return (
    <Container className="action-bar no-print" fluid>
        <p className="action-bar-title">{displayTitle}</p>
        {children}
    </Container>
  );
}
