import { useUser } from "@/contexts/UserContext";
import NavBar, { NavBarNav, NavDropdown, NavLink } from "@packages/components/bootstrap5/NavBar";
import FontAwesome from "@packages/components/FontAwsome";
import { useRouter } from "next/navigation";
import { removeLocalStorage } from "@packages/lib/localstorage";

const UserBtn = () => {
  const { user, setUser } = useUser();
  const route = useRouter();

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    removeLocalStorage("token");
    removeLocalStorage("userInfo");
    setUser(null);
    route.push("/login");
  };

  return (
    <NavDropdown 
      label={
      <>
      <FontAwesome icon="fa-solid fa-circle-user me-2" />
      <span className="me-1">{user?.username}</span>
      </>
      }
      labelClassName="p-2"
      items={[]}
      right={false}
    >
      <li>
        <button type="button" className="dropdown-item" onMouseDown={handleLogout}>
          <FontAwesome icon="fa-solid fa-right-from-bracket" className="me-2" />登出
        </button>
      </li>
    </NavDropdown>
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
        {/* <NoticeBtn /> */}
      </NavBarNav>
    </NavBar>
  );
}