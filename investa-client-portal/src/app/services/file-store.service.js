import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getFileStoreBase, FILE_STORE_API_KEY } from '../config/api.config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class FileStoreService {
    get base() {
        return getFileStoreBase();
    }
    get authHeaders() {
        return new HttpHeaders({ 'X-Api-Key': FILE_STORE_API_KEY });
    }
    constructor(http) {
        this.http = http;
    }
    /**
     * Upload or replace the profile picture for a user.
     * Returns the public URL of the uploaded image.
     */
    async uploadProfilePicture(userId, file) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * Get the public URL for a user's profile picture, or null if none uploaded.
     */
    async getProfilePictureUrl(userId) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
        try {
            const resp = await firstValueFrom(this.http.get(url, { headers: this.authHeaders }));
            return this.getPublicUrl(resp.url);
        }
        catch {
            return null;
        }
    }
    /**
     * Convert a relative filestore URL to an absolute public URL.
     */
    getPublicUrl(fileUrl) {
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
            }
            catch {
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
    async deleteProfilePicture(userId) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/profile-picture`;
        await firstValueFrom(this.http.delete(url, { headers: this.authHeaders }));
    }
    /**
     * Upload a national ID image for a user and store it under a dedicated folder.
     * Returns the public URL of the stored image.
     */
    async uploadNationalId(userId, file) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * Upload a project image to the InvestafileStore under a project-specific folder.
     */
    async uploadProjectImage(projectId, file) {
        const category = `project-${String(projectId).trim()}`;
        const url = `${this.base}/files/${encodeURIComponent(category)}`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * Upload an investment image directly to FileStore.
     * Returns the public URL of the uploaded image.
     */
    async uploadInvestmentImage(investmentId, file) {
        const category = `investment-images-${String(investmentId).trim()}`;
        const url = `${this.base}/files/${encodeURIComponent(category)}`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * Upload an investment video directly to FileStore.
     * Returns the public URL of the uploaded video.
     */
    async uploadInvestmentVideo(investmentId, file) {
        const category = `investment-videos-${String(investmentId).trim()}`;
        const url = `${this.base}/files/${encodeURIComponent(category)}`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * Upload an investment document (PDF, PPTX, etc.) directly to FileStore.
     * Returns the public URL of the uploaded document.
     */
    async uploadInvestmentDocument(investmentId, file) {
        const category = `investment-docs-${String(investmentId).trim()}`;
        const url = `${this.base}/files/${encodeURIComponent(category)}`;
        const form = new FormData();
        form.append('file', file, file.name);
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.getPublicUrl(resp.url);
    }
    /**
     * List uploaded national-id files for a user.
     */
    async getNationalIdFiles(userId) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id`;
        const resp = await firstValueFrom(this.http.get(url, { headers: this.authHeaders }));
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
    async deleteNationalId(userId, fileName) {
        const url = `${this.base}/users/${encodeURIComponent(userId)}/national-id/${encodeURIComponent(fileName)}`;
        await firstValueFrom(this.http.delete(url, { headers: this.authHeaders }));
    }
    async uploadFile(category, file, metadata = {}) {
        const url = `${this.base}/files/${encodeURIComponent(category)}`;
        const form = new FormData();
        form.append('file', file, file.name);
        Object.entries(metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                form.append(key, String(value));
            }
        });
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.authHeaders }));
        return this.normalizeFile(resp);
    }
    getDownloadUrl(category, filename) {
        return `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/download`;
    }
    getPreviewUrl(category, filename) {
        return `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/preview`;
    }
    async getMetadata(category, filename) {
        const url = `${this.base}/files/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/metadata`;
        const resp = await firstValueFrom(this.http.get(url, { headers: this.authHeaders }));
        return this.normalizeFile(resp);
    }
    async searchFiles(category, query = '') {
        const url = `${this.base}/files/search?category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}`;
        const resp = await firstValueFrom(this.http.get(url, { headers: this.authHeaders }));
        const items = Array.isArray(resp) ? resp : resp.items ?? [];
        return items.map(item => this.normalizeFile(item));
    }
    async getCategories() {
        const url = `${this.base}/categories`;
        const resp = await firstValueFrom(this.http.get(url, { headers: this.authHeaders }));
        return (resp || []).map(item => typeof item === 'string' ? item : item.name || item.key || item.value || '').filter(Boolean);
    }
    normalizeFile(file) {
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
    static { this.ɵfac = function FileStoreService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStoreService)(i0.ɵɵinject(i1.HttpClient)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FileStoreService, factory: FileStoreService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStoreService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }], null); })();
