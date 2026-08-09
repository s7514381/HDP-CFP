import React, { useEffect, useRef, useImperativeHandle, forwardRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

const MODAL_Z_INDEX = 11000;
const MODAL_BACKDROP_Z_INDEX = MODAL_Z_INDEX - 10;

interface ModalProps {
    show: boolean;
    size?: 'sm' | 'lg' | 'xl'; // 可選的尺寸屬性
    onClose: () => void;
    children: ReactNode;
    
}

interface ModalRef {
    close: () => void;
}

// 定義 Modal 組件類型，包含靜態屬性
type ModalComponent = React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>> & {
    Wrap: React.FC<{ children: ReactNode }>;
    Title: React.FC<{ children: ReactNode; } & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> & { onClose: () => void }>;
    Body: React.FC<{ children: ReactNode; } & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>>;

};

const Modal = forwardRef<ModalRef, ModalProps>(({ show, size, onClose, children }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = React.useState(false);
    const _className = ['modal', 'fade', show ? 'show' : ''].join(' ').trim();
    const _dialogClass = ['modal-dialog', size ? `modal-${size}` : ''].join(' ').trim();
    useImperativeHandle(ref, () => ({
        close: () => {
            onClose();
        },
    }));

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (show) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [show]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!show || !mounted) return null;

    return createPortal(
        <>
        <div className={_className} style={{ display: 'block', zIndex: MODAL_Z_INDEX }} ref={modalRef} onKeyDown={handleKeyDown} onClick={handleBackdropClick} aria-modal="true">
            <div className={_dialogClass}>
                <div className="modal-content">{children}</div>
            </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: MODAL_BACKDROP_Z_INDEX }} />
        </>,
        document.body,
    );
}) as ModalComponent;

Modal.displayName = 'Modal';

// 子組件：Wrap
Modal.Wrap = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
};
Modal.Wrap.displayName = 'Modal.Wrap';

// 子組件：Title
Modal.Title = ({ children, onClose, ...props }: { children: ReactNode; onClose: () => void }) => {
    return (
        <div className="modal-header" {...props}>
            {children}
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
    );
};
Modal.Title.displayName = 'Modal.Title';

// 子組件：Body
Modal.Body = ({ children, className, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const _className = ['modal-body', className].filter(Boolean).join(' ').trim();
    return <div className={_className} {...props}>{children}</div>;
};
Modal.Body.displayName = 'Modal.Body';

export default Modal;