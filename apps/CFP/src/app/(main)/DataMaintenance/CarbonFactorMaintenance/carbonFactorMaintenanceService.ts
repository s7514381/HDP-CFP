import { API_MAP } from '@/lib/apiRoutes';
import { UseApiResult } from '@packages/types/useApi';

export interface CarbonFactorMaintenancePlant {
  id: string;
  plantName: string;
  allocationPercentage: number;
  carbonFactor: number;
  thirdPartyCertificationYear: number | null;
  attachments: CarbonFactorMaintenanceAttachment[];
}

export interface CarbonFactorMaintenanceAttachment {
  uploadFileId: string;
  attachmentType: 'ThirdPartyReport' | 'SelfSummaryReport' | 'PcrEvidence';
  originalFileName: string;
  contentType: string;
  fileSize: number;
  opinion?: string | null;
}

export type PcrTemplateCategory = 0 | 1 | 2 | 3;

export interface CarbonFactorMaintenancePcrEvidenceItem {
  pcrPatternId: string;
  category: PcrTemplateCategory;
  item: string;
  childItems: string[];
  attachment: CarbonFactorMaintenanceAttachment | null;
}

export interface CarbonFactorMaintenancePcrEvidenceCategory {
  category: PcrTemplateCategory;
  items: CarbonFactorMaintenancePcrEvidenceItem[];
}

export interface CarbonFactorMaintenancePlantEditModel {
  id: string;
  materialId: string;
  buyerMaterialId: string;
  yearId: string;
  materialNumber: string;
  productName: string;
  buyerName: string;
  buyerMaterialNumber: string;
  year: number;
  productUnit: string;
  plantName: string;
  allocationPercentage: number;
  carbonFactor: number;
  thirdPartyCertificationYear: number | null;
  attachments: CarbonFactorMaintenanceAttachment[];
  pcrEvidenceCategories: CarbonFactorMaintenancePcrEvidenceCategory[];
}

export interface CarbonFactorMaintenanceYear {
  id: string;
  year: number;
  productUnit: string;
  carbonFactor: number | null;
  plants: CarbonFactorMaintenancePlant[];
}

export interface CarbonFactorMaintenanceBuyer {
  buyerMaterialId: string;
  buyerName: string;
  buyerMaterialNumber: string;
  years: CarbonFactorMaintenanceYear[];
}

export interface CarbonFactorMaintenanceModel {
  materialId: string;
  materialNumber: string;
  productName: string;
  buyers: CarbonFactorMaintenanceBuyer[];
}

export interface CarbonFactorMaintenanceYearRequest {
  id?: string;
  materialId: string;
  buyerMaterialId: string;
  year: number;
  productUnit: string;
}

export interface CarbonFactorMaintenancePlantRequest {
  id?: string;
  yearId: string;
  plantName: string;
  allocationPercentage: number;
  carbonFactor: number;
  thirdPartyCertificationYear: number;
  thirdPartyReport?: File | null;
  selfSummaryReport?: File | null;
  evidenceFiles?: File[];
  evidencePcrPatternIds?: string[];
  removeEvidencePcrPatternIds?: string[];
  removeThirdPartyReport?: boolean;
  removeSelfSummaryReport?: boolean;
}

export interface CarbonFactorMaintenanceService {
  getModel(materialId: string): Promise<ServiceResponse<CarbonFactorMaintenanceModel>>;
  addYear(request: CarbonFactorMaintenanceYearRequest): Promise<ServiceResponse<unknown>>;
  editYear(request: CarbonFactorMaintenanceYearRequest): Promise<ServiceResponse<unknown>>;
  deleteYear(id: string): Promise<ServiceResponse<unknown>>;
  addPlant(request: CarbonFactorMaintenancePlantRequest): Promise<ServiceResponse<unknown>>;
  editPlant(request: CarbonFactorMaintenancePlantRequest): Promise<ServiceResponse<unknown>>;
  deletePlant(id: string): Promise<ServiceResponse<unknown>>;
  getPlantEditModel(id: string): Promise<ServiceResponse<CarbonFactorMaintenancePlantEditModel>>;
  getPlantCreateModel(yearId: string): Promise<ServiceResponse<CarbonFactorMaintenancePlantEditModel>>;
  updateOpinion(uploadFileId: string, opinion: string): Promise<ServiceResponse<unknown>>;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

type FormPost = UseApiResult['formPost'];

export function createCarbonFactorMaintenanceService(formPost: FormPost): CarbonFactorMaintenanceService {
  const post = async <T>(url: string, data: Record<string, unknown>): Promise<ServiceResponse<T>> => {
    const result = await formPost<T>(url, data);
    return {
      success: result.success,
      message: result.message,
      data: result.success && result.data && !(typeof Blob !== 'undefined' && result.data instanceof Blob)
        ? result.data
        : null,
    };
  };

  return {
    getModel: (materialId) => post<CarbonFactorMaintenanceModel>(API_MAP.CARBON_FACTOR_MAINTENANCE_GET_MODEL, { materialId }),
    addYear: (request) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_YEAR_ADD, request as unknown as Record<string, unknown>),
    editYear: (request) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_YEAR_EDIT, request as unknown as Record<string, unknown>),
    deleteYear: (id) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_YEAR_DELETE, { id }),
    addPlant: (request) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_ADD, request as unknown as Record<string, unknown>),
    editPlant: (request) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_EDIT, request as unknown as Record<string, unknown>),
    deletePlant: (id) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_DELETE, { id }),
    getPlantEditModel: (id) => post<CarbonFactorMaintenancePlantEditModel>(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_EDIT_MODEL, { id }),
    getPlantCreateModel: (yearId) => post<CarbonFactorMaintenancePlantEditModel>(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_CREATE_MODEL, { yearId }),
    updateOpinion: (uploadFileId, opinion) => post(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_UPDATE_OPINION, { uploadFileId, opinion }),
  };
}
