"use client";
import Link from "next/link";
import React, { FC, ReactNode, useState } from "react";

type NavLink = {
    label: ReactNode;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    className?: string | undefined | null;
};

type NavBarNav = {
    links?: NavLink[];
    className?: string | undefined | null;
    children?: ReactNode;
}

type DropdownItem = {
    label: ReactNode;
    href?: string;
    active?: boolean;
    disabled?: boolean;
};

type Dropdown = {
    label: ReactNode;
    labelClassName?: string | undefined | null;
    items: DropdownItem[];
    right?: boolean;
    className?: string | undefined | null;
    children?: ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};


type NavBarProps = {
    fluid?: boolean;
    brand?: ReactNode;
    brandHref?: string;
    theme?: "light" | "dark"; // sets navbar-{theme}
    bg?: string; // sets bg-{bg} (e.g. "light", "dark", "primary", "white", etc.)
    expand?: "sm" | "md" | "lg" | "xl" | "xxl" | false; // false => always collapsed
    links?: NavLink[]; // left-aligned links
    rightLinks?: NavLink[]; // right-aligned links
    dropdowns?: Dropdown[]; // left-aligned dropdowns
    rightDropdowns?: Dropdown[]; // right-aligned dropdowns
    children?: ReactNode; // custom content (will appear between left and right sections)
    className?: string;
};

export const NavLink: FC<NavLink> = ({ label, href = "#", active = false, disabled = false, className = null, ...props }) => {
    const _className = [
        "nav-link",
        active ? "active" : null,
        disabled ? "disabled" : null,
        className,
    ]
    .filter(Boolean)
    .join(" ");
    return (
        <Link href={href} className={_className} aria-disabled={disabled} {...props}>
            {label}
        </Link>
    );
}

export const NavBarNav: FC<NavBarNav> = ({ links, className = "", children }) => {
    const _className = ["navbar-nav", className || null]
    .filter(Boolean)
    .join(" ");

    return (
        <ul className={_className}>
            {
                links?.map((lnk, i) => (<NavLink key={i} {...lnk} />))
            }
            {children}
        </ul>
    );
}

export const DropdownItem: FC<DropdownItem> = ({ label, href = null, active = false, disabled = false }) => {
    const _className = ['dropdown-item', disabled ? 'disabled' : null].filter(Boolean).join(' ');
    return (
        <li className={_className}>
            {
                href ?
                <Link href={href} className={`nav-link ${active ? "active" : ""}`} aria-disabled={disabled}>
                    {label}
                </Link>
                :
                <span className={_className}>
                    {label}
                </span>
            }
        </li>
    )
}

export const NavDropdown: FC<Dropdown> = ({ label, labelClassName, items, right = false, className = null, onClick, children }) => {
    
    const [show, setShow] = useState(false);
    const _className = [
        "nav-item",
        "dropdown",
        className || null
    ]
    .filter(Boolean)
    .join(" ");

    const _labelClassName = [
        "nav-link",
        "dropdown-toggle",
        labelClassName || null
    ]
    .filter(Boolean)
    .join(" ");

    const _menuClassName = [
        "dropdown-menu",
        right ? "dropdown-menu-end" : "dropdown-menu-start",
        show ? "show" : null
    ]
    .filter(Boolean)
    .join(" ");

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setShow(!show);
        onClick?.(e);
    }
    const handleBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
        setShow(false);
    }

    return (
        <li className={_className}>
            <Link className={_labelClassName} href="#" role="button" aria-expanded={show} onClick={handleClick} onBlur={handleBlur}>
                {label}
            </Link>
            <ul className={_menuClassName}>
                {
                    items.map((item, i) => <DropdownItem key={i} {...item} />)
                }
                {children}
            </ul>
        </li>
    )
}

export const NavBar: FC<NavBarProps> = ({
    fluid = true,
    brand,
    brandHref = null,
    theme = "light",
    bg = "light",
    expand = "lg",
    className = "",
    children,
    
}) => {
    const _className = [
        `navbar`,
        `navbar-expand-${expand === false ? "" : expand}`,
        `navbar-${theme}`,
        `bg-${bg}`,
        className || null
    ]
    .filter(Boolean)
    .join(" ");
    return(
        <nav className={_className}>
            <div className={fluid ? "container-fluid" : "container"}>
                {
                    brandHref ?
                    <Link href={brandHref}>{brand}</Link> :
                    brand
                }
                {children}
            </div>
        </nav>
    )
}




export default NavBar;