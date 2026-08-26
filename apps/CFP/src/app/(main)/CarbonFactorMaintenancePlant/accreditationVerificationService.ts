import { API_MAP } from '@/lib/apiRoutes';
import { UseApiResult } from '@packages/types/useApi';

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
  consultantName: string;
  demandPrice: number | string;
  consultantResponsePrice: number | string | null;
  isUrgent: boolean | number | string;
  demandStatus: number | string;
}

type FormPost = UseApiResult['formPost'];

export function getAccreditationVerificationModel(formPost: FormPost, plantId: string) {
  return formPost<AccreditationVerificationPageModel>(
    API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_ACCREDITATION_VERIFICATION_MODEL,
    { id: plantId },
  );
}
