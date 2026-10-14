import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface FundingGoalAdminItem {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder: number;
  isActive: boolean;
  referenceCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FundingGoalAdminInput {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sortOrder: number;
}

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const mapFundingGoal = (item: RawRecord): FundingGoalAdminItem => ({
  id: num(read(item, 'id', 'Id')),
  code: str(read(item, 'code', 'Code')),
  nameEn: str(read(item, 'nameEn', 'NameEn')),
  nameAr: str(read(item, 'nameAr', 'NameAr')),
  descriptionEn: nullableStr(read(item, 'descriptionEn', 'DescriptionEn')),
  descriptionAr: nullableStr(read(item, 'descriptionAr', 'DescriptionAr')),
  sortOrder: num(read(item, 'sortOrder', 'SortOrder')),
  isActive: bool(read(item, 'isActive', 'IsActive')),
  referenceCount: num(read(item, 'referenceCount', 'ReferenceCount')),
  createdAt: read(item, 'createdAt', 'CreatedAt') as string | undefined,
  updatedAt: read(item, 'updatedAt', 'UpdatedAt') as string | undefined,
});

export const fundingGoalAdminService = createAdminService<
  FundingGoalAdminItem,
  FundingGoalAdminInput,
  FundingGoalAdminInput,
  number
>({
  basePath: '/api/v1/admin/funding-goals',
  map: mapFundingGoal,
});
