/**
 * 集中所有API路徑的設定檔
 */

/**
 * 取設定檔中的API網址
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
/**
 * 通用的API路徑 登入、更新token、登出．．等
 */
export const API_PATH = process.env.NEXT_PUBLIC_API_PATH || "api";
/**
 * 供應商平台使用的API路徑
 */
export const VND_API_PATH = process.env.NEXT_PUBLIC_VND_API_PATH || "api-vendor";
/** 通用API路徑 */
export const COMMON_PATH = "common";
/**
 * 所有API路徑
 */
export const API_MAP: Record<string, string> = {
  // 通用API
  HMPY: `${API_URL}/${API_PATH}/${COMMON_PATH}/hmpy`,
  // 檢查帳號是否為登入狀態
  IS_LOGIN: `${API_URL}/${API_PATH}/user/user-status`,
  // 登出帳號
  LOGOUT: `${API_URL}/${API_PATH}/user/logout`,
  // 取帳號資訊
  USER_INFO: `${API_URL}/${API_PATH}/user/user-info`,
  // 更新token 令牌
  REFRESH_TOKEN: `${API_URL}/${API_PATH}/user/refresh-token`,
  // 器械主檔 列表 GET、 新增 POST、 更新 PUT {id}、刪除 DELETE {id}
  SI_MST: `${API_URL}/${API_PATH}/SI`,
  // 設備維護 列表 GET、 新增 POST、 更新 PUT {id}、刪除 DELETE {id}
  EQP_MST: `${API_URL}/${API_PATH}/EQP`,
  // 設備維護 醫院對照 新增 POST、 刪除 DELETE {id}
  EQP_HSP_MST: `${API_URL}/${API_PATH}/EQP/HSP`,
  // 設備維護 序號管理 新增 POST、 刪除 DELETE {id}
  EQP_SN_MST: `${API_URL}/${API_PATH}/EQP/SN`,
  // 訊息維護 列表 GET、 新增 POST、 更新 PUT {id}、刪除 DELETE {id}
  MSG_MST: `${API_URL}/${API_PATH}/MSG`,
  // 盤包維護 列表 GET、 新增 POST、 更新 PUT {id}、刪除 DELETE {id}
  PKG_MST: `${API_URL}/${API_PATH}/PKG`,
  // 盤包明細 新增 POST、 更新 PUT {id}、刪除 DELETE {id}
  PKG_DTL_MST: `${API_URL}/${API_PATH}/PKG/DTL`,
  // 盤包訊息 新增 POST、 刪除 DELETE {id}
  PKG_MSG_MST: `${API_URL}/${API_PATH}/PKG/MSG`,
  // 盤包標牌 新增 POST、 刪除 DELETE {id}
  PKG_TAG_MST: `${API_URL}/${API_PATH}/PKG/TAG`,
  // 對照醫院盤包 新增 POST、 刪除 DELETE {id}
  PKG_HSP_MST: `${API_URL}/${API_PATH}/PKG/HSP`,
  // 醫院申領單管理 列表 GET
  APY_ORD_MST: `${API_URL}/${API_PATH}/APY-ORD`,
  // 申領單序號配置管理 新增 POST {id}、 更新 PUT {id}、刪除 DELETE {id}，id在POST的時候帶[申領單明細id]PUT與DELETE時帶[申領單明細序號的ID]
  APY_ORD_SN: `${API_URL}/${API_PATH}/APY-ORD/SN`,
  // 來源流向追蹤 供應商透過超連結讀取申領單 GET {t}
  APY_ORD_READ_LINK: `${API_URL}/${API_PATH}/APY-ORD/READ-LINK`,
  // 控制申領單的狀態（已讀、處理中）
  APY_ORD_TAG: `${API_URL}/${API_PATH}/APY-ORD/TAG`,
  // 來源流向追蹤 供應商使用者 列表 GET、異動來源流向追蹤資料 POST {id}
  FDA_TRACE: `${API_URL}/${API_PATH}/FDA-TRACE/VND-USER`,
  // 來源流向追蹤 供應商使用者 匯出下載 GET DOWNLOAD
  FDA_TRACE_DOWNLOAD: `${API_URL}/${API_PATH}/FDA-TRACE/VND-USER/DOWNLOAD`,

};

