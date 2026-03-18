'use client';
// src/hooks/useConfirm.ts

/**
 * [公開型別] 定義 confirm 函數的簽章。
 * 接收一個 string 訊息，並返回一個 Promise<boolean>。
 */
export type ConfirmFunction = (message: string) => Promise<boolean>;
/**
 * [公開介面] 定義 useConfirm Hook 的返回結果。
 * 包含一個名為 confirm 的函數。
 */
export interface UseConfirmResult {
    confirm: ConfirmFunction;
}

/**
 * 封裝瀏覽器原生的 confirm 函數，未來可快速替換為自定義的確認框樣式。
 *
 * @returns {object} 包含一個 confirm 函數的物件。
 * @property {function(message: string): Promise<boolean>} confirm - 顯示確認對話框的函數。
 *
 * @example
 * ```tsx
 * // 在元件中使用
 * const { confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 * const result = await confirm("確定要刪除這筆資料嗎？");
 * if (result) {
 * // 執行刪除操作
 * console.log("資料已刪除");
 * } else {
 * // 取消操作
 * console.log("取消刪除");
 * }
 * };
 * ```
 */
export function useConfirm(): UseConfirmResult  {
    /**
     * 顯示確認對話框。
     * @param message 要顯示的訊息。
     * @returns {Promise<boolean>} 當用戶點擊「確定」時解析為 true，點擊「取消」或關閉時解析為 false。
     */
    const confirm: ConfirmFunction = (message: string) => {
        // 使用 Promise 來模擬非同步的 confirm 行為
        return new Promise((resolve) => {
            // 初始版本：使用瀏覽器原生的 window.confirm
            const result = window.confirm(message);
            resolve(result);
            
            // --- 未來升級建議 (使用您現有的 Modal 元件) ---
            // 
            // 1. 可以在此處實作一個 state 來控制自定義 Modal 的顯示。
            // 2. 透過 ReactDOM.createPortal 或其他方式將 Modal 渲染到 document.body。
            // 3. 在自定義 Modal 的「確定」按鈕點擊時呼叫 resolve(true)，「取消」時呼叫 resolve(false)。
            // 4. 當 Promise 被 resolve 後，隱藏 Modal。
            // ----------------------------------------------------
        });
    };

    return {
        confirm,
    };
}