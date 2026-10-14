import { api } from '@/services/api';
import {
  bool,
  createAdminService,
  num,
  nullableStr,
  str,
  unwrapEnvelope,
  type RawRecord,
} from '@/services/adminServiceFactory';

export interface FileCategoryAdminItem {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder: number;
  isActive: boolean;
  maxFileSizeBytes: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxFilesPerEntity?: number | null;
  referenceCount: number;
}

export interface FileCategoryAdminInput {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sortOrder: number;
  maxFileSizeBytes: number;
  allowedExtensions: string;
  allowedMimeTypes: string;
  maxFilesPerEntity?: number | null;
}

export interface FileStoragePolicyAdmin {
  globalMaxFileSizeBytes: number;
  defaultUserQuotaBytes: number;
  defaultProjectQuotaBytes: number;
  updatedAt?: string;
}

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return String(value ?? '')
    .split(/[,;\n\r]/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const map = (item: RawRecord): FileCategoryAdminItem => ({
  id: num(read(item, 'id', 'Id')),
  code: str(read(item, 'code', 'Code')),
  nameEn: str(read(item, 'nameEn', 'NameEn')),
  nameAr: str(read(item, 'nameAr', 'NameAr')),
  descriptionEn: nullableStr(read(item, 'descriptionEn', 'DescriptionEn')),
  descriptionAr: nullableStr(read(item, 'descriptionAr', 'DescriptionAr')),
  sortOrder: num(read(item, 'sortOrder', 'SortOrder')),
  isActive: bool(read(item, 'isActive', 'IsActive')),
  maxFileSizeBytes: num(read(item, 'maxFileSizeBytes', 'MaxFileSizeBytes')),
  allowedExtensions: toStringList(read(item, 'allowedExtensions', 'AllowedExtensions')),
  allowedMimeTypes: toStringList(read(item, 'allowedMimeTypes', 'AllowedMimeTypes')),
  maxFilesPerEntity:
    read(item, 'maxFilesPerEntity', 'MaxFilesPerEntity') === null ||
    read(item, 'maxFilesPerEntity', 'MaxFilesPerEntity') === undefined
      ? null
      : num(read(item, 'maxFilesPerEntity', 'MaxFilesPerEntity')),
  referenceCount: num(read(item, 'referenceCount', 'ReferenceCount')),
});

const crud = createAdminService<FileCategoryAdminItem, FileCategoryAdminInput, FileCategoryAdminInput, number>({
  basePath: '/api/v1/admin/file-categories',
  map,
});

export const fileCategoryAdminService = {
  ...crud,
  async getPolicy(): Promise<FileStoragePolicyAdmin> {
    const raw = (unwrapEnvelope(await api.get<unknown>('/api/v1/admin/file-storage-policy')) ?? {}) as RawRecord;
    return {
      globalMaxFileSizeBytes: num(read(raw, 'globalMaxFileSizeBytes', 'GlobalMaxFileSizeBytes')),
      defaultUserQuotaBytes: num(read(raw, 'defaultUserQuotaBytes', 'DefaultUserQuotaBytes')),
      defaultProjectQuotaBytes: num(read(raw, 'defaultProjectQuotaBytes', 'DefaultProjectQuotaBytes')),
      updatedAt: read(raw, 'updatedAt', 'UpdatedAt') as string | undefined,
    };
  },
  async updatePolicy(input: FileStoragePolicyAdmin): Promise<FileStoragePolicyAdmin> {
    const raw = (unwrapEnvelope(await api.put<unknown>('/api/v1/admin/file-storage-policy', input)) ?? {}) as RawRecord;
    return {
      globalMaxFileSizeBytes: num(read(raw, 'globalMaxFileSizeBytes', 'GlobalMaxFileSizeBytes')),
      defaultUserQuotaBytes: num(read(raw, 'defaultUserQuotaBytes', 'DefaultUserQuotaBytes')),
      defaultProjectQuotaBytes: num(read(raw, 'defaultProjectQuotaBytes', 'DefaultProjectQuotaBytes')),
      updatedAt: read(raw, 'updatedAt', 'UpdatedAt') as string | undefined,
    };
  },
};
