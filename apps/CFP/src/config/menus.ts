/**
 * 所有功能的路由菜单配置
 */
export type MenuItem = {
    key: string;
    icon?: string;
    label: string;
    englishCode?: string;
    languageResourceId?: string;
    href?:  string;
    isNextJsApp?: boolean;
    children?: MenuItem[];
    permissions?: string[];
}

const MENU_LANGUAGE_RESOURCE_SERIAL_NUMBERS: Record<string, string> = {
    SY: 'SY0001',
    AF: 'AF0009',
    AM: 'AM0008',
    AC: 'AC0001',
    MN: 'MN0012',
    RL: 'RL0006',
    BI: 'BI0001',
    SP: 'SP0002',
    MT: 'MT0009',
    GR: 'GR0006',
    CP: 'CP0001',
    BC: 'BC0010',
    SC: 'SC0006',
    NT: 'NT0008',
    NF: 'NF0001',
    ST: 'ST0004',
    NR: 'NR0005',
    CM: 'CM0115',
    CF: 'CF0001',
    PC: 'PC0001',
    DM: 'PP0007',
};

export const getMenuLanguageResourceSerialNumber = (englishCode?: string) => {
    if (!englishCode) return undefined;
    return MENU_LANGUAGE_RESOURCE_SERIAL_NUMBERS[englishCode.trim().toUpperCase()];
};

export const menus: MenuItem[] = [];
