/**
 * API 代理工具函式
 * 用於建構後端 API URL
 */

// API 代理路徑前綴
export const API_PROXY_PATH = "/api";

// 從環境變數取得後端 API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * 建構後端 API URL
 * @param controller 控制器名稱
 * @param action 動作名稱
 * @returns 完整的後端 URL
 */
export function buildBackendUrl(controller: string, action: string): string {
    return `${API_URL}/${controller}/${action}`;
}
