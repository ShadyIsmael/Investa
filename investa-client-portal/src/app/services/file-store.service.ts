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

    // Build absolute URL from relative URL returned by file store
    const relativeUrl = resp.url; // e.g. "/storage/profiles/{userId}/avatar.jpg"
    return `${this.base}${relativeUrl}`;
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
      return `${this.base}${resp.url}`;
    } catch {
      return null;
    }
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

    const relativeUrl = resp.url;
    return `${this.base}${relativeUrl}`;
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
      url: `${this.base}${a.url}`,
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
}
