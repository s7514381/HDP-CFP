import React from 'react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, never> {
    options: { value: string | number; label: string }[];
    labelMark?: boolean;
    label?: string;
    bsSize?: 'sm' | 'lg'; // 支援 BS5 size
    className?: string;
    prompt?: string;
    error?: string[];
}

export const Select: React.FC<SelectProps> = ({ 
    options, 
    label, 
    labelMark, 
    bsSize, 
    className = '', 
    prompt,
    error = [],
    ...props }) => {
    const isInvalid = !!(error && error.length > 0);
    // 根據 bsSize 加入 BS5 class
    const _class = [`form-select`, bsSize ? `form-select-${bsSize}` : '', isInvalid ? 'is-invalid' : '', className].filter(Boolean).join(' ');
    return (
        <>
            {label && 
            <label className="form-label">
                {labelMark && <span className="text-danger">*</span>}
                {label}
            </label>
            }
            <select className={_class} {...props}>
                {prompt && <option value="">{prompt}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {isInvalid && (
            <div className="invalid-feedback">
                {
                Array.isArray(error) ? (
                    error.map((err, index) => (
                    <div key={`${err}${index}`}>{err}</div>
                    ))
                ) : (
                    <div>{error}</div>
                )
                }
            </div>
            )}
        </>
    );
};
/**
 * 較常用到的狀態下拉選單
 * @param props 
 * @returns 
 */
export const StatusSelect: React.FC<Omit<SelectProps, 'options'>> = (props) => {
    const statusOptions = [
        { value: '', label: '狀態' },
        { value: 1, label: '啟用' },
        { value: 0, label: '停用' },
    ];
    return <Select options={statusOptions} {...props} />;
}

export default Select;