/**
 * BS5 Card 元件
 */
'use client';

import React, { ReactNode } from 'react';

/**
 * Card 元件屬性
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    border?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    background?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

/**
 * Card 圖片屬性
 */
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    position?: 'top' | 'bottom';
}

/**
 * 定義 Card 組件的型別結構
 * 讓 TS 知道 Card 函數身上還有哪些掛載的子組件
 */
interface CardComponent extends React.FC<CardProps> {
    Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Body: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Title: React.FC<any>; // 這裡建議之後補上更精確的型別
    Text: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
    Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Image: React.FC<CardImageProps>;
}

/**
 * Bootstrap 5 卡片元件
 * 採用複合組件模式設計
 */
const CardBase = ({ children, className = '', border, background, ...props }: CardProps) => {
    const _className = [
        'card',
        border ? `border-${border}` : '',
        background ? `bg-${background}` : '',
        background && background !== 'light' && background !== 'warning' ? 'text-white' : '',
        className
    ].filter(Boolean).join(' ').trim();

    return (
        <div className={_className} {...props}>
            {children}
        </div>
    );
};

const Card = CardBase as CardComponent;

// 子組件：Header
Card.Header = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={`card-header ${className}`} {...props}>{children}</div>;
};

// 子組件：Body
Card.Body = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={`card-body ${className}`} {...props}>{children}</div>;
};

// 子組件：Title
Card.Title = ({ children, className = '', as: Component = 'h5', ...props }: any) => {
    return <Component className={`card-title ${className}`} {...props}>{children}</Component>;
};

// 子組件：Text
Card.Text = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
    return <p className={`card-text ${className}`} {...props}>{children}</p>;
};

// 子組件：Footer
Card.Footer = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={`card-footer ${className}`} {...props}>{children}</div>;
};

// 子組件：Image
Card.Image = ({ src, alt = 'card image', position = 'top', className = '', ...props }: CardImageProps) => {
    const _className = [`card-img-${position}`, className].filter(Boolean).join(' ');
    return <img src={src} alt={alt} className={_className} {...props} />;
};

Card.displayName = 'Card';
Card.Header.displayName = 'Card.Header';
Card.Body.displayName = 'Card.Body';
Card.Title.displayName = 'Card.Title';
Card.Text.displayName = 'Card.Text';
Card.Footer.displayName = 'Card.Footer';
Card.Image.displayName = 'Card.Image';

export default Card;