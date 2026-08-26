import { API_MAP } from '@/lib/apiRoutes';
import { UseApiResult } from '@packages/types/useApi';
import { ServiceResponse } from './materialMaintenanceService';

export interface MaterialMaintenanceSourceOpinion {
  id: string;
  content: string;
  createDate: string | null;
  createUserName: string;
}

export interface MaterialMaintenanceSourceOpinionPageModel {
  sourceId: string;
  materialId: string;
  year: number;
  supplierName: string;
  productName: string;
  canAddOpinion: boolean;
  opinions: MaterialMaintenanceSourceOpinion[];
}

export interface AddSourceOpinionRequest {
  sourceId: string;
  content: string;
}

type FormPost = UseApiResult['formPost'];

export interface MaterialMaintenanceOpinionService {
  getModel(sourceId: string): Promise<ServiceResponse<MaterialMaintenanceSourceOpinionPageModel>>;
  addOpinion(request: AddSourceOpinionRequest): Promise<ServiceResponse<unknown>>;
}

const post = async <T>(
  formPost: FormPost,
  url: string,
  data: Record<string, unknown>,
): Promise<ServiceResponse<T>> => {
  const result = await formPost<T>(url, data);
  return {
    success: result.success,
    message: result.message,
    data: result.success && result.data !== null && !(typeof Blob !== 'undefined' && result.data instanceof Blob)
      ? result.data
      : null,
  };
};

export function createMaterialMaintenanceOpinionService(formPost: FormPost): MaterialMaintenanceOpinionService {
  return {
    getModel: (sourceId) => post<MaterialMaintenanceSourceOpinionPageModel>(
      formPost,
      API_MAP.MATERIAL_MAINTENANCE_GET_SOURCE_OPINIONS,
      { id: sourceId },
    ),
    addOpinion: (request) => post(
      formPost,
      API_MAP.MATERIAL_MAINTENANCE_ADD_SOURCE_OPINION,
      { ...request },
    ),
  };
}
