import { API_MAP } from '@/lib/apiRoutes';
import { MaterialDemandType } from '@/types/materialDemand';
import { UseApiResult } from '@packages/types/useApi';

type FormPost = UseApiResult['formPost'];

export interface ReserveMaterialDemandRequest {
  carbonFactorMaintenancePlantId: string;
  consultantId: string;
  demandType: MaterialDemandType;
  demandPrice: number;
  isUrgent: boolean;
}

export function reserveMaterialDemand(formPost: FormPost, request: ReserveMaterialDemandRequest) {
  return formPost<boolean>(API_MAP.MATERIAL_DEMAND_RESERVE_CONSULTANT, request);
}
