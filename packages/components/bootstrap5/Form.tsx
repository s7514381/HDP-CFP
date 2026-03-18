import React, { useState, FormEvent, cloneElement, forwardRef, useImperativeHandle } from "react";

export interface FormProps<T> {
    children: React.ReactNode; // 子元件
    onSubmit: (data: T) => void; // 提交回調
    initialValues?: T; // 初始表單資料
    className?: string; // 自定義樣式
}

// 重置表單的方法
export interface FormRef<T> {
    resetForm: () => void;
    getFormData: () => T; // 獲取當前表單資料
    setFormData: (data: Partial<T>) => void; // 外部設置表單資料
}

// 自定義的 setNestedValue 函數用來處理多層路徑的名稱例如vendors[0].default
const setNestedValue = <T extends object>(obj: T, path: string, value: unknown) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.'); // 將 `vendor[0].default` 轉換為 `vendor.0.default`
    let current: unknown = obj;
    
    keys.forEach((key, index) => {
        if (typeof current !== 'object' || current === null) {
            throw new Error(`Path "${keys.slice(0, index + 1).join('.')}" is invalid.`);
        }
        
        if (index === keys.length - 1) {
            (current as Record<string, unknown>)[key] = value; // 最後一層設置值
        } else {
            const curr = current as Record<string, unknown>;
            if (!(key in curr)) {
                curr[key] = Number.isNaN(Number(keys[index + 1])) ? {} : [];
            }
            current = curr[key];
        }
    });
};

// 定義表單元件
const FormComponent = <T extends object>(
    { children, onSubmit, initialValues = {} as T, className }: FormProps<T>,
    ref: React.Ref<FormRef<T>>
) => {
    const [formData, setFormData] = useState<T>(initialValues);
    // 處理表單值變更
    const handleChange = (name: string, value: unknown) => {
        setFormData((prev) => {
            const updatedData = { ...prev };
            setNestedValue(updatedData, name, value); // 使用自定義的 setNestedValue 函數
            return updatedData;
        });
    };

    // 重置表單
    const resetForm = () => {
        setFormData(initialValues);
    };

    // 暴露 `resetForm` 和 `setFormData` 方法給父元件
    useImperativeHandle(ref, () => ({
        resetForm,
        getFormData: () => formData,
        setFormData: (data: Partial<T>) => {
            setFormData((prev) => ({
                ...prev,
                ...data, // 合併新資料
            }));
        },
    }));

    // 遞歸渲染子元件，注入 `onChange` 和 `value`
    const renderChildren = (children: React.ReactNode): React.ReactNode => {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement<{ name?: string; value?: unknown; children?: React.ReactNode }>(child)) return child;

            if (child.props.name) {
                return cloneElement<{ name?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; value?: unknown }>(
                    child,
                    {
                        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                            handleChange(child.props.name as string, e.target.type === "checkbox" ? e.target.checked : e.target.value),
                        value: child.props?.value ?? formData[child.props.name as keyof T] ?? "",
                    }
                );
            }

            if (child.props.children) {
                return cloneElement<{ children?: React.ReactNode }>(child, {
                    children: renderChildren(child.props.children),
                });
            }

            return child;
        });
    };

    // 處理表單提交
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            {renderChildren(children)}
        </form>
    );
};

export const Form = Object.assign(
    forwardRef(FormComponent) as <T extends object>(
        props: FormProps<T> & { ref?: React.Ref<FormRef<T>> }
    ) => React.ReactElement,
    { displayName: "Form" }
);
export default Form;