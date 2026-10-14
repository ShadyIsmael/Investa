import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface CountryAdminItem {
  id: number; code: string; isoAlpha2: string; isoAlpha3?: string | null; nameEn: string; nameAr: string;
  phoneCode?: string | null; sortOrder: number; isActive: boolean; referenceCount: number;
  createdAt?: string; updatedAt?: string;
}
export interface CountryInput { isoAlpha2?: string; isoAlpha3?: string; nameEn: string; nameAr: string; phoneCode?: string; sortOrder: number; isActive?: boolean; }

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const mapCountry = (value: RawRecord): CountryAdminItem => ({
  id: num(read(value, 'id', 'Id')),
  code: str(read(value, 'code', 'Code')),
  isoAlpha2: str(read(value, 'isoAlpha2', 'IsoAlpha2')),
  isoAlpha3: nullableStr(read(value, 'isoAlpha3', 'IsoAlpha3')),
  nameEn: str(read(value, 'nameEn', 'NameEn')),
  nameAr: str(read(value, 'nameAr', 'NameAr')),
  phoneCode: nullableStr(read(value, 'phoneCode', 'PhoneCode')),
  sortOrder: num(read(value, 'sortOrder', 'SortOrder')),
  isActive: bool(read(value, 'isActive', 'IsActive')),
  referenceCount: num(read(value, 'referenceCount', 'ReferenceCount')),
  createdAt: read(value, 'createdAt', 'CreatedAt') as string | undefined,
  updatedAt: read(value, 'updatedAt', 'UpdatedAt') as string | undefined,
});

type CountryCreate = Required<Pick<CountryInput, 'isoAlpha2' | 'nameEn' | 'nameAr'>> & CountryInput;
type CountryUpdate = Omit<CountryInput, 'isoAlpha2'>;

export const countryAdminService = createAdminService<CountryAdminItem, CountryCreate, CountryUpdate, number>({
  basePath: '/api/v1/admin/countries',
  map: mapCountry,
});
