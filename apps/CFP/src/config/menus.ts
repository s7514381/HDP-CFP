/**
 * 所有功能的路由菜单配置
 */
type MenuItem = {
    key: string;
    icon?: string;
    label: string;
    href?:  string;
    isNextJsApp?: boolean;
    children?: MenuItem[];
}
export const menus: MenuItem[] = [
    {
        key: "CRITM",
        icon: `fa-regular fa-file-lines`,
        label: "主檔維護",
        href: undefined,
        children:[
            {
                key: "CRITM_LIST",
                icon: `fa-solid fa-list-ul`,
                label: "主檔列表",
                href: "/cr-itm/index",
            },
            {
                key: "CRITM_BOM",
                icon: `fa-solid fa-cubes`,
                label: "組件列表",
                href: "/cr-itm-bom/index",
            },
            {
                key: "CRITM_FDA",
                icon: `fa-solid fa-receipt`,
                label: "多證管理",
                href: "/CrItm/multiple-licenses/index",
            },
            {
                key: "CRITM_ACSY",
                icon: `fa-solid fa-boxes-stacked`,
                label: "配件管理",
                href: "/Acsy/default/index",
            }
        ]
    },
    {
        key: "CRITM_MAP",
        icon: `fa-solid fa-arrow-right-arrow-left`,
        label: "規格對照",
        href: undefined,
        children:[
            {
                key: "CRITM_MAP_CTRL",
                icon: `fa-solid fa-list-ul`,
                label: "對應管理",
                href: "/cr-itm-map/relation-list",
            },
            {
                key: "CRITM_MAP_QUERY",
                icon: `fa-solid fa-list-ul`,
                label: "對照查詢",
                href: "/formatControl/default/index",
            },
            {
                key: "BARCODE_VERIFY",
                icon: `fa-solid fa-barcode`,
                label: "條碼驗證",
                href: "/CrItm/multiple-licenses/index",
            },
            {
                key: "SEARCH_MID",
                icon: `fa-solid fa-magnifying-glass`,
                label: "搜尋院內碼",
                href: "/WmMid/default/index",
            }
        ]
    },
    {
        key: "CRITM_MAP_ERR",
        icon: `fa-solid fa-arrow-right-arrow-left`,
        label: "對照後異常資訊",
        href: undefined,
        children:[
            {
                key: "CRITM_MAP_FDA_ERR",
                icon: `fa-solid fa-hospital`,
                label: "主檔資料與醫院",
                href: "/cr-itm-map/relation-list",
            },
            {
                key: "CRITM_MAP_OPENDATA_ERR",
                icon: `fa-solid fa-globe`,
                label: "持證資料與政府",
                href: "/formatControl/default/index",
            }
        ]
    },
    {
        key: "SC_PRO",
        icon: `fa-solid fa-truck`,
        label: "出貨作業",
        href: undefined,
        children:[
            {
                key: "SC_PRO_LIST",
                icon: `fa-solid fa-list-ol`,
                label: "需求單列表",
                href: "/wm-demand-dtl/index",
            },
            {
                key: "SC_PRO_CREATE",
                icon: `fa-regular fa-clipboard`,
                label: "建立出貨單",
                href: "/cr-sc-pro/index",
            },
            {
                key: "SC_PRO_DETAILS",
                icon: `fa-solid fa-clipboard-list`,
                label: "出貨單列表",
                href: "/cr-sc-pro/cr-sc-pro-list",
            },
            {
                key: "SC_PRO_PAY",
                icon: `fa-regular fa-credit-card`,
                label: "付款進度查詢",
                href: "/wm-pay/index",
            }
        ]
    },
    {
        key: "TRN_LOG",
        icon: `fa-solid fa-boxes-stacked`,
        label: "庫存異動",
        href: undefined,
        children:[
            {
                key: "TRN_LOG_DAY",
                icon: `fa-solid fa-calendar-days`,
                label: "每日庫存列表",
                href: "/cr-loc-inv/index",
            }
        ]
    },
    {
        key: "TRN_LOG_DUI",
        icon: `fa-solid fa-chart-column`,
        label: "寄售耗用資料",
        href: undefined,
        children:[
            {
                key: "TRN_LOG_DUI_MONTHLY",
                icon: `fa-brands fa-searchengin`,
                label: "每月耗用資料",
                href: "/wm-trn-log/index",
            },
            {
                key: "TRN_LOG_DUI_HISTORY",
                icon: `fa-solid fa-file-arrow-down`,
                label: "歷史耗用紀錄",
                href: "/wm-trn-log/index",
            },
            {
                key: "TRN_LOG_DUI_SOA",
                icon: `fa-solid fa-print`,
                label: "列印對帳單",
                href: "/WmTrnLogSoa/default/index",
            }
        ]
    },
    {
        key: "QSDN",
        icon: `fa-solid fa-bullhorn`,
        label: "持證到期通知",
        href: "/itemsExpDate/default/index",
        children:[]
    },
    {
        key: "PRINT_OPS",
        icon: `fa-solid fa-print`,
        label: "列印作業",
        href: undefined,
        children:[
            {
                key: "PRINT_OPS_QRCODE",
                icon: `fa-solid fa-qrcode`,
                label: "列印流通碼",
                href: "/print/index",
            }
        ]
    },
    {
        key: "HMPY_CONTACT",
        icon: `fa-solid fa-user-group`,
        label: "醫院聯絡項目",
        href: undefined,
        children:[
            {
                key: "HMPY_CONTACT_PERSON",
                icon: `fa-regular fa-address-card`,
                label: "對醫院聯絡人",
                href: "/HmpyContactInfo/hmpy-win/index",
            },
            {
                key: "HMPY_CONTACT_NOTICE",
                icon: `fa-regular fa-clipboard`,
                label: "醫院聯絡事項",
                href: "/HmpyContactInfo/hmpy-notice/index",
            }
        ]
    },
    {
        key: "NTPF",
        icon: `fa-solid fa-bullhorn`,
        label: "推播訊息管理",
        href: "/ntpf/default/index",
        children:[]
    },
    {
        key: "IAS",
        icon: `fa-solid fa-boxes-stacked`,
        label: "庫存輔助管理",
        href: undefined,
        isNextJsApp: true,
        children:[
            {
                key: "SI_MGT",
                icon: `fa-solid fa-scissors`,
                label: "器械維護",
                href: "/si-mgt",
            },
            {
                key: "PKG_MGT",
                icon: `fa-solid fa-suitcase`,
                label: "盤包維護",
                href: "/pkg-mgt",
            },
            {
                key: "EQP_MGT",
                icon: `fa-solid fa-toolbox`,
                label: "設備維護",
                href: "/eqp-mgt",
            },
            {
                key: "MSG_MGT",
                icon: `fa-solid fa-comment-dots`,
                label: "訊息維護",
                href: "/msg-mgt",
            },
            {
                key: "APY_ORD",
                icon: `fa-solid fa-clipboard-list`,
                label: "申領單管理",
                href: "/apy-ord",
            },
        ]
    },
    {
        key: "FDA-TRACE",
        icon: `fa-solid fa-arrows-turn-to-dots`,
        label: "來源流向追蹤",
        href: "/fda-trace",
        isNextJsApp: true,
        children:[]
    },
    
];
