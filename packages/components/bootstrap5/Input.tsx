/* eslint-disable react-hooks/set-state-in-effect */
import React, { forwardRef, InputHTMLAttributes, useImperativeHandle, useRef, useState, useEffect, TextareaHTMLAttributes } from "react";
import { Btn } from "./Btn";


/**
 * BS5的INPUT組件
 * @param {*} param0 
 * @returns 
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  name?: string;
  error?: string[];
  label?: string;
  bsSize?: "" | "sm" | "lg" | "xl";
  className?: string;
  labelMark?: boolean; // 是否顯示label後的星號
}
/**
 * Input組件
 * @param param0 
 * @returns 
 */
export function Input({
  type = "text",
  name,
  error,
  label,
  bsSize = "",
  className = "",
  labelMark = false,
  ...props
}: Readonly<InputProps>) {
  const isInvalid = !!(error && error.length > 0);
  const _className = [`form-control`, bsSize ? ` form-control-${bsSize}` : "", className, isInvalid ? ` is-invalid`: ""].filter(Boolean).join(" ");
  return (
    <>
    {
      label && 
      <label htmlFor={name} className="form-label">
        {labelMark && <span className="text-danger">*</span>} {label}
      </label>
    }
    <input
    name={name}
    type={type}
    className={_className}
    {...props}
    />
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
}

/**
 * 檔案上傳Input組件
 */
export interface FileInputProps extends Omit<InputProps, "type"> {
  accept?: string;
  multiple?: boolean;
}

/**
 * 檔案上傳Input組件
 * @param param0 
 * @returns 
 */
export interface FileButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  className?: string;
  btnProps?: React.ComponentProps<typeof Btn>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // 暴露給父元件的onChange方法
}

/**
 * 檔案上傳按鈕組件
 * @param label 按鈕顯示的文字
 * @param className 額外的CSS類名
 * @param btnProps 傳遞給按鈕的屬性
 * @param props 傳遞給input的屬性
 * @returns
 */
export const FileBtn = forwardRef<HTMLInputElement, FileButtonProps>(({ label = "選擇檔案", className = "", btnProps = {}, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const _className = ["hidden-file-input", className].filter(Boolean).join(" ");

    const handleClick = () => {
      inputRef.current?.click();
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      }
      // 清除input的值，避免重複選擇同一檔案時不觸發onChange
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }

    return (
      <>
        <Btn type="button" onClick={handleClick} {...btnProps}>
          {label}
        </Btn>
        <input className={_className} ref={inputRef} type="file" onChange={handleChange} {...props} />
      </>
    );
  }
);

FileBtn.displayName = "FileBtn";

/**
 * Checkbox組件的屬性
 * @param name 輸入的名稱
 * @param label 標籤文字
 * @param error 錯誤訊息陣列
 * @param className 額外的CSS類名
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string[];
  className?: string;
}

/**
 * BS5的Checkbox組件
 * @param param0 
 * @returns 
 */
export function Checkbox({
  name,
  label,
  error,
  className = "",
  ...props
}: Readonly<CheckboxProps>) {
  // 檢查是否有錯誤訊息
  const isInvalid = !!(error && error.length > 0);
  // 組合CSS類名
  const _className = ["form-check-input", className, isInvalid ? "is-invalid" : "",].filter(Boolean).join(" ");

  return (
    <div className="form-check">
      <input
        type="checkbox"
        name={name}
        className={_className}
        id={name}
        {...props}
      />
      {label && (
        <label className="form-check-label" htmlFor={name}>
          {label}
        </label>
      )}
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
    </div>
  );
}

/**
 * 過濾下拉選單的項目物件
 */
export interface DropdownItem {
  label: string;
  value: string;
}

/**
 * 輸入框的屬性
 */
export interface DropdownInputProps extends Omit<InputProps, "type"> {
  items?: DropdownItem[];
  fetchItems?: (input: string) => Promise<DropdownItem[]>;
  debounce?: number;
  onItemSelect?: (item: DropdownItem) => void;
  displayValue?: (item: DropdownItem) => string;
  clear?: boolean;
}

/**
 * DropdownInput 使用範例
 * 假設在某個父元件中
 * function DemoDropdown() {
 * // 假設有一個 API 可以根據輸入文字回傳選項
  const fetchItems = async (input: string): Promise<DropdownItem[]> => {
    // 這裡用假資料模擬
    const allItems = [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Cherry", value: "cherry" },
      { label: "Date", value: "date" },
      { label: "Eggfruit", value: "eggfruit" },
    ];
    return allItems.filter(item => item.label.toLowerCase().includes(input.toLowerCase()));
  };

  const handleSelect = (item: DropdownItem) => {
    alert(`你選擇了: ${item.label}`);
  };

  return (
    <DropdownInput
      label="水果搜尋"
      fetchItems={fetchItems}
      onItemSelect={handleSelect}
      placeholder="請輸入水果名稱"
      error={[]} // 可選，顯示錯誤訊息
    />
  );
}
 */


export function DropdownInput({
  items = [],
  fetchItems,
  debounce = 600,
  onItemSelect,
  onChange,
  clear,
  ...props
}: Readonly<DropdownInputProps>) {
  const [inputValue, setInputValue] = useState("");
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>(items);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  /** 當前引發值變動的是不是在下拉選單中點擊，如果是的話就不用再呼叫API一次 */
  const [isSelected, setIsSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    if (onChange) onChange(e);
  };

  const handleSelect = (item: DropdownItem) => {
    setInputValue(item.label);
    setShowDropdown(false);
    setIsSelected(true);
    if (onItemSelect) onItemSelect(item);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleComposition = (e: React.CompositionEvent<HTMLInputElement>) => {
    const type = e.type;
    if (type === "compositionstart") {
      setIsComposing(true);
    } else if (type === "compositionend") {
      setIsComposing(false);
    }
  };

  /**
   * 當聚焦在輸入框時，顯示下拉選單，如果沒有資料先呼叫API一次
   */
  const handleFocus = async () => {
    if (dropdownItems.length === 0 && fetchItems) {
      const items = await fetchItems(inputValue);
      setDropdownItems(items);
    }
    setShowDropdown(true);
  };

  /** 當外部傳入的 items 改變時，更新下拉選單項目 */
  useEffect(() => {
    if (items.length > 0) {
      setDropdownItems(items);
    }
  }, [items]);

  /** 當輸入值改變時，根據輸入值呼叫 fetchItems 取得下拉選單資料 */
  useEffect(() => {
    if(isSelected) {
      setIsSelected(false);
      return;
    }
    if (fetchItems && inputValue !== "" && !isComposing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(async () => {
        const result = await fetchItems(inputValue);
        setDropdownItems(result);
        setShowDropdown(true);
      }, debounce);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [inputValue, debounce, isComposing]);

  /** 清除輸入值時，同時清空下拉選單的輸入框 */
  useEffect(() => {
    if (clear) {
      setInputValue("");
      setDropdownItems([]);
    }
  }, [clear]);

  return (
    <div className="position-relative">
      
        <Input
          {...props}
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
          onBlur={handleBlur}
          onFocus={handleFocus}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
        />
      
      {showDropdown && dropdownItems.length > 0 && (
        <ul className="list-group input-dropdown">
          {dropdownItems.length === 0 && (
            <li className="list-group-item text-danger">沒有資料</li>
          )}
          {dropdownItems.map((item) => (
            <li key={item.value} className="pointer list-group-item" onMouseDown={() => handleSelect(item)} role="button">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * BS5的Textarea組件屬性介面
 * 繼承原生的 TextareaHTMLAttributes<HTMLTextAreaElement>
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name?: string;
  error?: string[]; // 錯誤訊息陣列
  label?: string; // 標籤文字
  bsSize?: "" | "sm" | "lg"; // BS5 尺寸控制，Textarea 不支持 xl
  className?: string;
  labelMark?: boolean; // 是否顯示 label 後的星號 (必填標記)
}

/**
 * Textarea組件
 * * 這是基於 Bootstrap 5 (BS5) 樣式和您提供的 Input 結構設計的 Textarea 元件。
 * 它支援標籤、錯誤訊息顯示和 BS5 的尺寸控制。
 * * @param {TextareaProps} props - 元件屬性
 * @returns {React.ReactElement}
 */
export function Textarea({
  name,
  error,
  label,
  bsSize = "",
  className = "",
  labelMark = false,
  ...props
}: Readonly<TextareaProps>): React.ReactElement {
  
  // 檢查是否有錯誤訊息，決定是否應用 is-invalid 類別
  const isInvalid = !!(error && error.length > 0);
  // 組合 BS5 樣式類別
  // form-control 是 Textarea 的基本樣式
  const _className = [`form-control`, bsSize ? `form-control-${bsSize}` : "", className, isInvalid ? `is-invalid` : null].filter(Boolean).join(" ");
  // 處理 row 屬性，如果使用者沒有傳入，給予一個預設值 (例如 3)
  const rows = props.rows || 3;

  return (
    <>
      {/* 渲染標籤 (Label) */}
      {
        label && 
        <label htmlFor={name} className="form-label">
          {/* 如果需要顯示星號 */}
          {labelMark && <span className="text-danger">*</span>} {label}
        </label>
      }
      
      {/* 渲染 Textarea */}
      <textarea name={name} className={_className} rows={rows} {...props} />
      
      {/* 渲染錯誤訊息 (Invalid Feedback) */}
      {isInvalid && (
        <div className="invalid-feedback">
          {
            // 支援陣列或單一字串的錯誤訊息
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
}