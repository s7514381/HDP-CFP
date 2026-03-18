import { TableProps, TDProps, THeadProps, THProps, TRProps } from "@packages/types/bootstrap5";
import { HTMLAttributes } from "react";

/**
 * @description 基礎高彈性表格元件 (<table> Wrapper)。
 * 此元件作為 Bootstrap 5 表格的容器，負責套用核心樣式和響應式外殼。
 * @param {TableProps} props - 元件屬性
 */
export const Table: React.FC<TableProps> = ({
  children, 
  className = '', 
  responsive = true,
  responsiveProps,
  striped,
  stripedColumns,
  bordered,
  borderless,
  hover,
  small,
  caption,
  captionTop,
  ...rest 
}: TableProps) => {
  // 基礎的 Bootstrap 表格 class
  let finalTableClasses = 'table';
  
  // 根據布林屬性添加 Bootstrap class
  if (striped) finalTableClasses += ' table-striped';
  if (stripedColumns) finalTableClasses += ' table-striped-columns';
  if (bordered) finalTableClasses += ' table-bordered';
  if (borderless) finalTableClasses += ' table-borderless';
  if (hover) finalTableClasses += ' table-hover';
  if (small) finalTableClasses += ' table-sm';
  if (captionTop) finalTableClasses += ' caption-top';

  // 加入用戶傳入的額外 class
  finalTableClasses += ` ${className}`;

  // 處理響應式容器的外殼 class
  const {className: respClassName, ...respRest} = responsiveProps || {};
  const wrapperClasses = responsive ? `table-responsive ${respClassName || ''}`.trim() : '';

  return (
    // 使用 div 標籤包裹，以便應用 .table-responsive class
    <div className={wrapperClasses} {...respRest}>
      {/* 應用所有 class 到 <table> 標籤 */}
      <table className={finalTableClasses} {...rest}>
        {/* 如果有 caption 屬性，則渲染 <caption> 標籤 */}
        {caption && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
};

/**
 * @description 表格頭部 (<thead>) 元件。
 * @param {THeadProps} props - 元件屬性
 */
export const THead: React.FC<THeadProps> = ({ children, className = '', dark, light, ...props }) => {
  let headClasses = className;
  
  // 根據 THead 專屬的 dark/light 屬性添加樣式
  if (dark) headClasses = `${headClasses} table-dark`;
  if (light) headClasses = `${headClasses} table-light`;

  return (
    <thead className={headClasses.trim()} {...props}>
      {children}
    </thead>
  );
};

/**
 * @description 表格主體 (<tbody>) 元件。
 * @param {HTMLAttributes<HTMLTableSectionElement>} props - 元件屬性
 */
export const TBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

/**
 * @description 表格尾部 (<tfoot>) 元件。
 * @param {HTMLAttributes<HTMLTableSectionElement>} props - 元件屬性
 */
export const TFoot: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tfoot className={className} {...props}>
      {children}
    </tfoot>
  );
};

/**
 * @description 表格行 (<tr>) 元件。
 * @param {TRProps} props - 元件屬性
 */
export const Tr: React.FC<TRProps> = ({ children, className = '', ...props }) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
};

/**
 * @description 表格表頭單元格 (<th>) 元件。
 * @param {THProps} props - 元件屬性
 */
export const Th: React.FC<THProps> = ({ children, className = '', scope, ...props }) => {
  return (
    <th scope={scope} className={className} {...props}>
      {children}
    </th>
  );
};

/**
 * @description 表格資料單元格 (<td>) 元件。
 * @param {TDProps} props - 元件屬性
 */
export const Td: React.FC<TDProps> = ({ children, className = '', colSpan, rowSpan, ...props }) => {
  return (
    <td colSpan={colSpan} rowSpan={rowSpan} className={className} {...props}>
      {children}
    </td>
  );
};