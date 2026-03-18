/**
 * 內容區塊使用的工具列，包含麵包屑導航與操作按鈕
 */

/**
 * 定義麵包屑的屬性
 */
export type BreadcrumbItem = {
    label: string; // 顯示的標籤
    href?: string; // 可選的連結
    className?: string; // 額外的 CSS 類別名稱
    children?: React.ReactNode; // 其他子元素
}

/**
 * 麵包屑容器的屬性
 */
export type Breadcrumb = {
    className?: string; // 額外的 CSS 類別名稱
    items: BreadcrumbItem[]; // 麵包屑項目陣列
    children?: React.ReactNode; // 其他子元素
};