import { useSidebar } from "@packages/contexts/SidebarContext";
import { PropsWithChildren, useEffect } from "react";
import { Btn } from "../bootstrap5/Btn";

interface SidebarChildProps extends Readonly<PropsWithChildren> {
    /** 側邊欄內容的唯一識別 ID，外部調用 open/toggle 時需要傳入此 ID */
    id: string; 
    /** 側邊欄額外的 CSS 類別，例如用於控制寬度 (例如：'w-500px') */
    className?: string; 
    /** 側邊欄內容的額外 CSS 類別 */
    contentClassName?: string;
    /** 側邊欄關閉時的回調函式 */
    onClose?: () => void;
}

/**
 * SidebarChild 元件 本身不渲染任何內容到頁面上，它只是一個註冊器。
 * 用於定義和註冊一個可被 SidebarLayout 顯示的內容區塊。
 * 這個元件必須包裹在 SidebarLayout 內。
 * @param {SidebarChildProps} props 
 */
export const SidebarChild: React.FC<SidebarChildProps> = ({ id, className, contentClassName, onClose, children }: SidebarChildProps) => {
  const { activeId, registerId, close } = useSidebar();
  const _class = ['sidebar', className, activeId === id ? 'open' : null].filter(Boolean).join(' ');
  const _contentClass = ['sidebar-content', contentClassName].filter(Boolean).join(' ');

  const handleClose = () => {
    onClose?.();
    close();
  }
  /** 註冊ID */
  useEffect(() => {
    registerId(id);
  }, [id, registerId]);
  
  return (
      <div id={id} className={_class} aria-labelledby={`sidebar-title-${id}`}>
        <div className={_contentClass}>
          {children}
        </div>
        <Btn className="side-btn-close" color="link" icon="xmark" onClick={handleClose} />
      </div>
  );
}

interface SidebarLayoutProps extends Readonly<PropsWithChildren> {
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * 浮動側邊欄的內容佈局需要搭配 SidebarProvider上下文使用。
 * @see SidebarProvider
 * @see useSidebar
 * @example
 * const { isOpen, content, close } = useSidebar();
 * const handleOpen = (id) => {
 *  open(id);
 * }
 * <SidebarProvider>
 *   <SidebarLayout>
 *     <div>主要內容區域</div>
 *     <button type="button" onClick={() => handleOpen("example-sidebar-1")}>打開側邊欄１</button>
 *     <button type="button" onClick={() => handleOpen("example-sidebar-2")}>打開側邊欄2</button>
 *     <SidebarChild id="example-sidebar-1" className="w-400px"><p>側邊欄一</p></SidebarChild>
 *     <SidebarChild id="example-sidebar-2" className="w-400px"><p>側邊欄二</p></SidebarChild>
 *   </SidebarLayout>
 * </SidebarProvider>
 */
export const SidebarLayout = ({ children, ...props }: SidebarLayoutProps) => {
  const { isOpen } = useSidebar();
  // 解構其他傳入的 props
  const {className, ...rest} = props;
  // 核心佈局類別: sidebar-wrap, 搭配外部傳入的 className
  const _className = ['sidebar-wrap', className, isOpen ? 'open' : null].filter(Boolean).join(' ');
  
  return (
    <div className={_className} {...rest}>
      {/* 主內容區域 */}
      {children}
    </div>
  );
};
