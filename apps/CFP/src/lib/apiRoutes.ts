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
  ADMIN_MENU_GET_ADMIN_MENUS: `${API_URL}/AdminMenu/GetAdminMenus`,
  ADMIN_MENU_MST: `${API_URL}/AdminMenu`,

  // ===== 多語言設定 =====
  LANGUAGE_CREATE: `${API_URL}/Language/Create`,
  LANGUAGE_GET_ACTIVE: `${API_URL}/Language/GetActiveLanguages`,
  LANGUAGE_RESOURCE_CREATE: `${API_URL}/LanguageResource/Create`,
  LANGUAGE_RESOURCE_EDIT: `${API_URL}/LanguageResource/Edit`,
  LANGUAGE_RESOURCE_GET_MODEL: `${API_URL}/LanguageResource/GetModel`,
  LANGUAGE_RESOURCE_GET_LIST: `${API_URL}/LanguageResource/GetList`,
  LANGUAGE_RESOURCE_GET_ACTIVE_LANGUAGES: `${API_URL}/LanguageResource/GetActiveLanguages`,
  LANGUAGE_RESOURCE_GET_TRANSLATIONS: `${API_URL}/LanguageResource/GetTranslations`,
  LANGUAGE_RESOURCE_MST: `${API_URL}/LanguageResource`,

  // ===== 管理員管理 =====
  MANAGER_CREATE: `${API_URL}/Manager/Create`,
  MANAGER_EDIT: `${API_URL}/Manager/Edit`,
  MANAGER_GET_MODEL: `${API_URL}/Manager/GetModel`,
  MANAGER_GET_LIST: `${API_URL}/Manager/GetList`,
  MANAGER_MST: `${API_URL}/Manager`,
  MANAGER_LOGIN: `${API_URL}/Manager/Login`,
  MANAGER_REGISTER: `${API_URL}/Manager/Register`,
  MANAGER_FORGOT_PASSWORD: `${API_URL}/Manager/ForgotPassword`,
  MANAGER_RESET_PASSWORD: `${API_URL}/Manager/ResetPassword`,
  MANAGER_GET_CAPTCHA: `${API_URL}/Manager/GetCaptcha`,

  // ===== 料號管理 =====
  MATERIAL_CREATE: `${API_URL}/Material/Create`,
  MATERIAL_EDIT: `${API_URL}/Material/Edit`,
  MATERIAL_GET_MODEL: `${API_URL}/Material/GetModel`,
  MATERIAL_GET_LIST: `${API_URL}/Material/GetList`,
  DATA_MAINTENANCE_GET_LIST: `${API_URL}/DataMaintenance/GetList`,
  DATA_MAINTENANCE_GET_PCR_OPTIONS: `${API_URL}/DataMaintenance/GetPcrOptions`,
  DATA_MAINTENANCE_BIND_PCR: `${API_URL}/DataMaintenance/BindPcr`,
  MATERIAL_IMPORT: `${API_URL}/Material/Import`,
  MATERIAL_IMPORT_TEMPLATE: `${API_URL}/Material/DownloadImportTemplate`,
  MATERIAL_MST: `${API_URL}/Material`,
  MATERIAL_MAINTENANCE_GET_MODEL: `${API_URL}/MaterialMaintenance/GetModel`,
  MATERIAL_MAINTENANCE_GET_SOURCE_SELECT_LIST: `${API_URL}/MaterialMaintenance/GetSourceSelectListItems`,
  MATERIAL_MAINTENANCE_ADD_YEAR: `${API_URL}/MaterialMaintenance/AddYear`,
  MATERIAL_MAINTENANCE_ADD_SOURCE: `${API_URL}/MaterialMaintenance/AddSource`,
  MATERIAL_MAINTENANCE_DELETE_YEAR: `${API_URL}/MaterialMaintenance/DeleteYear`,
  MATERIAL_MAINTENANCE_DELETE_SOURCE: `${API_URL}/MaterialMaintenance/DeleteSource`,
  MATERIAL_MAINTENANCE_GET_SOURCE_ACCREDITATION_LEVEL: `${API_URL}/MaterialMaintenance/GetSourceAccreditationLevel`,
  MATERIAL_MAINTENANCE_SET_SOURCE_ACCREDITATION_LEVEL: `${API_URL}/MaterialMaintenance/SetSourceAccreditationLevel`,
  MATERIAL_MAINTENANCE_SET_SOURCE_ACCREDITED: `${API_URL}/MaterialMaintenance/SetSourceAccredited`,
  MATERIAL_MAINTENANCE_GET_SOURCE_OPINIONS: `${API_URL}/MaterialMaintenance/GetSourceOpinions`,
  MATERIAL_MAINTENANCE_ADD_SOURCE_OPINION: `${API_URL}/MaterialMaintenance/AddSourceOpinion`,
  MATERIAL_MAINTENANCE_GET_SECONDARY_DATA_OPTIONS: `${API_URL}/MaterialMaintenance/GetSecondaryDataOptions`,
  MATERIAL_MAINTENANCE_APPLY_SECONDARY_DATA: `${API_URL}/MaterialMaintenance/ApplySecondaryData`,
  MATERIAL_MAINTENANCE_NOTIFY_SUPPLIER: `${API_URL}/MaterialMaintenance/NotifySupplier`,

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
  SELLER_IMPORT: `${API_URL}/SellerCompare/Import`,
  SELLER_IMPORT_TEMPLATE: `${API_URL}/SellerCompare/DownloadImportTemplate`,

  // ===== 建置通知 =====
  MATERIAL_NOTIFY_GET_LIST: `${API_URL}/MaterialNotify/GetList`,
  MATERIAL_NOTIFY_ADD: `${API_URL}/MaterialNotify/AddNotify`,

  // ===== 碳排資料維護 =====
  PCR_TEMPLATE_CREATE: `${API_URL}/PcrTemplate/Create`,
  PCR_TEMPLATE_EDIT: `${API_URL}/PcrTemplate/Edit`,
  PCR_TEMPLATE_GET_MODEL: `${API_URL}/PcrTemplate/GetModel`,
  PCR_TEMPLATE_GET_LIST: `${API_URL}/PcrTemplate/GetList`,
  PCR_TEMPLATE_MST: `${API_URL}/PcrTemplate`,
  PCR_PATTERN_CREATE: `${API_URL}/PcrPattern/Create`,
  PCR_PATTERN_EDIT: `${API_URL}/PcrPattern/Edit`,
  PCR_PATTERN_GET_MODEL: `${API_URL}/PcrPattern/GetModel`,
  PCR_PATTERN_GET_LIST: `${API_URL}/PcrPattern/GetList`,
  PCR_PATTERN_MST: `${API_URL}/PcrPattern`,
  PRODUCT_SUBCATEGORY_CREATE: `${API_URL}/ProductSubcategory/Create`,
  PRODUCT_SUBCATEGORY_EDIT: `${API_URL}/ProductSubcategory/Edit`,
  PRODUCT_SUBCATEGORY_GET_MODEL: `${API_URL}/ProductSubcategory/GetModel`,
  PRODUCT_SUBCATEGORY_GET_LIST: `${API_URL}/ProductSubcategory/GetList`,
  PRODUCT_SUBCATEGORY_MST: `${API_URL}/ProductSubcategory`,
  PRODUCT_SUBCATEGORY_GET_PCR_PATTERN: `${API_URL}/ProductSubcategory/GetPcrPattern`,
  PRODUCT_SUBCATEGORY_GET_PCR_PATTERN_OWNERS: `${API_URL}/ProductSubcategory/GetPcrPatternOwners`,
  PRODUCT_SUBCATEGORY_GET_SHARED_PCR_PATTERN: `${API_URL}/ProductSubcategory/GetSharedPcrPattern`,
  PRODUCT_SUBCATEGORY_SYNC_PCR_PATTERN: `${API_URL}/ProductSubcategory/SyncPcrPattern`,
  PRODUCT_SUBCATEGORY_ENSURE_PCR_PATTERN: `${API_URL}/ProductSubcategory/EnsurePcrPattern`,
  PRODUCT_SUBCATEGORY_GET_PCR_PATTERN_MODEL: `${API_URL}/ProductSubcategory/GetPcrPatternModel`,
  PRODUCT_SUBCATEGORY_CREATE_PCR_PATTERN: `${API_URL}/ProductSubcategory/CreatePcrPattern`,
  PRODUCT_SUBCATEGORY_EDIT_PCR_PATTERN: `${API_URL}/ProductSubcategory/EditPcrPattern`,
  PRODUCT_SUBCATEGORY_PCR_PATTERN_IMPORT: `${API_URL}/ProductSubcategory/ImportPcrPattern`,
  PRODUCT_SUBCATEGORY_PCR_PATTERN_IMPORT_TEMPLATE: `${API_URL}/ProductSubcategory/DownloadPcrPatternImportTemplate`,
  CARBON_FACTOR_MAINTENANCE_GET_MODEL: `${API_URL}/CarbonFactorMaintenance/GetModel`,
  CARBON_FACTOR_MAINTENANCE_YEAR_ADD: `${API_URL}/CarbonFactorMaintenanceYear/Add`,
  CARBON_FACTOR_MAINTENANCE_YEAR_EDIT: `${API_URL}/CarbonFactorMaintenanceYear/Edit`,
  CARBON_FACTOR_MAINTENANCE_YEAR_DELETE: `${API_URL}/CarbonFactorMaintenanceYear/Delete`,
  CARBON_FACTOR_MAINTENANCE_PLANT_ADD: `${API_URL}/CarbonFactorMaintenancePlant/Create`,
  CARBON_FACTOR_MAINTENANCE_PLANT_EDIT: `${API_URL}/CarbonFactorMaintenancePlant/Edit`,
  CARBON_FACTOR_MAINTENANCE_PLANT_DELETE: `${API_URL}/CarbonFactorMaintenancePlant/Delete`,
  CARBON_FACTOR_MAINTENANCE_PLANT_GET_EDIT_MODEL: `${API_URL}/CarbonFactorMaintenancePlant/GetModel`,
  CARBON_FACTOR_MAINTENANCE_PLANT_GET_CREATE_MODEL: `${API_URL}/CarbonFactorMaintenancePlant/GetNewModel`,
  CARBON_FACTOR_MAINTENANCE_PLANT_GET_ACCREDITATION_VERIFICATION_MODEL: `${API_URL}/CarbonFactorMaintenancePlant/GetAccreditationVerificationModel`,
  CARBON_FACTOR_MAINTENANCE_PLANT_GET_LIST: `${API_URL}/CarbonFactorMaintenancePlant/GetList`,
  CARBON_FACTOR_MAINTENANCE_PLANT_GET_PENDING_OPINIONS: `${API_URL}/CarbonFactorMaintenancePlant/GetPendingOpinions`,
  CARBON_FACTOR_MAINTENANCE_PLANT_DOWNLOAD_ATTACHMENT: `${API_URL}/CarbonFactorMaintenancePlant/DownloadAttachment`,
  CARBON_FACTOR_MAINTENANCE_PLANT_UPDATE_OPINION: `${API_URL}/CarbonFactorMaintenancePlant/UpdateOpinion`,
  SECONDARY_DATA_COMPARE_CREATE: `${API_URL}/SecondaryDataCompare/Create`,
  SECONDARY_DATA_COMPARE_EDIT: `${API_URL}/SecondaryDataCompare/Edit`,
  SECONDARY_DATA_COMPARE_GET_MODEL: `${API_URL}/SecondaryDataCompare/GetModel`,
  SECONDARY_DATA_COMPARE_GET_NEW_MODEL: `${API_URL}/SecondaryDataCompare/GetNewModel`,
  SECONDARY_DATA_COMPARE_GET_LIST: `${API_URL}/SecondaryDataCompare/GetList`,
  SECONDARY_DATA_COMPARE_DELETE: `${API_URL}/SecondaryDataCompare/Delete`,
  SECONDARY_DATA_COMPARE_GET_OPTIONS: `${API_URL}/SecondaryDataCompare/GetSecondaryDataOptions`,
  SECONDARY_DATA_COMPARE_SAVE_BATCH: `${API_URL}/SecondaryDataCompare/SaveBatch`,
  PRODUCT_SUBCATEGORY_DELETE_PCR_PATTERN: `${API_URL}/ProductSubcategory/DeletePcrPattern`,
  BUYER_ACCREDITATION_LEVEL_CREATE: `${API_URL}/BuyerAccreditationLevel/Create`,
  BUYER_ACCREDITATION_LEVEL_EDIT: `${API_URL}/BuyerAccreditationLevel/Edit`,
  BUYER_ACCREDITATION_LEVEL_GET_MODEL: `${API_URL}/BuyerAccreditationLevel/GetModel`,
  BUYER_ACCREDITATION_LEVEL_GET_NEW_MODEL: `${API_URL}/BuyerAccreditationLevel/GetNewModel`,
  BUYER_ACCREDITATION_LEVEL_GET_LIST: `${API_URL}/BuyerAccreditationLevel/GetList`,
  BUYER_ACCREDITATION_LEVEL_MST: `${API_URL}/BuyerAccreditationLevel`,
  SECONDARY_DATA_SETTING_CREATE: `${API_URL}/SecondaryDataSetting/Create`,
  SECONDARY_DATA_SETTING_EDIT: `${API_URL}/SecondaryDataSetting/Edit`,
  SECONDARY_DATA_SETTING_GET_MODEL: `${API_URL}/SecondaryDataSetting/GetModel`,
  SECONDARY_DATA_SETTING_GET_LIST: `${API_URL}/SecondaryDataSetting/GetList`,
  SECONDARY_DATA_SETTING_DELETE: `${API_URL}/SecondaryDataSetting/Delete`,
  SECONDARY_DATA_SETTING_SYNC_API: `${API_URL}/SecondaryDataSetting/SyncApi`,
  SECONDARY_DATA_SETTING_MST: `${API_URL}/SecondaryDataSetting`,
  CONSULTANT_GET_LIST: `${API_URL}/Consultant/GetList`,
  CONSULTANT_RESERVE_ACCREDITATION: `${API_URL}/Consultant/ReserveAccreditation`,
  CONSULTANT_GET_REGISTRATION_STATUS: `${API_URL}/Consultant/GetRegistrationStatus`,
  CONSULTANT_REGISTER: `${API_URL}/Consultant/Register`,
  MATERIAL_DEMAND_GET_LIST: `${API_URL}/MaterialDemand/GetList`,
  MATERIAL_DEMAND_GET_ACCREDITED_CONSULTANT_OPTIONS: `${API_URL}/MaterialDemand/GetAccreditedConsultantOptions`,
  MATERIAL_DEMAND_RESERVE_CONSULTANT: `${API_URL}/MaterialDemand/ReserveConsultant`,
  MATERIAL_DEMAND_REPLY_NEGOTIATION: `${API_URL}/MaterialDemand/ReplyNegotiation`,
  MATERIAL_DEMAND_SELLER_AGREE: `${API_URL}/MaterialDemand/SellerAgree`,
  MATERIAL_DEMAND_ACCREDIT: `${API_URL}/MaterialDemand/Accredit`,

};
