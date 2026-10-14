import { bool, createAdminService, num, nullableStr, str, type RawRecord } from '@/services/adminServiceFactory';

export interface CurrencyUsage { totalReferences: number; isReferenced: boolean; }
export interface CurrencyAdminItem {
  isoCode: string; englishName: string; arabicName: string; symbol: string; decimalDigits: number;
  isActive: boolean; supportsFunding: boolean; supportsSettlement: boolean; supportsWallet: boolean;
  createdAt: string; updatedAt?: string | null; createdByUserId?: string | null; updatedByUserId?: string | null;
  usage: CurrencyUsage;
}
export interface CurrencyCreateInput {
  isoCode: string; englishName: string; arabicName: string; symbol: string; decimalDigits: number;
  isActive: boolean; supportsFunding: boolean; supportsSettlement: boolean; supportsWallet: boolean;
}
export type CurrencyUpdateInput = Omit<CurrencyCreateInput, 'isoCode'>;

const read = (value: RawRecord, camel: string, pascal: string): unknown =>
  camel in value ? value[camel] : value[pascal];

const nested = (value: RawRecord, camel: string, pascal: string): RawRecord => {
  const direct = read(value, camel, pascal);
  return (direct ?? {}) as RawRecord;
};

const mapCurrency = (value: RawRecord): CurrencyAdminItem => {
  const usage = nested(value, 'usage', 'Usage');
  return {
    isoCode: str(read(value, 'isoCode', 'ISOCode')),
    englishName: str(read(value, 'englishName', 'EnglishName')),
    arabicName: str(read(value, 'arabicName', 'ArabicName')),
    symbol: str(read(value, 'symbol', 'Symbol')),
    decimalDigits: num(read(value, 'decimalDigits', 'DecimalDigits'), 2),
    isActive: bool(read(value, 'isActive', 'IsActive')),
    supportsFunding: bool(read(value, 'supportsFunding', 'SupportsFunding')),
    supportsSettlement: bool(read(value, 'supportsSettlement', 'SupportsSettlement')),
    supportsWallet: bool(read(value, 'supportsWallet', 'SupportsWallet')),
    createdAt: str(read(value, 'createdAt', 'CreatedAt')),
    updatedAt: nullableStr(read(value, 'updatedAt', 'UpdatedAt')),
    createdByUserId: nullableStr(read(value, 'createdByUserId', 'CreatedByUserId')),
    updatedByUserId: nullableStr(read(value, 'updatedByUserId', 'UpdatedByUserId')),
    usage: {
      totalReferences: num(read(usage, 'totalReferences', 'TotalReferences')),
      isReferenced: bool(read(usage, 'isReferenced', 'IsReferenced')),
    },
  };
};

export const currencyAdminService = createAdminService<CurrencyAdminItem, CurrencyCreateInput, CurrencyUpdateInput, string>({
  basePath: '/api/v1/admin/currencies',
  map: mapCurrency,
});
