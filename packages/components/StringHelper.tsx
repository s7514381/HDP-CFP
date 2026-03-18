/**
 * 文字類型的輔助工具
 */

import React from "react";
import FontAwesome from "./FontAwsome";

/**
 * 沒資料時的佔位符
 */
interface FormatStringProps {
  value: string | null | undefined;
  options?: {
    // 佔位符預設為 --
    placeholder?: string;
    /** 是否要在無值時顯示紅色字體 */
    highlightNoValue?: boolean;
  }
};

export const FormatString = ({
  value,
  options = {
    placeholder: "--",
    highlightNoValue: false,
  }
}: FormatStringProps) => {
  if(value === undefined || value === null || value === ''){
    return (
      <span className={options.highlightNoValue ? "text-danger" : undefined}>
        {options.placeholder}
      </span>
    );
  }
  return value;
}

/**
 * 提供狀態轉圖標的元件
 */
interface StatusIconOptions {
  /** 狀態值 */
  status: string | number;
  /** 要顯示的文字 */
  text?: string;
}

export const StatusIcon = ({ status, text }: StatusIconOptions) => {
  switch(status){
    case 'A':
    case 1:
      return (
        <span className="text-success" title={text || "啟用"}>
          <FontAwesome icon="fa-solid fa-circle-check" />
          {text && <span className="ms-2">{text}</span>}
        </span>
      );
    case 'X':
    case 0:
      return (
        <span className="text-danger" title={text || "停用"}>
          <FontAwesome icon="fa-solid fa-circle-xmark" />
          {text && <span className="ms-2">{text}</span>}
        </span>
      );
    default:
      return null;
  }
}
/**
 * 單據狀態
 */
export const OrderStatus = ({status, text}: StatusIconOptions) => {
  switch(status){
    case 1:
      return (
        <span className="text-success" title={text || "已點收"}>
          <FontAwesome icon="fa-solid fa-circle-check" />
          {<small className="ms-2">{text || "已點收"}</small>}
        </span>
      );
    case 0:
      return (
        <span className="text-secondary" title={text || "取消"}>
          <FontAwesome icon="fa-solid fa-circle-xmark" />
          {<small className="ms-2">{text || "已取消"}</small>}
        </span>
      );
    case 9:
      return (
        <span className="text-warning-ahop" title={text || "未處理"}>
          <FontAwesome icon="fa-solid fa-envelope" />
          {<small className="ms-2">{text || "未處理"}</small>}
        </span>
      );
    case 8:
      return (
        <span className="text-primary" title={text || "已讀取"}>
          <FontAwesome icon="fa-solid fa-envelope-open" />
          {<small className="ms-2">{text || "已讀取"}</small>}
        </span>
      );
    default:
      return null;
  }
}

const StringHelper = {
  FormatString,
  StatusIcon,
  OrderStatus
};

export default StringHelper;