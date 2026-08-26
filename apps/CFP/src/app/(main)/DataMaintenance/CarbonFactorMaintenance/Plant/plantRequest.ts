import { CarbonFactorMaintenancePlantRequest } from '../carbonFactorMaintenanceService';
import { PlantFormData } from './PlantContent';

export function toCarbonFactorMaintenancePlantRequest(data: PlantFormData): CarbonFactorMaintenancePlantRequest {
  return {
    id: data.id,
    yearId: data.yearId,
    plantName: data.plantName.trim(),
    allocationPercentage: Number(data.allocationPercentage),
    carbonFactor: Number(data.carbonFactor),
    thirdPartyCertificationYear: Number(data.thirdPartyCertificationYear),
    thirdPartyReport: data.thirdPartyReport,
    selfSummaryReport: data.selfSummaryReport,
    evidenceFiles: data.evidenceUploads.map((upload) => upload.file),
    evidencePcrPatternIds: data.evidenceUploads.map((upload) => upload.pcrPatternId),
    removeEvidencePcrPatternIds: data.removeEvidencePcrPatternIds,
    removeThirdPartyReport: data.removeThirdPartyReport,
    removeSelfSummaryReport: data.removeSelfSummaryReport,
  };
}
