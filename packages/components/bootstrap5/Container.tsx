import React from 'react';
/**
 * Bootstrap 5 容器元件
 */
export type ContainerProps = React.HTMLAttributes<HTMLElement> & {
    fluid?: boolean;
    as?: 'div' | 'main';
    children?: React.ReactNode;
};

export const Container: React.FC<ContainerProps> = ({
    fluid = false,
    as: Component = 'div',
    className = '',
    children,
    ...rest
}) => {
    const containerClass = fluid ? 'container-fluid' : 'container';
    return (
        <Component className={`${containerClass} ${className}`} {...rest}>
            {children}
        </Component>
    );
};

export default Container;