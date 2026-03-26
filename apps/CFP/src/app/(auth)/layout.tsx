
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <img src="/images/logo-vert.png" alt="aHOP Logo" className="auth-logo" />
        {children}
      </div>
    </div>
  );
}
