import { useUser } from "@/contexts/UserContext";
import NavBar, { NavBarNav } from "@packages/components/bootstrap5/NavBar";
import FontAwesome from "@packages/components/FontAwsome";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeLocalStorage } from "@packages/lib/localstorage";
import LanguageSelectorModal from "./LanguageSelectorModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

const UserBtn = () => {
  const { user, setUser } = useUser();
  const { translate } = useLanguage();
  const route = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleUserMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowUserMenu(current => !current);
  };

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowUserMenu(false);
    removeLocalStorage("token");
    removeLocalStorage("userInfo");
    setUser(null);
    route.push("/login");
  };

  const handleLanguageOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowUserMenu(false);
    setShowLanguageSelector(true);
  };

  return (
    <>
      <li className="nav-item dropdown">
        <button
          type="button"
          className="nav-link dropdown-toggle cfp-user-trigger"
          aria-expanded={showUserMenu}
          aria-haspopup="menu"
          onClick={handleUserMenuToggle}
        >
          <FontAwesome icon="fa-solid fa-circle-user me-2" />
          <span className="me-1">{user?.username}</span>
        </button>
        <ul className={`dropdown-menu dropdown-menu-end cfp-user-menu ${showUserMenu ? 'show' : ''}`}>
          <li>
            <button type="button" className="dropdown-item" onClick={handleLanguageOpen}>
              <FontAwesome icon="fa-solid fa-language" className="me-2" />{translate(LANGUAGE_KEYS.common.language)}
            </button>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button type="button" className="dropdown-item" onClick={handleLogout}>
              <FontAwesome icon="fa-solid fa-right-from-bracket" className="me-2" />{translate(LANGUAGE_KEYS.common.logout)}
            </button>
          </li>
        </ul>
      </li>
      <LanguageSelectorModal show={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
    </>
  );
}
export default function MainNavBar() {
  const { translate } = useLanguage();

  return (
    <NavBar className="no-print navbar-expand"  brand={
      /* eslint-disable-next-line @next/next/no-img-element */
      <img className="d-none d-md-block" src={`/images/logo.jpg`} alt={translate(LANGUAGE_KEYS.common.supplierPlatform)} />
    }>
      <NavBarNav className="align-items-center ms-auto flex-row">
        <UserBtn />
        {/* <NoticeBtn /> */}
      </NavBarNav>
    </NavBar>
  );
}
