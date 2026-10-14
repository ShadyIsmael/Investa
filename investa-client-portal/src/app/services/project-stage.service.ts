import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';

export interface ProjectStageReference {
  code: string;
  value: number;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  isActive: boolean;
  allowsCustomName: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProjectStageService {
  private readonly items = signal<ProjectStageReference[]>([]);
  private loaded = false;

  constructor(private http: HttpClient, @Inject(API_BASE) private readonly base: string) {}

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const response: any = await firstValueFrom(this.http.get(`${this.base}/api/v1/project-stages`));
    const raw = response?.data ?? response;
    if (!Array.isArray(raw)) throw new Error('Project stages response was invalid.');
    this.items.set(raw.map((value: any) => ({
      code: String(value.code ?? value.Code ?? ''),
      value: Number(value.value ?? value.Value),
      nameEn: String(value.nameEn ?? value.NameEn ?? ''),
      nameAr: String(value.nameAr ?? value.NameAr ?? ''),
      sortOrder: Number(value.sortOrder ?? value.SortOrder ?? 0),
      isActive: Boolean(value.isActive ?? value.IsActive),
      allowsCustomName: Boolean(value.allowsCustomName ?? value.AllowsCustomName)
    })).sort((a, b) => a.sortOrder - b.sortOrder || a.value - b.value));
    this.loaded = true;
  }

  all(): ProjectStageReference[] { return this.items(); }
  active(): ProjectStageReference[] { return this.items().filter(item => item.isActive); }
  find(value: unknown): ProjectStageReference | undefined {
    const text = String(value ?? '').trim().toLowerCase();
    const numeric = Number(value);
    return this.items().find(item => item.value === numeric || item.code.toLowerCase() === text);
  }
  label(value: unknown, language: 'en' | 'ar'): string {
    const item = this.find(value);
    if (!item) return '';
    return language === 'ar' ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
  }
}
