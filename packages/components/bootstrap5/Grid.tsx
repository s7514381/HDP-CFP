import React, { ReactNode } from "react";
/**
 * Bootstrap 5 響應式網格系統元件
 */
type Breakpoint = "sm" | "md" | "lg" | "xl" | "xxl";
const breakpoints: Breakpoint[] = ["sm", "md", "lg", "xl", "xxl"];
type ColSize = number | "auto" | boolean;

type RowProps = {
    children?: ReactNode;
    className?: string;
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    align?: "start" | "center" | "end" | "stretch";
    // gutter: 0-5
    gutter?: number;
    [key: string]: unknown;
};

type ColProps = {
    children?: ReactNode;
    // e.g. col={6}, col="auto", col={true}
    col?: ColSize;
    // e.g. sm={6}, md="auto"
    [key: string]: unknown;
    className?: string;
};


// 簡易版 clsx 實作
function simpleClsx(...args: unknown[]) {
    // 用於除錯，查看傳入的參數
    const str = args
        .filter(Boolean)
        .join(" ");
    return str;
}
/**
 * 根據傳入的 ColProps 產生對應的 Bootstrap col 樣式類別陣列。
 *
 * @param props - 欲轉換為 Bootstrap col 類別的屬性物件。
 * @returns 一個包含所有對應 Bootstrap col 類別名稱的字串陣列。
 *
 * @example
 * // 基本 col
 * getColClasses({ col: true }); // 回傳: ['col']
 *
 * // 指定寬度
 * getColClasses({ col: 6 }); // 回傳: ['col-6']
 *
 * // 自動寬度
 * getColClasses({ col: 'auto' }); // 回傳: ['col-auto']
 *
 * // 指定斷點
 * getColClasses({ md: 4 }); // 回傳: ['col-md-4']
 *
 * // 多個屬性組合
 * getColClasses({ col: true, sm: 6, md: 'auto' }); // 回傳: ['col', 'col-sm-6', 'col-md-auto']
 */
function getColClasses(props: ColProps) {
    const classes: string[] = [];

    // Handle generic col
    if (props.col !== undefined) {
        if (props.col === true) classes.push("col");
        else if (props.col === "auto") classes.push("col-auto");
        else if (typeof props.col === "number") classes.push(`col-${props.col}`);
    }

    // Handle breakpoint-specific
    breakpoints.forEach(bp => {
        if (props[bp] !== undefined) {
            if (props[bp] === true) classes.push(`col-${bp}`);
            else if (props[bp] === "auto") classes.push(`col-${bp}-auto`);
            else if (typeof props[bp] === "number") classes.push(`col-${bp}-${props[bp]}`);
        }
    });

    return classes;
}
/**
 * Col 元件，對應 Bootstrap 的 col 樣式。
 *
 * @param props - ColProps 參數，支援 col、sm、md、lg、xl、xxl、className 等屬性。
 *
 * @remarks
 * - `col`：設定欄位寬度（數字、"auto"、true）。
 * - `sm`、`md`、`lg`、`xl`、`xxl`：設定不同斷點下的欄位寬度。
 *
 * @example
 * ```tsx
 * <Grid.Col col={6}>一半寬度</Grid.Col>
 * <Grid.Col md={4} lg="auto">響應式欄位</Grid.Col>
 * ```
 */
const Col: React.FC<ColProps> = ({ children, className, ...rest }) => {
    const colClasses = getColClasses(rest);
    const classes = simpleClsx(...colClasses, className);
    return (
        <div className={classes}>
            {children}
        </div>
    );
};

/**
 * Row 元件，對應 Bootstrap 的 row 樣式。
 *
 * @param props - RowProps 參數，支援 children、className、justify、align、gutter 等屬性。
 *
 * @remarks
 * - `justify`：設定主軸對齊方式（start、center、end、between、around、evenly）。
 * - `align`：設定交叉軸對齊方式（start、center、end、stretch）。
 * - `gutter`：設定欄位間距（0-5）。
 *
 * @example
 * ```tsx
 * <Grid.Row justify="center" align="center" gutter={2}>
 *   <Grid.Col col={4}>內容</Grid.Col>
 *   <Grid.Col col={8}>內容</Grid.Col>
 * </Grid.Row>
 * ```
 */
const Row: React.FC<RowProps> = ({
    children,
    className,
    justify,
    align,
    gutter,
    ...rest
}) => {
    const classes = simpleClsx(
        "row",
        justify && `justify-content-${justify}`,
        align && `align-items-${align}`,
        gutter !== undefined && `g-${gutter}`,
        className
    );
    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
};
/**
 * Grid 元件集合，封裝 Bootstrap 的 Row 與 Col 元件，方便在 React 專案中以組件化方式使用 Bootstrap 的響應式網格系統。
 *
 * @remarks
 * 提供 `Grid.Row` 與 `Grid.Col` 兩個元件，分別對應 Bootstrap 的 row 與 col 樣式，支援響應式斷點、對齊、間距等常用屬性。
 *
 * @example
 * ```tsx
 * <Grid.Row gutter={3} justify="center" align="center">
 *   <Grid.Col col={6}>左側內容</Grid.Col>
 *   <Grid.Col col={6}>右側內容</Grid.Col>
 * </Grid.Row>
 * ```
 */
export const Grid = {
    Row,
    Col,
};

export default Grid;
