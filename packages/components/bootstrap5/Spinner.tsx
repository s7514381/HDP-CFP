'use client';

type SpinnerProps = {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'body' | 'muted' | 'white';
    full: boolean;
    spinnerWrapClassName?: string;
    children?: React.ReactNode;
}
/**
 * 線條型態的讀取樣式
 * @param param0 
 * @returns 
 */
export const SpinnerBorder = ({ size = 'md', color = 'primary', full = false, spinnerWrapClassName, children }: SpinnerProps) => {
    const _className = [
        'spinner-border',
        size === 'sm' ? 'spinner-border-sm' : null,
        `text-${color}`
    ].filter(Boolean).join(' ');

    const _spinnerWrapClass = [
        'position-absolute top-0 start-0 bottom-0 end-0 d-flex justify-content-center align-items-center bg-dark bg-opacity-25',
        spinnerWrapClassName
    ].filter(Boolean).join(' ');

    if(full){
        return (
            <div className={_spinnerWrapClass}>
                <div className={['spinner-border', size === 'sm' ? 'spinner-border-sm' : null, `text-${color}`].join(' ')}>
                    <span className="visually-hidden">loading...</span>
                </div>
                {children}
            </div>
        );
    }else{
        return(
            <div className="d-flex justify-content-center align-items-center">
                <div className={_className}>
                    <span className="visually-hidden">loading...</span>
                </div>
                {children}
            </div>
        )
    }
}

/**
 * 點點型態的讀取樣式
 * @param param0 
 * @returns 
 */
export const SpinnerGrow = ({ size = 'md', color = 'primary', full = false, spinnerWrapClassName, children }: SpinnerProps) => {
    const _className = [
        'spinner-grow',
        size === 'sm' ? 'spinner-grow-sm' : null,
        `text-${color}`
    ].join(' ');

    const _spinnerWrapClass = [
        'position-absolute top-0 start-0 bottom-0 end-0 d-flex justify-content-center align-items-center bg-dark bg-opacity-25',
        spinnerWrapClassName
    ].filter(Boolean).join(' ');

    if(full){
        return(
            <div className={_spinnerWrapClass}>
                <div className={_className}>
                    <span className="visually-hidden">loading...</span>
                </div>
                {children}
            </div>
        );
    }else{
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className={_className}>
                    <span className="visually-hidden">loading...</span>
                </div>
                {children}
            </div>
        );
    }
}