import React from 'react';

/**
 * Bootstrap Badge 組件屬性
 */
export interface BadgeProps {
    children?: React.ReactNode;
    label?: string;
    color?: 
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'light'
        | 'dark';
    pill?: boolean;
    className?: string;
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'light' | 'lighter';
}

/**
 * Bootstrap Badge 組件
 * @param {BadgeProps} props - 組件屬性
 * @returns {JSX.Element} - Badge 元素
 */
const Badge: React.FC<BadgeProps> = ({
    children,
    label,
    color = 'secondary',
    pill = false,
    className = '',
    fontWeight = 'normal',
}) => {
    const _fontWeight = fontWeight ? `fw-${fontWeight}` : 'fw-normal';
    const classes = ['badge', `bg-${color}`, pill ? 'rounded-pill' : '', className, _fontWeight]
        .filter(Boolean)
        .join(' ');

    return <span className={classes}>
        {label ?? ""}{children}
    </span>;
};

export default Badge;