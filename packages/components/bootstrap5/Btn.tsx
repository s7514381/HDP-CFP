'use client';
import React from 'react';
import FontAwesome from '../FontAwsome';

export type BtnProps = {
    children?: React.ReactNode;
    icon?: 'edit' | 'delete' | 'add' | 'square-add' | 'save' | 'cancel' | 'search' | 'download' | 'file' | 'file-code' | 'file-download' | 'file-export' | 'file-csv' | 'file-excel' | 'upload' | 'file-upload' | 'file-import' | 'check' | 'sort-down' | 'barcode' | 'logout' | 'bar' | 'xmark' | 'tag' | 'print';
    iconClassName?: string;
    color?: 
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'light'
        | 'dark'
        | 'link';
    outline?: boolean;
    rounded?: boolean;
    size?: 'sm' | 'lg' | 'ssm';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    apiStatus?: string | null;
    loading?: string | boolean | null;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    [key: string]: unknown;
};

/**
 * 一個以 Bootstrap 樣式為基礎的 React 按鈕元件。
 * 會根據傳入的 props 渲染帶有 Bootstrap 樣式的 `<button>` 元素。
 *
 * @param children - 按鈕內要顯示的內容。
 * @param color - 按鈕的 Bootstrap 顏色樣式，預設為 `'primary'`。
 * @param outline - 若為 `true`，則使用 outline 樣式。
 * @param size - 按鈕大小，可選 `'sm'`（小）、`'lg'`（大）或 `'ssm'`（超小）。
 * @param disabled - 若為 `true`，按鈕會被禁用。
 * @param type - 按鈕的 type 屬性，預設為 `'button'`。
 * @param className - 額外自訂的 class 名稱。
 * @param apiStatus - 呼叫API時的狀態
 * @param onClick - 按鈕的點擊事件處理函式。
 *
 * @example
 * ```tsx
 * <Btn color="success" size="lg" onClick={() => alert('Clicked!')}>
 *   Submit
 * </Btn>
 * ```
 */
export const Btn: React.FC<BtnProps> = ({
    children,
    icon,
    iconClassName,
    color = 'primary',
    outline = true,
    rounded = false,
    size,
    disabled = false,
    type = 'button',
    className,
    apiStatus,
    onClick,
    loading, // 這裡將傳入的 loading 取得
    ...props
}: BtnProps) => {
    const btnClass = [
        'btn',
        outline ? `btn-outline-${color}` : `btn-${color}`,
        size ? `btn-${size}` : null,
        rounded ? 'rounded-0' : null,
        className,
    ]
    .filter(Boolean)
    .join(' ');

    const _apiStatus = (apiStatus || (loading === 'loading' ? 'loading' : (loading === true ? 'loading' : null))) as string | null;

    return (
        <button
            type={type}
            className={btnClass}
            disabled={_apiStatus === 'loading' || disabled}
            onClick={onClick}
            {...(props as any)}
        >
            {_apiStatus === 'loading' && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {icon && _apiStatus !== 'loading' && <Icon name={icon} className={iconClassName} />} {children}
        </button>
    );
};

export const Icon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case 'edit':
            return <FontAwesome icon={`fa-solid fa-pencil ${className}`} />;
        case 'delete':
            return  <FontAwesome icon={`fa-solid fa-trash-can ${className}`} />;
        case 'add':
            return <FontAwesome icon={`fa-solid fa-plus ${className}`} />;
        case 'square-add':
            return <FontAwesome icon={`fa-solid fa-square-plus ${className}`} />;
        case 'save':
            return <FontAwesome icon={`fa-solid fa-download ${className}`} />;
        case 'cancel':
            return <FontAwesome icon={`fa-solid fa-repeat ${className}`} />;
        case 'search':
            return <FontAwesome icon={`fa-solid fa-magnifying-glass ${className}`} />;
        case 'download':
        case 'file':
            return <FontAwesome icon={`fa-solid fa-file ${className}`} />;
        case 'file-code':
            return <FontAwesome icon={`fa-solid fa-file-code ${className}`} />;
        case 'file-download':
            return <FontAwesome icon={`fa-solid fa-file-arrow-down ${className}`} />;
        case 'file-export':
            return <FontAwesome icon={`fa-solid fa-file-export ${className}`} />;
        case 'file-csv':
            return <FontAwesome icon={`fa-solid fa-file-csv ${className}`} />;
        case 'file-excel':
            return <FontAwesome icon={`fa-solid fa-file-excel ${className}`} />;
        case 'upload':
        case 'file-upload':
            return <FontAwesome icon={`fa-solid fa-file-arrow-up ${className}`} />;
        case 'file-import':
            return <FontAwesome icon={`fa-solid fa-file-import ${className}`} />;
        case 'check':
            return <FontAwesome icon={`fa-solid fa-check ${className}`} />;
        case 'sort-down':
            return <FontAwesome icon={`fa-solid fa-angle-down ${className}`} />;
        case 'barcode':
            return <FontAwesome icon={`fa-solid fa-barcode ${className}`} />;
        case 'logout':
            return <FontAwesome icon={`fa-solid fa-arrow-right-from-bracket ${className}`} />;
        case 'bar':
            return <FontAwesome icon={`fa-solid fa-bars-staggered ${className}`} />;
        case 'xmark':
            return <FontAwesome icon={`fa-solid fa-xmark ${className}`} />;
        case 'tag':
            return <FontAwesome icon={`fa-solid fa-tag ${className}`} />;   
        case 'print':
            return <FontAwesome icon={`fa-solid fa-print ${className}`} />;
        default:
            return null;
    }
}