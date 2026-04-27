/**
 * 所有功能的路由菜单配置
 */
export type MenuItem = {
    key: string;
    icon?: string;
    label: string;
    href?:  string;
    isNextJsApp?: boolean;
    children?: MenuItem[];
    permissions?: string[];
}
export const menus: MenuItem[] = [];
