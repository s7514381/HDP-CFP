/**
 * Toast types
 */

/**
 * BS5 Toast 位置
 */
export type ToastPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/**
 * BS5 Toast 顏色
 */
export type ToastColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
/**
 * Toast Context 全域上下文的配置
 */
export type ToastOptions = {
  title?: string;
  message: React.ReactNode;
  autoHide?: boolean;
  delay?: number;
  onClose?: () => void;
}
/**
 * Toast Context 全域上下文提供的快速方法
 */
export type ToastContextType = {
  success: (options: ToastOptions, position?: ToastPosition) => void;
  danger: (options: ToastOptions, position?: ToastPosition) => void;
  warning: (options: ToastOptions, position?: ToastPosition) => void;
  info: (options: ToastOptions, position?: ToastPosition) => void;
  primary: (options: ToastOptions, position?: ToastPosition) => void;
  secondary: (options: ToastOptions, position?: ToastPosition) => void;
}
/**
 * Toast Context 中要加入佇列的Toast項目
 */
export type ToastItem = ToastOptions & {
  id: string;
  type: ToastColor;
  position: ToastPosition;
};
/**
 * Toast Header屬性
 */
export interface ToastHeaderProps {
    title?: string;
    size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    color?: ToastColor;
    icon?: string;
    onClose?: () => void;
    children?: React.ReactNode;
    props?: React.HTMLAttributes<HTMLDivElement>;
}
/**
 * Toast Body屬性
 */
export interface ToastBodyProps {
    children?: React.ReactNode;
    props?: React.HTMLAttributes<HTMLDivElement>;
}
/**
 * Toast 單獨調用時的屬性配置
 */
export interface ToastContainerProps {
    active?: boolean;
    position?: ToastPosition | 0;
    color?: ToastColor;
    title?: string;
    disabledHeader?: boolean;
    headerOptions?: ToastHeaderProps;
    bodyOptions?: ToastBodyProps;
    autoHide?: boolean;
    delay?: number;
    children: React.ReactNode;
    props?: React.HTMLAttributes<HTMLDivElement>;
    onClose?: () => void;
}