/**
 * 主內容區塊
 * @param param0 
 * @returns 
 */
export default function Wrap({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="wrap">
    {children}
    </div>
  );
}