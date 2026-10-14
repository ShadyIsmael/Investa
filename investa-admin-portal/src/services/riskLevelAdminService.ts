import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface RiskLevelAdminItem {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder: number;
  isActive: boolean;
  referenceCount: number;
}

export interface RiskLevelAdminInput {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sortOrder: number;
}

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const map = (item: RawRecord): RiskLevelAdminItem => ({
  id: num(read(item, 'id', 'Id')),
  code: str(read(item, 'code', 'Code')),
  nameEn: str(read(item, 'nameEn', 'NameEn')),
  nameAr: str(read(item, 'nameAr', 'NameAr')),
  descriptionEn: nullableStr(read(item, 'descriptionEn', 'DescriptionEn')),
  descriptionAr: nullableStr(read(item, 'descriptionAr', 'DescriptionAr')),
  sortOrder: num(read(item, 'sortOrder', 'SortOrder')),
  isActive: bool(read(item, 'isActive', 'IsActive')),
  referenceCount: num(read(item, 'referenceCount', 'ReferenceCount')),
});

export const riskLevelAdminService = createAdminService<
  RiskLevelAdminItem,
  RiskLevelAdminInput,
  RiskLevelAdminInput,
  number
>({
  basePath: '/api/v1/admin/risk-levels',
  map,
});
