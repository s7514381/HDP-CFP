import Link from "next/link";
import React from "react";
/**
 * BS5 List Group 容器屬性
 */
type ListGroupProps = {
    container?: "ul" | "ol" | "div";
    flush?: boolean;
    numbered?: boolean;
    children?: React.ReactNode;
    className?: string;
}

/**
 * BS5 List Group 元件
 * @param param0
 * @returns
 */
export function ListGroup({ container = "ul", flush = false, numbered = false, children, className = "" }: Readonly<ListGroupProps>) {
    const classes = ["list-group"];
    if (flush) {
        classes.push("list-group-flush");
    }
    if (numbered) {
        classes.push("list-group-numbered");
    }
    if (className) {
        classes.push(className);
    }
    if(container === "ol"){
        return <ol className={classes.join(" ")}>{children}</ol>;
    }else if(container === "div"){
        return <div className={classes.join(" ")}>{children}</div>;
    }else{
        return <ul className={classes.join(" ")}>{children}</ul>;
    }
}

/**
 * BS5 List Group item 相關屬性
 */
type ListGroupItemProps = {
    container?: "a" | "button" | "li";
    active?: boolean;
    disabled?: boolean;
    href?: string | null;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>;
    children?: React.ReactNode;
    className?: string;
}

/**
 * BS5 List Group Item 元件
 * @param param0
 * @returns
 */
export function ListGroupItem({
    container = "li",
    active = false,
    disabled = false,
    href,
    onClick,
    children,
    className = "",
}: Readonly<ListGroupItemProps>) {
    const classes = ["list-group-item"];
    if (active) {
        classes.push("list-group-item-action active");
    }
    if (disabled) {
        classes.push("disabled");
    }
    if (className) {
        classes.push(className);
    }

    if (container === "a") {
        if(!href){
            href = "#";
        }
        return (
            <Link className={classes.join(" ")} href={href} onClick={onClick} aria-disabled={disabled}>
                {children}
            </Link>
        );
    } else if (container === "button") {
        return (
            <button type="button" className={classes.join(" ")} onClick={onClick} disabled={disabled}>
                {children}
            </button>
        );
    }else {
        return <li className={classes.join(" ")}>{children}</li>;
    }
}