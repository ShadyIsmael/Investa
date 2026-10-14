import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface OpportunityTagUsage { totalReferences: number; isReferenced: boolean; }
export interface OpportunityTagAdminItem {
  id: number; code: string; nameEn: string; nameAr: string; descriptionEn?: string | null; descriptionAr?: string | null;
  sortOrder: number; isActive: boolean; referenceCount: number;
  createdAt: string; updatedAt?: string | null; createdByUserId?: string | null; updatedByUserId?: string | null;
}
export interface OpportunityTagInput { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string; sortOrder: number; }

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const mapItem = (value: RawRecord): OpportunityTagAdminItem => ({
  id: num(read(value, 'id', 'Id')),
  code: str(read(value, 'code', 'Code')),
  nameEn: str(read(value, 'nameEn', 'NameEn')),
  nameAr: str(read(value, 'nameAr', 'NameAr')),
  descriptionEn: nullableStr(read(value, 'descriptionEn', 'DescriptionEn')),
  descriptionAr: nullableStr(read(value, 'descriptionAr', 'DescriptionAr')),
  sortOrder: num(read(value, 'sortOrder', 'SortOrder')),
  isActive: bool(read(value, 'isActive', 'IsActive')),
  referenceCount: num(read(value, 'referenceCount', 'ReferenceCount')),
  createdAt: str(read(value, 'createdAt', 'CreatedAt')),
  updatedAt: nullableStr(read(value, 'updatedAt', 'UpdatedAt')),
  createdByUserId: nullableStr(read(value, 'createdByUserId', 'CreatedByUserId')),
  updatedByUserId: nullableStr(read(value, 'updatedByUserId', 'UpdatedByUserId')),
});

export const opportunityTagAdminService = createAdminService<
  OpportunityTagAdminItem,
  OpportunityTagInput,
  OpportunityTagInput,
  number
>({
  basePath: '/api/v1/admin/opportunity-tags',
  map: mapItem,
});
