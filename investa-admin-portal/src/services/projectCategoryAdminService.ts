import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface ProjectCategoryAdminItem {
  id: number; code: string; nameEn: string; nameAr: string; descriptionEn?: string | null; descriptionAr?: string | null;
  sortOrder: number; isActive: boolean; projectCount: number; investmentCount: number; clientCount: number; referenceCount: number;
  createdAt: string; updatedAt?: string | null;
}
export interface ProjectCategoryInput { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string; sortOrder: number; }

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const mapItem = (value: RawRecord): ProjectCategoryAdminItem => ({
  id: num(read(value, 'id', 'Id')),
  code: str(read(value, 'code', 'Code')),
  nameEn: str(read(value, 'nameEn', 'NameEn')),
  nameAr: str(read(value, 'nameAr', 'NameAr')),
  descriptionEn: nullableStr(read(value, 'descriptionEn', 'DescriptionEn')),
  descriptionAr: nullableStr(read(value, 'descriptionAr', 'DescriptionAr')),
  sortOrder: num(read(value, 'sortOrder', 'SortOrder')),
  isActive: bool(read(value, 'isActive', 'IsActive')),
  projectCount: num(read(value, 'projectCount', 'ProjectCount')),
  investmentCount: num(read(value, 'investmentCount', 'InvestmentCount')),
  clientCount: num(read(value, 'clientCount', 'ClientCount')),
  referenceCount: num(read(value, 'referenceCount', 'ReferenceCount')),
  createdAt: str(read(value, 'createdAt', 'CreatedAt')),
  updatedAt: nullableStr(read(value, 'updatedAt', 'UpdatedAt')),
});

export const projectCategoryAdminService = createAdminService<
  ProjectCategoryAdminItem,
  ProjectCategoryInput,
  ProjectCategoryInput,
  number
>({
  basePath: '/api/v1/admin/project-categories',
  map: mapItem,
});
