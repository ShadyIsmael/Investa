import { api } from '@/services/api';
import { bool, num, str, unwrapList, type RawRecord } from '@/services/adminServiceFactory';

export interface ProjectStageMetadataItem {
  code: string;
  value: number;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  isActive: boolean;
  allowsCustomName: boolean;
}

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const mapItem = (item: RawRecord): ProjectStageMetadataItem => ({
  code: str(read(item, 'code', 'Code')),
  value: num(read(item, 'value', 'Value')),
  nameEn: str(read(item, 'nameEn', 'NameEn')),
  nameAr: str(read(item, 'nameAr', 'NameAr')),
  sortOrder: num(read(item, 'sortOrder', 'SortOrder')),
  isActive: bool(read(item, 'isActive', 'IsActive')),
  allowsCustomName: bool(read(item, 'allowsCustomName', 'AllowsCustomName')),
});

export const projectStageMetadataService = {
  async list(): Promise<ProjectStageMetadataItem[]> {
    const response: unknown = await api.get<unknown>('/api/v1/project-stages');
    return unwrapList(response, mapItem);
  },
};
