import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface RiskLevelReference {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class RiskLevelService {
  private readonly items = signal<RiskLevelReference[]>([]);
  private loaded = false;
  constructor(private http: HttpClient, @Inject(API_BASE) private readonly base: string) {}

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const token = localStorage.getItem('accessToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const response: any = await firstValueFrom(this.http.get(`${this.base}/api/v1/risk-levels?includeInactive=true`, { headers }));
    const raw = response?.data ?? response;
    if (!Array.isArray(raw)) throw new Error('Risk levels response was invalid.');
    this.items.set(raw.map((value: any) => ({
      id: Number(value.id ?? value.Id), code: String(value.code ?? value.Code ?? '').trim().toUpperCase(),
      nameEn: String(value.nameEn ?? value.NameEn ?? ''), nameAr: String(value.nameAr ?? value.NameAr ?? ''),
      descriptionEn: value.descriptionEn ?? value.DescriptionEn ?? null, descriptionAr: value.descriptionAr ?? value.DescriptionAr ?? null,
      sortOrder: Number(value.sortOrder ?? value.SortOrder ?? 0), isActive: Boolean(value.isActive ?? value.IsActive),
    })).sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn)));
    this.loaded = true;
  }
  all(): RiskLevelReference[] { return this.items(); }
  active(): RiskLevelReference[] { return this.items().filter(item => item.isActive); }
  find(code: unknown): RiskLevelReference | undefined { const normalized = String(code ?? '').trim().toUpperCase(); return this.items().find(item => item.code === normalized); }
  label(code: unknown, language: 'en' | 'ar'): string { const item = this.find(code); return item ? (language === 'ar' ? item.nameAr || item.nameEn : item.nameEn || item.nameAr) : ''; }
}
