import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface CountryReference {
  id: number; code: string; isoAlpha2: string; isoAlpha3?: string | null; nameEn: string; nameAr: string;
  phoneCode?: string | null; sortOrder: number; isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly items = signal<CountryReference[]>([]);
  private loaded = false;

  constructor(private http: HttpClient, @Inject(API_BASE) private readonly base: string) {}

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const token = localStorage.getItem('accessToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const response: any = await firstValueFrom(this.http.get(`${this.base}/api/v1/countries?includeInactive=true`, { headers }));
    const raw = response?.data ?? response;
    if (!Array.isArray(raw)) throw new Error('Countries response was invalid.');
    this.items.set(raw.map((value: any) => ({
      id: Number(value.id ?? value.Id), code: String(value.code ?? value.Code ?? ''),
      isoAlpha2: String(value.isoAlpha2 ?? value.IsoAlpha2 ?? '').toUpperCase(), isoAlpha3: value.isoAlpha3 ?? value.IsoAlpha3 ?? null,
      nameEn: String(value.nameEn ?? value.NameEn ?? ''), nameAr: String(value.nameAr ?? value.NameAr ?? ''),
      phoneCode: value.phoneCode ?? value.PhoneCode ?? null, sortOrder: Number(value.sortOrder ?? value.SortOrder ?? 0),
      isActive: Boolean(value.isActive ?? value.IsActive),
    })).sort((a: CountryReference, b: CountryReference) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn)));
    this.loaded = true;
  }

  all(): CountryReference[] { return this.items(); }
  active(): CountryReference[] { return this.items().filter(item => item.isActive); }
  withPhoneCode(): CountryReference[] { return this.active().filter(item => Boolean(item.phoneCode)); }
  findByAlpha2(value: string | null | undefined): CountryReference | undefined { return this.items().find(item => item.isoAlpha2 === String(value ?? '').trim().toUpperCase()); }
  findByPhoneCode(value: string | null | undefined): CountryReference | undefined { return this.withPhoneCode().find(item => item.phoneCode === String(value ?? '').trim()); }
  label(item: CountryReference, language: 'en' | 'ar'): string { return language === 'ar' ? item.nameAr || item.nameEn : item.nameEn || item.nameAr; }
}
