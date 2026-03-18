import { useState } from "react";
import Container from "@packages/components/bootstrap5/Container";
import FontAwesome from "@packages/components/FontAwsome";
import { Btn } from "@packages/components/bootstrap5/Btn";

/**
 * 提供搜尋區塊的統一外層樣式
 */
interface SearchBlockProps {
  icon?: string;
  title?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
  /** 子元件 */
  children: React.ReactNode;
}
export const SearchBlock: React.FC<SearchBlockProps> = ({ 
  icon = 'fa-brands fa-searchengin',
  title,
  color = 'warning',
  children,
  className, 
  ...props 
}) => {
  
  const _bodyClass = ['border', 'bg-white', 'shadow', 'p-2'].filter(Boolean).join(' ');

  const [show, setShow] = useState<boolean>(true);
  const bodyClass = ['w-100 collapse mt-3', show ? 'show' : ''].filter(Boolean).join(' ');

  return (
    <Container fluid className={className} {...props}>
      <div className={_bodyClass}>
        {
          icon && (
            <p className={`text-${color}-ahop fs-5 fw-normal d-flex align-items-center mb-0`}>
              <FontAwesome icon={icon} />
              {title && <b className="ms-2">{title}</b>}
              {/* 折疊按鈕 */}
              <Btn size="sm" color="link" onClick={() => setShow(!show)} className="ms-auto">
                <FontAwesome  icon={show ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-down"}  className={`ms-auto cursor-pointer text-primary`} />
              </Btn>
            </p>
        )}

        <div className={bodyClass}>
          {children}
        </div>
      </div>  
    </Container>
  );
}