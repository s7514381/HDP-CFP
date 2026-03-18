/**
 * LocalStorage CRUD utility
 */

/**
 * Create/Update - 儲存資料到 localStorage
 * @param key 鍵值
 * @param value 資料（可以是任何可序列化的資料）
 */
export function setLocalStorage<T>(key: string, value: T): void {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`localStorage寫入${key}失敗: ${error}`);
    }
}

/**
 * Read - 讀取 localStorage 資料
 * @param key 鍵值
 * @param defaultValue 預設值（當資料不存在時返回）
 * @returns 解析後的資料或預設值
 */
export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`localStorage讀取${key}失敗: ${error}`);
        return defaultValue;
    }
}

/**
 * Update - 更新現有資料
 * @param key 鍵值
 * @param value 新資料
 */
export function updateLocalStorage<T>(key: string, value: T): void {
    setLocalStorage(key, value);
}

/**
 * Delete - 刪除指定的 localStorage 項目
 * @param key 鍵值
 */
export function removeLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`localStorage刪除${key}失敗: ${error}`);
    }
}

/**
 * 清空所有 localStorage 資料
 */
export function clearLocalStorage(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error(`localStorage清空失敗: ${error}`);
    }
}

/**
 * 檢查指定的 key 是否存在
 * @param key 鍵值
 * @returns 是否存在
 */
export function hasLocalStorage(key: string): boolean {
    return localStorage.getItem(key) !== null;
}

/**
 * 取得所有 keys
 * @returns 所有鍵值陣列
 */
export function getLocalStorageKeys(): string[] {
    return Object.keys(localStorage);
}
