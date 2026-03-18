import { useUser } from "@/contexts/UserContext";
import { Btn } from "@packages/components/bootstrap5/Btn";
import NavBar, { NavBarNav, NavDropdown, NavLink } from "@packages/components/bootstrap5/NavBar";
import FontAwesome from "@packages/components/FontAwsome";
import { useRouter } from "next/navigation";

const UserBtn = () => {
  
  const {user} = useUser();

  return (
    <NavDropdown 
      label={
      <>
      <FontAwesome icon="fa-solid fa-circle-user me-2" />
      <span className="me-1">{user?.username}</span>
      </>
      }
      labelClassName="p-2"
      items={[{label: "會員資料", href: "https://www.ahop.com.tw"}]}
      right={false} />
  )
}
/**
 * 公告按鈕
 */
const NoticeBtn = () => {
    return (
       <NavLink 
       label={
        <div className="border border-secondary p-2 fs-7">
        <FontAwesome icon="fa-regular fa-bell" className="me-2" />
        公告
        </div>} />
    );
}

/**
 * 登出按鈕
 * @returns 
 */
const LogoutBtn = () => {
  const route = useRouter();
  const url = process.env.NEXT_PUBLIC_VENDOR_URL;
  const handleLogout = () => {
    route.push(`${url}/site/logout`);
  }
    return (
       <Btn color="secondary" clasName="p-2" rounded onClick={handleLogout} className="ms-2">
        <FontAwesome icon="fa-solid fa-right-from-bracket" className="me-2" />登出
       </Btn>
    );
  }

/**
 * 需要身份驗證授權的導覽列
 * @param param0 
 * @returns 
 */
export default function MainNavBar() {

  return (
    <NavBar className="no-print navbar-expand"  brand={
      /* eslint-disable-next-line @next/next/no-img-element */
      <img className="d-none d-md-block" src={`/images/logo.jpg`} alt="aHOP 供應商平台" />
    }>
      <NavBarNav className="align-items-center ms-auto flex-row">
        <UserBtn />
        <NoticeBtn />
        <LogoutBtn />
      </NavBarNav>
    </NavBar>
  );
}