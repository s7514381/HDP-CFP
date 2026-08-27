import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { PcrTemplateCategory } from '@/types/pcrTemplate';

export const PCR_TEMPLATE_CATEGORY_OPTIONS = [
  { value: PcrTemplateCategory.Material, languageKey: LANGUAGE_KEYS.pcrTemplate.material },
  { value: PcrTemplateCategory.Process, languageKey: LANGUAGE_KEYS.pcrTemplate.process },
  { value: PcrTemplateCategory.Transport, languageKey: LANGUAGE_KEYS.pcrTemplate.transport },
  { value: PcrTemplateCategory.Waste, languageKey: LANGUAGE_KEYS.pcrTemplate.waste },
] as const;
