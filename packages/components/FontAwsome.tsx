type FontAwesomeProps = {
    icon?: string;
    className?: string;
}
const FontAwesome = ({ icon, className }: FontAwesomeProps) => {
    if (!icon) {
        return null;
    }
    const classes = [icon];
    if (className) {
        classes.push(className);
    }
    const classNameStr = classes.join(" ");
    return (
        <i className={classNameStr}></i>
    );
}

export default FontAwesome;
