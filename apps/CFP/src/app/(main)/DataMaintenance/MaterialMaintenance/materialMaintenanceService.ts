import { API_MAP } from '@/lib/apiRoutes';
import { MaterialMaintenanceModel, SupplierOption } from '@/types/materialMaintenance';
import { UseApiResult } from '@packages/types/useApi';

export interface AddYearRequest {
  materialId: string;
  pcrPatternId: string;
  year: number;
}

export interface AddSourceRequest {
  materialMaintenanceYearId: string;
  supplierId: string;
  productName: string;
  allocationPercentage: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

export interface MaterialMaintenanceService {
  getModel(materialId: string): Promise<ServiceResponse<MaterialMaintenanceModel>>;
  getSuppliers(): Promise<ServiceResponse<SupplierOption[]>>;
  addYear(request: AddYearRequest): Promise<ServiceResponse<unknown>>;
  addSource(request: AddSourceRequest): Promise<ServiceResponse<unknown>>;
  deleteYear(id: string): Promise<ServiceResponse<unknown>>;
  deleteSource(id: string): Promise<ServiceResponse<unknown>>;
}

type FormPost = UseApiResult['formPost'];

const isBlob = (value: unknown): value is Blob => (
  typeof Blob !== 'undefined' && value instanceof Blob
);

const normalizeResponse = <T>(result: Awaited<ReturnType<FormPost>>): ServiceResponse<T> => {
  const payload = result.data;
  const data = payload !== null && !isBlob(payload)
    ? payload as T
    : null;

  return {
    success: result.success,
    message: result.message,
    data,
  };
};

export function createMaterialMaintenanceService(formPost: FormPost): MaterialMaintenanceService {
  const post = async <T>(url: string, data: Record<string, unknown>): Promise<ServiceResponse<T>> => (
    normalizeResponse<T>(await formPost<T>(url, data))
  );

  return {
    getModel: (materialId) => post<MaterialMaintenanceModel>(
      API_MAP.MATERIAL_MAINTENANCE_GET_MODEL,
      { materialId },
    ),
    getSuppliers: () => post<SupplierOption[]>(API_MAP.SUPPLIER_GET_SELECT_LIST, {}),
    addYear: (request) => post(API_MAP.MATERIAL_MAINTENANCE_ADD_YEAR, { ...request }),
    addSource: (request) => post(API_MAP.MATERIAL_MAINTENANCE_ADD_SOURCE, { ...request }),
    deleteYear: (id) => post(API_MAP.MATERIAL_MAINTENANCE_DELETE_YEAR, { id }),
    deleteSource: (id) => post(API_MAP.MATERIAL_MAINTENANCE_DELETE_SOURCE, { id }),
  };
}
