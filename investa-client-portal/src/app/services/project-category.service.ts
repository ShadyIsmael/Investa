import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface ProjectCategoryReference {
  id: number; code: string; nameEn: string; nameAr: string; descriptionEn?: string | null; descriptionAr?: string | null;
  sortOrder: number; isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProjectCategoryService {
  private readonly items = signal<ProjectCategoryReference[]>([]);
  private loaded = false;
  constructor(private http: HttpClient, @Inject(API_BASE) private readonly base: string) {}
  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const token = localStorage.getItem('accessToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const response: any = await firstValueFrom(this.http.get(`${this.base}/api/v1/categories?includeInactive=true`, { headers }));
    const raw = response?.data ?? response;
    if (!Array.isArray(raw)) throw new Error('Project categories response was invalid.');
    this.items.set(raw.map((value: any) => ({
      id: Number(value.id ?? value.Id), code: String(value.code ?? value.Code ?? ''),
      nameEn: String(value.nameEn ?? value.NameEn ?? ''), nameAr: String(value.nameAr ?? value.NameAr ?? ''),
      descriptionEn: value.descriptionEn ?? value.DescriptionEn ?? null, descriptionAr: value.descriptionAr ?? value.DescriptionAr ?? null,
      sortOrder: Number(value.sortOrder ?? value.SortOrder ?? 0), isActive: Boolean(value.isActive ?? value.IsActive),
    })));
    this.loaded = true;
  }
  all(): ProjectCategoryReference[] { return this.items(); }
  active(): ProjectCategoryReference[] { return this.items().filter(item => item.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn)); }
  label(item: ProjectCategoryReference, language: 'en' | 'ar'): string { return language === 'ar' ? item.nameAr || item.nameEn : item.nameEn || item.nameAr; }
}
