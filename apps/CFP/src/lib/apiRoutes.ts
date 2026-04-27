/**
 * 集中所有API路徑的設定檔
 * 
 * 注意：路徑格式為 {controller}/{action}
 * 前端請求會透過 /api/{controller}/{action} 代理到後端
 * 
 * 例如：
 *   API_MAP 中：Manager/GetList
 *   前端呼叫：/api/Manager/GetList
 *   後端：https://localhost:7007/api/Manager/GetList
 */

/**
 * 取設定檔中的API網址（現在只用於代理參考）
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** API 路徑前綴（代理層自動添加） */
export const API_PREFIX = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "/api";

/**
 * 所有API路徑（相對於 /api 前綴）
 * 使用方式：API_PREFIX + "/" + API_MAP[key]
 */
export const API_MAP: Record<string, string> = {
  // ===== 供應商管理 =====
  SUPPLIER_CREATE: `${API_URL}/Supplier/Create`,
  SUPPLIER_EDIT: `${API_URL}/Supplier/Edit`,
  SUPPLIER_GET_MODEL: `${API_URL}/Supplier/GetModel`,
  SUPPLIER_GET_LIST: `${API_URL}/Supplier/GetList`,
  SUPPLIER_GET_SELECT_LIST: `${API_URL}/Supplier/GetSelectListItems`,
  SUPPLIER_MST: `${API_URL}/Supplier`,

  // ===== 功能管理 =====
  ADMIN_FUNCTION_CREATE: `${API_URL}/AdminFunction/Create`,
  ADMIN_FUNCTION_EDIT: `${API_URL}/AdminFunction/Edit`,
  ADMIN_FUNCTION_GET_MODEL: `${API_URL}/AdminFunction/GetModel`,
  ADMIN_FUNCTION_GET_LIST: `${API_URL}/AdminFunction/GetList`,
  ADMIN_FUNCTION_MST: `${API_URL}/AdminFunction`,

  // ===== 選單管理 =====
  ADMIN_MENU_CREATE: `${API_URL}/AdminMenu/Create`,
  ADMIN_MENU_EDIT: `${API_URL}/AdminMenu/Edit`,
  ADMIN_MENU_GET_MODEL: `${API_URL}/AdminMenu/GetModel`,
  ADMIN_MENU_GET_LIST: `${API_URL}/AdminMenu/GetList`,
  ADMIN_MENU_MST: `${API_URL}/AdminMenu`,

  // ===== 管理員管理 =====
  MANAGER_CREATE: `${API_URL}/Manager/Create`,
  MANAGER_EDIT: `${API_URL}/Manager/Edit`,
  MANAGER_GET_MODEL: `${API_URL}/Manager/GetModel`,
  MANAGER_GET_LIST: `${API_URL}/Manager/GetList`,
  MANAGER_MST: `${API_URL}/Manager`,
  MANAGER_LOGIN: `${API_URL}/Manager/Login`,
  MANAGER_REGISTER: `${API_URL}/Manager/Register`,

  // ===== 料號管理 =====
  MATERIAL_CREATE: `${API_URL}/Material/Create`,
  MATERIAL_EDIT: `${API_URL}/Material/Edit`,
  MATERIAL_GET_MODEL: `${API_URL}/Material/GetModel`,
  MATERIAL_GET_LIST: `${API_URL}/Material/GetList`,
  MATERIAL_MST: `${API_URL}/Material`,

  // ===== 群組管理 =====
  MATERIAL_GROUP_CREATE: `${API_URL}/MaterialGroup/Create`,
  MATERIAL_GROUP_EDIT: `${API_URL}/MaterialGroup/Edit`,
  MATERIAL_GROUP_GET_MODEL: `${API_URL}/MaterialGroup/GetModel`,
  MATERIAL_GROUP_GET_LIST: `${API_URL}/MaterialGroup/GetList`,
  MATERIAL_GROUP_MST: `${API_URL}/MaterialGroup`,

  // ===== 買方管理 =====
  BUYER_GET_MODEL: `${API_URL}/Material/GetBuyerCompareModel`,
  BUYER_EDIT: `${API_URL}/Material/EditBuyerCompareModel`,
  BUYER_MATERIAL_LIST: `${API_URL}/Material/GetBuyerMaterialList`,

  // ===== 賣方管理 =====
  SELLER_GET_MODEL: `${API_URL}/Material/GetSellerCompareModel`,
  SELLER_EDIT: `${API_URL}/Material/EditSellerCompareModel`,

  // ===== 建置通知 =====
  MATERIAL_NOTIFY_GET_LIST: `${API_URL}/MaterialNotify/GetList`,
  MATERIAL_NOTIFY_ADD: `${API_URL}/MaterialNotify/AddNotify`,

};
