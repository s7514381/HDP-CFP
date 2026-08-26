export interface SecondaryDataSettingRow {
  id: string;
  name: string;
  carbonFactor: number;
  unit: string;
  departmentName?: string | null;
  announcementYear?: number | null;
}

export interface SecondaryDataSettingFormData {
  id?: string;
  name: string;
  carbonFactor: string | number;
  unit: string;
  departmentName: string;
  announcementYear: string | number;
}
