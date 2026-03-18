import { SpinnerBorder, SpinnerGrow } from "@packages/components/bootstrap5/Spinner";

/**
 * 需要身份驗證的主要內容區域佈局
 * @param param0 
 * @returns 
 */
export default function WrapContent({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const _className = ['wrap-content', className].filter(Boolean).join(' ');
  return (
    <div className={_className}>
    {children}
    </div>
  );
}