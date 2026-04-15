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
}
export const menus: MenuItem[] = [
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
                key: "QueryNotification",
                icon: `fa-solid fa-list-ul`,
                label: "狀態查詢",
                href: "/QueryNotification",
                isNextJsApp: true,
            },
            {
                key: "NotificationReport",
                icon: `fa-solid fa-list-ul`,
                label: "狀態報表",
                href: "/NotificationReport",
                isNextJsApp: true,
            },
        ]
    },
];
