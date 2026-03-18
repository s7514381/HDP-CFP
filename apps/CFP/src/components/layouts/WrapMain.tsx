/**
 * 需要身份驗證的主要內容區域佈局
 * @param param0 
 * @returns 
 */
export default function WrapMain({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const _className = ['wrap-main', className].filter(Boolean).join(' ');
  return (
    <div className={_className}>
    {children}
    </div>
  );
}