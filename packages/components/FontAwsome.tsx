type FontAwesomeProps = {
    icon?: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
}
const FontAwesome = ({ icon, className, onClick }: FontAwesomeProps) => {
    if (!icon) {
        return null;
    }
    const classes = [icon];
    if (className) {
        classes.push(className);
    }
    const classNameStr = classes.join(" ");
    return (
        <i className={classNameStr} onClick={onClick}></i>
    );
}

export default FontAwesome;
