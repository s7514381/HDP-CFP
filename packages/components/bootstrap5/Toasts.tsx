"use client";
import { useEffect, useRef } from "react";
import FontAwesome from "../FontAwsome";
import { ToastBodyProps, ToastContainerProps, ToastHeaderProps } from "@packages/types/toast";

/**
 * Toast的容器標頭
 * @param param0
 * @returns
 */
export const ToastHeader = ({
  title,
  size = "h5",
  color = "primary",
  icon,
  onClose,
  children,
  props,
}: ToastHeaderProps) => {

  const colorClassMap: Record<string, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    success: "bg-success text-white",
    danger: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-info text-white",
    light: "bg-light text-dark",
    dark: "bg-dark text-white",
  };

  const iconMap: Record<string, string> = {
    primary: "fa-solid fa-circle-info",
    secondary: "fa-solid fa-circle-info",
    success: "fa-solid fa-circle-check",
    danger: "fa-solid fa-triangle-exclamation",
    warning: "fa-solid fa-triangle-exclamation",
    info: "fa-solid fa-circle-info",
    light: "fa-solid fa-circle-info",
    dark: "fa-solid fa-circle-info",
  };
  
  const { className, ...restProps } = props ?? {};

  const _className = [`toast-header`, size, colorClassMap[color], className]
    .filter(Boolean)
    .join(" ");

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className={_className} {...restProps}>
      {icon ? (
        <FontAwesome icon={icon} className="me-2" />
      ) : (
        <FontAwesome icon={iconMap[color]} className="me-2" />
      )}
      <strong className="me-auto">{title}</strong>
      {children}
      <button
        type="button"
        className="btn-close btn-close-white"
        data-bs-dismiss="toast"
        aria-label="Close"
        onClick={handleClose}
      ></button>
    </div>
  );
};

/**
 * Toast的容器內容
 * @param param0
 * @returns
 */
export const ToastBody = ({ children, props }: ToastBodyProps) => {
  const { className, ...restProps } = props ?? {};

  const _className = [`toast-body`, className].filter(Boolean).join(" ");

  return (
    <div className={_className} {...restProps}>
      {children}
    </div>
  );
};

/**
 * 吐司位置對應的class
 */
export const ToastPositionClasses: Record<number, string> = {
  1: "position-fixed z-index-9999 top-0 start-0 mt-3 ms-3",
  2: "position-fixed z-index-9999 top-0 start-50 translate-middle-x mt-3",
  3: "position-fixed z-index-9999 top-0 end-0 mt-3 me-3",
  4: "position-fixed z-index-9999 top-50 start-0 translate-middle-y ms-3",
  5: "position-fixed z-index-9999 top-50 start-50 translate-middle",
  6: "position-fixed z-index-9999 top-50 end-0 translate-middle-y me-3",
  7: "position-fixed z-index-9999 bottom-0 start-0 mb-3 ms-3",
  8: "position-fixed z-index-9999 bottom-0 start-50 translate-middle-x mb-3",
  9: "position-fixed z-index-9999 bottom-0 end-0 mb-3 me-3",
  0: "",
};

/**
 * Toast的容器
 * @param param0
 * @returns
 */
export const Toast: React.FC<ToastContainerProps> = ({
  active = true,
  position = 1,
  color = "primary",
  title,
  disabledHeader = false,
  headerOptions,
  bodyOptions,
  autoHide = true,
  delay = 1000,
  children,
  props,
  onClose,
}: ToastContainerProps) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const { className, ...restProps } = props ?? {};

  const _className = [
    "toast",
    active ? "show" : null,
    ToastPositionClasses[position],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /** 關閉Toast */
  const handleClose = () => {
    onClose?.();
    if (timeRef.current) {
      clearTimeout(timeRef.current);
      timeRef.current = null;
    }
    if (toastRef?.current) {
      toastRef.current.classList.remove("show");
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.remove();
        }
      }, 2000);
    }
  };

  useEffect(() => {
    /** 清除計時器 */
    const handleClearTimeout = () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        timeRef.current = null;
      }
    };

    /** 設定自動關閉的計時器 */
    const handleAutoClose = () => {
      timeRef.current = setTimeout(() => {
        if (toastRef.current) {
          handleClose();
        }
      }, delay);
    };

    if (active) {
      // 判斷是否有舊的計時器，有的話先清除
      handleClearTimeout();
      // 如果有設定自動關閉，則啟動計時器
      if (autoHide) {
        handleAutoClose();
      }
    }
    /** 清除計時器 */
    return () => {
      handleClearTimeout();
    };
  }, [active, autoHide, delay]);

  return (
    <div ref={toastRef} className={_className} {...restProps}>
      {!disabledHeader && (
        <ToastHeader
          title={title}
          color={color}
          {...headerOptions}
          onClose={handleClose}
        />
      )}
      {disabledHeader ? (
        <div className="d-flex">
          <ToastBody props={bodyOptions ? { ...bodyOptions.props } : {}}>
            {children}
          </ToastBody>
          <button
            type="button"
            className="btn-close btn-close-white me-2"
            data-bs-dismiss="toast"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        </div>
      ) : (
        <ToastBody props={bodyOptions ? { ...bodyOptions.props } : {}}>
          {children}
        </ToastBody>
      )}
    </div>
  );
};
