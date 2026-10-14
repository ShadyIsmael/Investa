import { Injectable, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getFileStoreBase, FILE_STORE_API_KEY } from '../config/api.config';
import { API_BASE } from '../config/api.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class FileStoreService {
    get base() {
        return getFileStoreBase();
    }
    get authHeaders() {
        return new HttpHeaders({ 'X-Api-Key': FILE_STORE_API_KEY });
    }
    constructor(http, apiBase) {
        this.http = http;
        this.apiBase = apiBase;
        this.categoryCache = null;
        this.storagePolicyCache = null;
    }
    get backendHeaders() {
        const token = localStorage.getItem('accessToken');
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    }
    async getFileCategories(includeInactive = false) {
        if (!includeInactive && this.categoryCache)
            return this.categoryCache;
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/file-categories?includeInactive=${includeInactive}`, { headers: this.backendHeaders }));
        const raw = Array.isArray(response) ? response : response?.data ?? [];
        const categories = raw.map((item) => this.normalizeCategoryPolicy(item));
        if (!includeInactive)
            this.categoryCache = categories;
        return categories;
    }
    async getStoragePolicy() {
        if (this.storagePolicyCache)
            return this.storagePolicyCache;
        const response = await firstValueFrom(this.http.get(`${this.apiBase}/api/v1/file-storage-policy`, { headers: this.backendHeaders }));
        const raw = response?.data ?? response;
        this.storagePolicyCache = {
            globalMaxFileSizeBytes: Number(raw?.globalMaxFileSizeBytes ?? raw?.GlobalMaxFileSizeBytes ?? 0),
            defaultUserQuotaBytes: Number(raw?.defaultUserQuotaBytes ?? raw?.DefaultUserQuotaBytes ?? 0),
            defaultProjectQuotaBytes: Number(raw?.defaultProjectQuotaBytes ?? raw?.DefaultProjectQuotaBytes ?? 0)
        };
        return this.storagePolicyCache;
    }
    /**
     * Upload or replace the profile picture for a user.
     * Returns the public URL of the uploaded image.
     */
    async uploadProfilePicture(userId, file) {
        const uploaded = await this.uploadViaBackend('PROFILEAVATAR', file, { entityType: 'UserProfile', entityId: userId });
        return uploaded.url;
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
        const uploaded = await this.uploadViaBackend('PROFILENATIONALID', file, { entityType: 'UserProfile', entityId: userId });
        return uploaded.url;
    }
    /**
     * Upload a project image to the InvestafileStore under a project-specific folder.
     */
    async uploadProjectImage(projectId, file) {
        const uploaded = await this.uploadViaBackend('PROJECTIMAGE', file, { projectId, entityType: 'Project', entityId: projectId });
        return uploaded.url;
    }
    /**
     * Upload an investment image directly to FileStore.
     * Returns the public URL of the uploaded image.
     */
    async uploadInvestmentImage(investmentId, file) {
        const uploaded = await this.uploadViaBackend('INVESTMENTIMAGE', file, { entityType: 'InvestmentImage', entityId: investmentId });
        return uploaded.url;
    }
    /**
     * Upload an investment video directly to FileStore.
     * Returns the public URL of the uploaded video.
     */
    async uploadInvestmentVideo(investmentId, file) {
        const uploaded = await this.uploadViaBackend('INVESTMENTVIDEO', file, { entityType: 'InvestmentImage', entityId: investmentId });
        return uploaded.url;
    }
    /**
     * Upload an investment document (PDF, PPTX, etc.) directly to FileStore.
     * Returns the public URL of the uploaded document.
     */
    async uploadInvestmentDocument(investmentId, file) {
        const uploaded = await this.uploadViaBackend('INVESTMENTDOCUMENT', file, { entityType: 'InvestmentDocument', entityId: investmentId });
        return uploaded.url;
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
        return this.uploadViaBackend(category, file, metadata);
    }
    async uploadViaBackend(category, file, metadata = {}) {
        const categoryCode = category.trim().toUpperCase();
        const categoryPolicy = (await this.getFileCategories()).find(item => item.code === categoryCode);
        if (!categoryPolicy)
            throw new Error(`Unknown file category: ${categoryCode}`);
        if (!categoryPolicy.isActive)
            throw new Error(`File category is inactive: ${categoryCode}`);
        const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
        if (!extension || !categoryPolicy.allowedExtensions.some(item => item.toLowerCase() === extension))
            throw new Error('The selected file extension is not allowed.');
        const policy = await this.getStoragePolicy();
        const effectiveLimit = Math.min(policy.globalMaxFileSizeBytes, categoryPolicy.maxFileSizeBytes);
        if (file.size <= 0 || file.size > effectiveLimit)
            throw new Error(`The selected file exceeds the ${this.formatBytes(effectiveLimit)} limit.`);
        const derivedMime = this.mimeForExtension(extension);
        if (!derivedMime || !categoryPolicy.allowedMimeTypes.some(item => item.toLowerCase() === derivedMime))
            throw new Error('The selected file type is not allowed.');
        if (file.type && file.type !== 'application/octet-stream' && file.type.toLowerCase() !== derivedMime)
            throw new Error('The file MIME type does not match its extension.');
        const url = `${this.apiBase}/api/v1/files/upload`;
        const form = new FormData();
        form.append('file', file, file.name);
        form.append('categoryCode', categoryCode);
        if (metadata.projectId !== undefined)
            form.append('projectId', String(metadata.projectId));
        if (metadata.entityType)
            form.append('entityType', metadata.entityType);
        if (metadata.entityId !== undefined)
            form.append('entityId', String(metadata.entityId));
        const resp = await firstValueFrom(this.http.post(url, form, { headers: this.backendHeaders }));
        const uploadedFile = resp?.data ?? resp;
        if (!uploadedFile || Array.isArray(uploadedFile))
            throw new Error('The backend returned no uploaded file.');
        return this.normalizeFile(uploadedFile, categoryCode);
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
        return (await this.getFileCategories()).map(item => item.code);
    }
    normalizeCategoryPolicy(item) {
        const list = (value) => Array.isArray(value) ? value.map(String) : String(value ?? '').split(/[,;\n\r]/).map(value => value.trim()).filter(Boolean);
        return {
            id: Number(item?.id ?? item?.Id ?? 0), code: String(item?.code ?? item?.Code ?? '').trim().toUpperCase(),
            nameEn: String(item?.nameEn ?? item?.NameEn ?? ''), nameAr: String(item?.nameAr ?? item?.NameAr ?? ''),
            descriptionEn: item?.descriptionEn ?? item?.DescriptionEn, descriptionAr: item?.descriptionAr ?? item?.DescriptionAr,
            sortOrder: Number(item?.sortOrder ?? item?.SortOrder ?? 0), isActive: Boolean(item?.isActive ?? item?.IsActive),
            maxFileSizeBytes: Number(item?.maxFileSizeBytes ?? item?.MaxFileSizeBytes ?? 0),
            allowedExtensions: list(item?.allowedExtensions ?? item?.AllowedExtensions), allowedMimeTypes: list(item?.allowedMimeTypes ?? item?.AllowedMimeTypes),
            maxFilesPerEntity: item?.maxFilesPerEntity ?? item?.MaxFilesPerEntity ?? null, referenceCount: Number(item?.referenceCount ?? item?.ReferenceCount ?? 0)
        };
    }
    mimeForExtension(extension) {
        const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.txt': 'text/plain', '.csv': 'text/csv', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.zip': 'application/zip' };
        return map[extension] ?? null;
    }
    formatBytes(bytes) {
        if (bytes >= 1024 ** 3)
            return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
        return `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
    }
    normalizeFile(file, fallbackCategory) {
        const rawFile = file;
        const rawUrl = file.url || rawFile.Url || '';
        const storagePath = rawUrl.split('/storage/')[1]?.split(/[?#]/)[0];
        const fileKey = file.fileKey
            || rawFile.FileKey
            || (storagePath ? decodeURIComponent(storagePath) : undefined)
            || ((file.category || rawFile.Category || fallbackCategory) && (file.fileName || rawFile.FileName)
                ? `${file.category || rawFile.Category || fallbackCategory}/${file.fileName || rawFile.FileName}`
                : undefined);
        return {
            ...file,
            fileKey,
            category: file.category || rawFile.Category || fallbackCategory || '',
            fileName: file.fileName || rawFile.FileName || '',
            url: this.getPublicUrl(rawUrl),
            previewUrl: file.previewUrl ? this.getPublicUrl(file.previewUrl) : file.previewUrl,
            thumbnailUrl: file.thumbnailUrl ? this.getPublicUrl(file.thumbnailUrl) : file.thumbnailUrl,
            mimeType: file.mimeType || file.contentType,
            fileSize: file.fileSize ?? file.sizeBytes,
            originalFileName: file.originalFileName || file.originalName || file.fileName
        };
    }
    static { this.ɵfac = function FileStoreService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStoreService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(API_BASE)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FileStoreService, factory: FileStoreService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStoreService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [API_BASE]
            }] }], null); })();
