export interface ConsultantRow {
  id: string;
  name: string;
  certificationMode: string;
  experienceIndustryCategory?: string | null;
  customerRating?: number | string | null;
  organizationGuidanceCount?: number | null;
  organizationAuditCount?: number | null;
  organizationReviewCount?: number | null;
  organizationCertificationCount?: number | null;
  isAccredited: boolean | number | string;
}

export interface ConsultantRegistrationForm {
  name: string;
  certificationMode: string;
  experienceIndustryCategory: string;
  customerRating: string;
  organizationGuidanceCount: string;
  organizationAuditCount: string;
  organizationReviewCount: string;
  organizationCertificationCount: string;
}

export interface ConsultantRegistrationStatus {
  hasRegistration: boolean;
  status: 'none' | 'pending' | 'accredited';
  isAccredited: boolean;
  consultant: Omit<ConsultantRegistrationForm, 'customerRating' | 'organizationGuidanceCount' | 'organizationAuditCount' | 'organizationReviewCount' | 'organizationCertificationCount'> & {
    customerRating?: number | null;
    organizationGuidanceCount?: number | null;
    organizationAuditCount?: number | null;
    organizationReviewCount?: number | null;
    organizationCertificationCount?: number | null;
  } | null;
}
