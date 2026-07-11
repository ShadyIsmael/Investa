import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getFileStoreBase, FILE_STORE_API_KEY } from '../config/api.config';

interface ProfilePictureResponse {
  userId: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface FileStoreFile {
  fileId?: string;
  fileKey?: string;
  fileName: string;
  originalFileName?: string;
  originalName?: string;
  extension?: string;
  mimeType?: string;
  contentType?: string;
  fileSize?: number;
  sizeBytes?: number;
  category: string;
  url: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface FileStoreUploadMetadata {
  purpose?: string;
  visibility?: 'Public' | 'Private' | string;
  isPublic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FileStoreService {
  private get base(): string {
    return getFileStoreBase();
  }

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-Api-Key': FILE_STORE_API_KEY });
  }

  constructor(private http: HttpClient) {}

  /**
   * Upload or replace the profile picture for a user.
   * Returns the public URL of the uploaded image.
   */
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<ProfilePictureResponse>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * Get the public URL for a user's profile picture, or null if none uploaded.
   */
  async getProfilePictureUrl(userId: string): Promise<string | null> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
    try {
      const resp = await firstValueFrom(
        this.http.get<ProfilePictureResponse>(url, { headers: this.authHeaders })
      );
      return this.getPublicUrl(resp.url);
    } catch {
      return null;
    }
  }

  /**
   * Convert a relative filestore URL to an absolute public URL.
   */
  getPublicUrl(fileUrl?: string | null): string {
    if (!fileUrl) {
      return '';
    }

    const trimmed = fileUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();
        if (host === 'filestore.local' || host === 'cdn.investa.demo') {
          const baseUrl = new URL(this.base);
          return `${baseUrl.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch {
        return trimmed;
      }
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${this.base}${trimmed}`;
    }

    return `${this.base}/${trimmed}`;
  }

  /**
   * Delete the profile picture for a user.
   */
  async deleteProfilePicture(userId: string): Promise<void> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
    await firstValueFrom(this.http.delete(url, { headers: this.authHeaders }));
  }

  /**
   * Upload a national ID image for a user and store it under a dedicated folder.
   * Returns the public URL of the stored image.
   */
  async uploadNationalId(userId: string, file: File): Promise<string> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<ProfilePictureResponse>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * Upload a project image to the InvestafileStore under a project-specific folder.
   */
  async uploadProjectImage(projectId: number | string, file: File): Promise<string> {
    const category = `project-${String(projectId).trim()}`;
    const url = `${this.base}/files/${encodeURIComponent(category)}`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<FileStoreFile>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * Upload an investment image directly to FileStore.
   * Returns the public URL of the uploaded image.
   */
  async uploadInvestmentImage(investmentId: number | string, file: File): Promise<string> {
    const category = `investment-images-${String(investmentId).trim()}`;
    const url = `${this.base}/files/${encodeURIComponent(category)}`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<FileStoreFile>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * Upload an investment video directly to FileStore.
   * Returns the public URL of the uploaded video.
   */
  async uploadInvestmentVideo(investmentId: number | string, file: File): Promise<string> {
    const category = `investment-videos-${String(investmentId).trim()}`;
    const url = `${this.base}/files/${encodeURIComponent(category)}`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<FileStoreFile>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * Upload an investment document (PDF, PPTX, etc.) directly to FileStore.
   * Returns the public URL of the uploaded document.
   */
  async uploadInvestmentDocument(investmentId: number | string, file: File): Promise<string> {
    const category = `investment-docs-${String(investmentId).trim()}`;
    const url = `${this.base}/files/${encodeURIComponent(category)}`;
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await firstValueFrom(
      this.http.post<FileStoreFile>(url, form, { headers: this.authHeaders })
    );

    return this.getPublicUrl(resp.url);
  }

  /**
   * List uploaded national-id files for a user.
   */
  async getNationalIdFiles(userId: string): Promise<Array<{ fileName: string; url: string; sizeBytes: number; createdAt: string }>> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id`;
    const resp = await firstValueFrom(this.http.get<any[]>(url, { headers: this.authHeaders }));
    const arr = resp || [];
    return arr.map(a => ({
      fileName: a.fileName,
      url: this.getPublicUrl(a.url),
      sizeBytes: a.sizeBytes,
      createdAt: a.createdAt
    }));
  }

  /**
   * Delete a specific national-id file for a user.
   */
  async deleteNationalId(userId: string, fileName: string): Promise<void> {
    const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id/${encodeURIComponent(fileName)}`;
    await firstValueFrom(this.http.delete(url, { headers: this.authHeaders }));
  }

  async uploadFile(category: string, file: File, metadata: FileStoreUploadMetadata = {}): Promise<FileStoreFile> {
    const url = `${this.base}/files/${encodeURIComponent(category)}`;
    const form = new FormData();
    form.append('file', file, file.name);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    const resp = await firstValueFrom(
      this.http.post<FileStoreFile>(url, form, { headers: this.authHeaders })
    );
    return this.normalizeFile(resp);
  }

  getDownloadUrl(category: string, filename: string): string {
    return `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/download`;
  }

  getPreviewUrl(category: string, filename: string): string {
    return `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/preview`;
  }

  async getMetadata(category: string, filename: string): Promise<FileStoreFile> {
    const url = `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/metadata`;
    const resp = await firstValueFrom(this.http.get<FileStoreFile>(url, { headers: this.authHeaders }));
    return this.normalizeFile(resp);
  }

  async searchFiles(category: string, query = ''): Promise<FileStoreFile[]> {
    const url = `${this.base}/files/search?category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}`;
    const resp = await firstValueFrom(this.http.get<FileStoreFile[] | { items: FileStoreFile[] }>(url, { headers: this.authHeaders }));
    const items = Array.isArray(resp) ? resp : resp.items ?? [];
    return items.map(item => this.normalizeFile(item));
  }

  async getCategories(): Promise<string[]> {
    const url = `${this.base}/categories`;
    const resp = await firstValueFrom(this.http.get<Array<string | { name?: string; key?: string; value?: string }>>(url, { headers: this.authHeaders }));
    return (resp || []).map(item => typeof item === 'string' ? item : item.name || item.key || item.value || '').filter(Boolean);
  }

  private normalizeFile(file: FileStoreFile): FileStoreFile {
    return {
      ...file,
      url: this.getPublicUrl(file.url),
      previewUrl: file.previewUrl ? this.getPublicUrl(file.previewUrl) : file.previewUrl,
      thumbnailUrl: file.thumbnailUrl ? this.getPublicUrl(file.thumbnailUrl) : file.thumbnailUrl,
      mimeType: file.mimeType || file.contentType,
      fileSize: file.fileSize ?? file.sizeBytes,
      originalFileName: file.originalFileName || file.originalName || file.fileName
    };
  }
}
