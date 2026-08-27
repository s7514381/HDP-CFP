import { API_MAP } from '@/lib/apiRoutes';
import { UseApiResult } from '@packages/types/useApi';
import { buildTableQuery, parseTableResponse } from '@/components/common/tableUtils';
import { MaterialDemandRow } from '@/types/materialDemand';
import { ConsultantRow } from '@/types/consultant';

export interface AccreditationVerificationAttachment {
  uploadFileId: string;
  attachmentType: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
}

export interface BuyerOpinion {
  id: string;
  content: string;
  createDate: string | null;
  createUserName: string;
}

export interface BuyerAccreditation {
  sourceId: string;
  buyerMaterialId: string;
  buyerMaterialNumber: string;
  buyerName: string;
  buyerProductName: string;
  opinions: BuyerOpinion[];
}

export interface AccreditationVerificationPageModel {
  plantId: string;
  materialNumber: string;
  productName: string;
  year: number;
  plantName: string;
  thirdPartyCertificationYear: number | null;
  thirdPartyReport: AccreditationVerificationAttachment | null;
  buyerAccreditations: BuyerAccreditation[];
  consultantDemands: ConsultantDemand[];
}

export interface ConsultantDemand {
  id: string;
  demandType: number | string;
  consultantId?: string;
  consultantName: string;
  demandPrice: number | string;
  consultantResponsePrice: number | string | null;
  isUrgent: boolean | number | string;
  demandStatus: number | string;
}

type FormPost = UseApiResult['formPost'];
type Post = UseApiResult['post'];

export function getAccreditationVerificationModel(formPost: FormPost, plantId: string) {
  return formPost<AccreditationVerificationPageModel>(
    API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_ACCREDITATION_VERIFICATION_MODEL,
    { id: plantId },
  );
}

export async function getMaterialDemandAccreditationDemands(post: Post, plantId: string): Promise<MaterialDemandRow[]> {
  const response = await post<unknown>(
    `${API_MAP.MATERIAL_DEMAND_GET_LIST}?${buildTableQuery(1, 1000, { DemandType: '0' })}`,
  );
  if (!response.success) {
    throw new Error(response.message || undefined);
  }

  return parseTableResponse<MaterialDemandRow>(response).data.filter((demand) => (
    String(demand.carbonFactorMaintenancePlantId || '').toLowerCase() === plantId.toLowerCase()
    && String(demand.demandType ?? '0') === '0'
  ));
}

export async function getAccreditedConsultantNames(post: Post): Promise<Map<string, string>> {
  const response = await post<unknown>(
    `${API_MAP.CONSULTANT_GET_LIST}?${buildTableQuery(1, 1000, {})}`,
  );
  if (!response.success) {
    throw new Error(response.message || undefined);
  }

  const names = new Map<string, string>();
  parseTableResponse<ConsultantRow>(response).data.forEach((consultant) => {
    names.set(String(consultant.id), consultant.name);
  });
  return names;
}
