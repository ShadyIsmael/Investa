import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { OpportunityTimelineComponent } from '../../../shared/components/opportunity-timeline/opportunity-timeline.component';
import { lookupLabel, money, opportunityDescription, opportunityTitle } from './opportunity-utils';
import { FileStoreService } from '../../../services/file-store.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = () => [];
function OpportunityDetailsComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 5);
} }
function OpportunityDetailsComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage());
} }
function OpportunityDetailsComponent_ng_container_4_span_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tag_r2 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.tagLabel(tag_r2));
} }
function OpportunityDetailsComponent_ng_container_4_p_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opportunity_r3 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opportunity_r3.founderSummary);
} }
function OpportunityDetailsComponent_ng_container_4_div_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 38);
    i0.ɵɵtext(1, "No public documents returned.");
    i0.ɵɵelementEnd();
} }
function OpportunityDetailsComponent_ng_container_4_div_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 39)(1, "div", 40)(2, "div", 41);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 42)(5, "p", 43);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 44);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 45)(10, "a", 46);
    i0.ɵɵtext(11, "Preview");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "a", 46);
    i0.ɵɵtext(13, "Download");
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const doc_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r4.fileExtension || "FILE");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.fileTitle(doc_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("", doc_r4.mimeType || "-", " \u00B7 ", ctx_r0.fileSize(doc_r4.fileSize), " \u00B7 ", doc_r4.category || "-");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("href", ctx_r0.previewUrl(doc_r4), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("href", ctx_r0.downloadUrl(doc_r4), i0.ɵɵsanitizeUrl);
} }
function OpportunityDetailsComponent_ng_container_4_div_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 38);
    i0.ɵɵtext(1, "No public media returned.");
    i0.ɵɵelementEnd();
} }
function OpportunityDetailsComponent_ng_container_4_div_70_img_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 51);
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.mediaUrl(item_r5), i0.ɵɵsanitizeUrl)("alt", item_r5.caption || item_r5.originalFileName || "Opportunity media");
} }
function OpportunityDetailsComponent_ng_container_4_div_70_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52)(1, "a", 53);
    i0.ɵɵtext(2, "Open video preview");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx_r0.previewUrl(item_r5), i0.ɵɵsanitizeUrl);
} }
function OpportunityDetailsComponent_ng_container_4_div_70_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 47);
    i0.ɵɵtemplate(1, OpportunityDetailsComponent_ng_container_4_div_70_img_1_Template, 1, 2, "img", 48)(2, OpportunityDetailsComponent_ng_container_4_div_70_div_2_Template, 3, 1, "div", 49);
    i0.ɵɵelementStart(3, "p", 50);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", (item_r5.mimeType || "").startsWith("image") || item_r5.thumbnailUrl || item_r5.fileUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", (item_r5.mimeType || "").startsWith("video"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r5.caption || item_r5.originalFileName || item_r5.fileName || "Media file");
} }
function OpportunityDetailsComponent_ng_container_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "section", 7);
    i0.ɵɵelement(2, "img", 8);
    i0.ɵɵelementStart(3, "div", 9)(4, "div", 10)(5, "div")(6, "h1", 11);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 12);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "button", 13);
    i0.ɵɵtext(11, "Request to Participate - Coming Soon");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "dl", 14)(13, "div")(14, "dt", 15);
    i0.ɵɵtext(15, "Funding Target");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "dd", 16);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div")(19, "dt", 15);
    i0.ɵɵtext(20, "Minimum Participation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dd", 16);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div")(24, "dt", 15);
    i0.ɵɵtext(25, "Investment Model");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd", 16);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div")(29, "dt", 15);
    i0.ɵɵtext(30, "Opportunity Stage");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "dd", 16);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(33, "div", 17)(34, "span", 18);
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(36, OpportunityDetailsComponent_ng_container_4_span_36_Template, 2, 1, "span", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(37, OpportunityDetailsComponent_ng_container_4_p_37_Template, 2, 1, "p", 20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "section", 21)(39, "div", 22)(40, "h2", 23);
    i0.ɵɵtext(41, "Details");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "p", 24);
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "dl", 25)(45, "div")(46, "dt", 26);
    i0.ɵɵtext(47, "Funding Goal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "dd", 27);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div")(51, "dt", 26);
    i0.ɵɵtext(52, "Expected Duration");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "dd", 27);
    i0.ɵɵtext(54);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(55, "div")(56, "dt", 26);
    i0.ɵɵtext(57, "Maximum Participation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "dd", 27);
    i0.ɵɵtext(59);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(60, "div", 28)(61, "h2", 23);
    i0.ɵɵtext(62, "Public Documents");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(63, OpportunityDetailsComponent_ng_container_4_div_63_Template, 2, 0, "div", 29)(64, OpportunityDetailsComponent_ng_container_4_div_64_Template, 14, 7, "div", 30);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(65, "section", 31)(66, "h2", 23);
    i0.ɵɵtext(67, "Public Gallery");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(68, OpportunityDetailsComponent_ng_container_4_div_68_Template, 2, 0, "div", 29);
    i0.ɵɵelementStart(69, "div", 32);
    i0.ɵɵtemplate(70, OpportunityDetailsComponent_ng_container_4_div_70_Template, 5, 3, "div", 33);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(71, "section", 31)(72, "h2", 23);
    i0.ɵɵtext(73, "Timeline");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(74, "app-opportunity-timeline", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(75, "section", 31)(76, "h2", 23);
    i0.ɵɵtext(77, "Advanced Info");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(78, "dl", 32)(79, "div")(80, "dt", 26);
    i0.ɵɵtext(81, "Use of Funds");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(82, "dd", 35);
    i0.ɵɵtext(83);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(84, "div")(85, "dt", 26);
    i0.ɵɵtext(86, "Risks");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(87, "dd", 35);
    i0.ɵɵtext(88);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(89, "div")(90, "dt", 26);
    i0.ɵɵtext(91, "Exit Strategy");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(92, "dd", 35);
    i0.ɵɵtext(93);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const opportunity_r3 = ctx.ngIf;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx_r0.cover(opportunity_r3), i0.ɵɵsanitizeUrl)("alt", ctx_r0.title(opportunity_r3));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.title(opportunity_r3));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.description(opportunity_r3));
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.money(opportunity_r3.fundingTarget));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.money(opportunity_r3.minimumInvestment));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opportunity_r3.investmentModel || "-");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opportunity_r3.projectStage || "-");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.label(ctx_r0.categories(), opportunity_r3.categoryId, opportunity_r3.categoryName));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", opportunity_r3.tags || i0.ɵɵpureFunction0(23, _c0));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", opportunity_r3.founderSummary);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(opportunity_r3.fullDescription || opportunity_r3.description || "-");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.label(ctx_r0.fundingGoals(), opportunity_r3.fundingGoalId, opportunity_r3.fundingGoalName));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opportunity_r3.expectedDuration || "-");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.money(opportunity_r3.maximumInvestment));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r0.documents().length === 0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r0.documents());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r0.media().length === 0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r0.media());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("events", ctx_r0.events());
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(opportunity_r3.fundingUsage || "-");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opportunity_r3.risks || "-");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(opportunity_r3.exitStrategy || "-");
} }
export class OpportunityDetailsComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.service = inject(OpportunityService);
        this.fileStore = inject(FileStoreService);
        this.opportunity = signal(null, ...(ngDevMode ? [{ debugName: "opportunity" }] : []));
        this.categories = signal([], ...(ngDevMode ? [{ debugName: "categories" }] : []));
        this.fundingGoals = signal([], ...(ngDevMode ? [{ debugName: "fundingGoals" }] : []));
        this.media = signal([], ...(ngDevMode ? [{ debugName: "media" }] : []));
        this.documents = signal([], ...(ngDevMode ? [{ debugName: "documents" }] : []));
        this.events = signal([], ...(ngDevMode ? [{ debugName: "events" }] : []));
        this.isLoading = signal(false, ...(ngDevMode ? [{ debugName: "isLoading" }] : []));
        this.errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
        this.title = opportunityTitle;
        this.description = opportunityDescription;
        this.money = money;
        this.load();
    }
    async load() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id)
            return;
        try {
            this.isLoading.set(true);
            this.errorMessage.set(null);
            const [categories, fundingGoals, opportunity] = await Promise.all([
                this.service.getCategories(),
                this.service.getFundingGoals(),
                this.service.getPublicOpportunity(id)
            ]);
            this.categories.set(categories);
            this.fundingGoals.set(fundingGoals);
            this.opportunity.set(opportunity);
            const [media, documents, events] = await Promise.all([
                this.service.getMedia(id).catch(() => []),
                this.service.getDocuments(id).catch(() => []),
                this.service.getEvents(id).catch(() => [])
            ]);
            this.media.set(media);
            this.documents.set(documents);
            this.events.set(events);
        }
        catch (error) {
            this.errorMessage.set(error?.message || 'Failed to load opportunity.');
        }
        finally {
            this.isLoading.set(false);
        }
    }
    label(items, id, fallback) {
        return lookupLabel(items, id, fallback);
    }
    tagLabel(tag) {
        return typeof tag === 'string' ? tag : this.service.label(tag);
    }
    cover(opportunity) {
        return opportunity.coverImageUrl || this.mediaUrl(this.media().find(item => item.isCover || item.isPrimary)) || 'assets/boardroom-bg.jpg';
    }
    mediaUrl(item) {
        if (!item)
            return '';
        return item.fileUrl || item.previewUrl || item.thumbnailUrl || '';
    }
    previewUrl(item) {
        if (item.previewUrl)
            return item.previewUrl;
        const category = item.category;
        const fileName = item.fileName;
        return category && fileName ? this.fileStore.getPreviewUrl(category, fileName) : (item.fileUrl || '#');
    }
    downloadUrl(item) {
        const category = item.category;
        const fileName = item.fileName;
        return category && fileName ? this.fileStore.getDownloadUrl(category, fileName) : (item.fileUrl || '#');
    }
    fileTitle(item) {
        return item.title || item.name || item.originalFileName || item.fileName || 'Document';
    }
    fileSize(bytes) {
        if (!bytes)
            return '-';
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    static { this.ɵfac = function OpportunityDetailsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OpportunityDetailsComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OpportunityDetailsComponent, selectors: [["app-opportunity-details"]], decls: 5, vars: 3, consts: [[1, "investa-page"], [1, "investa-container"], ["class", "investa-card h-96 animate-pulse", 4, "ngIf"], ["class", "rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-700", 4, "ngIf"], [4, "ngIf"], [1, "investa-card", "h-96", "animate-pulse"], [1, "rounded-lg", "border", "border-red-500/40", "bg-red-500/10", "p-4", "text-red-700"], [1, "investa-card", "overflow-hidden"], [1, "h-72", "w-full", "object-cover", 3, "src", "alt"], [1, "p-6", "lg:p-8"], [1, "flex", "flex-col", "gap-6", "lg:flex-row", "lg:items-start", "lg:justify-between"], [1, "investa-title", "text-3xl"], [1, "investa-muted", "mt-3", "max-w-3xl"], ["disabled", "", 1, "investa-btn-primary", "opacity-60"], [1, "investa-hero-dark", "mt-8", "grid", "grid-cols-2", "gap-4", "p-5", "md:grid-cols-4"], [1, "text-xs", "text-current", "opacity-60"], [1, "mt-1", "text-lg", "font-bold"], [1, "mt-6", "flex", "flex-wrap", "gap-2"], [1, "investa-badge"], ["class", "investa-badge investa-badge-accent", 4, "ngFor", "ngForOf"], ["class", "investa-card-soft mt-6 p-4 text-sm", 4, "ngIf"], [1, "mt-8", "grid", "grid-cols-1", "gap-6", "lg:grid-cols-3"], [1, "investa-card", "p-6", "lg:col-span-2"], [1, "investa-section-title", "text-xl"], [1, "investa-muted", "mt-4", "whitespace-pre-line"], [1, "mt-6", "grid", "grid-cols-1", "gap-4", "md:grid-cols-3"], [1, "investa-meta", "text-xs"], [1, "font-semibold"], [1, "investa-card", "p-6"], ["class", "investa-muted mt-4 text-sm", 4, "ngIf"], ["class", "investa-card-soft mt-3 p-3", 4, "ngFor", "ngForOf"], [1, "investa-card", "mt-8", "p-6"], [1, "mt-4", "grid", "grid-cols-1", "gap-4", "md:grid-cols-3"], ["class", "investa-card-soft p-3", 4, "ngFor", "ngForOf"], [1, "mt-4", "block", 3, "events"], [1, "investa-muted", "mt-1", "text-sm"], [1, "investa-badge", "investa-badge-accent"], [1, "investa-card-soft", "mt-6", "p-4", "text-sm"], [1, "investa-muted", "mt-4", "text-sm"], [1, "investa-card-soft", "mt-3", "p-3"], [1, "flex", "items-start", "gap-3"], [1, "investa-badge", "flex", "h-10", "w-10", "flex-shrink-0", "justify-center", "rounded-lg", "px-0"], [1, "min-w-0", "flex-1"], [1, "truncate", "text-sm", "font-semibold"], [1, "investa-meta", "mt-1", "text-xs"], [1, "mt-2", "flex", "gap-3"], ["target", "_blank", 1, "text-xs", "font-semibold", "text-current", "underline-offset-4", "hover:underline", 3, "href"], [1, "investa-card-soft", "p-3"], ["class", "h-44 w-full rounded-lg object-cover", 3, "src", "alt", 4, "ngIf"], ["class", "mt-3", 4, "ngIf"], [1, "investa-muted", "mt-2", "truncate", "text-sm"], [1, "h-44", "w-full", "rounded-lg", "object-cover", 3, "src", "alt"], [1, "mt-3"], ["target", "_blank", 1, "text-sm", "font-semibold", "text-current", "underline-offset-4", "hover:underline", 3, "href"]], template: function OpportunityDetailsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵtemplate(2, OpportunityDetailsComponent_div_2_Template, 1, 0, "div", 2)(3, OpportunityDetailsComponent_div_3_Template, 2, 1, "div", 3)(4, OpportunityDetailsComponent_ng_container_4_Template, 94, 24, "ng-container", 4);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.errorMessage() && !ctx.isLoading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.opportunity());
        } }, dependencies: [CommonModule, i1.NgForOf, i1.NgIf, OpportunityTimelineComponent], encapsulation: 2, changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OpportunityDetailsComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-opportunity-details', imports: [CommonModule, OpportunityTimelineComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"investa-page\">\n  <div class=\"investa-container\">\n    <div *ngIf=\"isLoading()\" class=\"investa-card h-96 animate-pulse\"></div>\n    <div *ngIf=\"errorMessage() && !isLoading()\" class=\"rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-700\">{{ errorMessage() }}</div>\n\n    <ng-container *ngIf=\"opportunity() as opportunity\">\n      <section class=\"investa-card overflow-hidden\">\n        <img [src]=\"cover(opportunity)\" [alt]=\"title(opportunity)\" class=\"h-72 w-full object-cover\">\n        <div class=\"p-6 lg:p-8\">\n          <div class=\"flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between\">\n            <div>\n              <h1 class=\"investa-title text-3xl\">{{ title(opportunity) }}</h1>\n              <p class=\"investa-muted mt-3 max-w-3xl\">{{ description(opportunity) }}</p>\n            </div>\n            <button disabled class=\"investa-btn-primary opacity-60\">Request to Participate - Coming Soon</button>\n          </div>\n\n          <dl class=\"investa-hero-dark mt-8 grid grid-cols-2 gap-4 p-5 md:grid-cols-4\">\n            <div><dt class=\"text-xs text-current opacity-60\">Funding Target</dt><dd class=\"mt-1 text-lg font-bold\">{{ money(opportunity.fundingTarget) }}</dd></div>\n            <div><dt class=\"text-xs text-current opacity-60\">Minimum Participation</dt><dd class=\"mt-1 text-lg font-bold\">{{ money(opportunity.minimumInvestment) }}</dd></div>\n            <div><dt class=\"text-xs text-current opacity-60\">Investment Model</dt><dd class=\"mt-1 text-lg font-bold\">{{ opportunity.investmentModel || '-' }}</dd></div>\n            <div><dt class=\"text-xs text-current opacity-60\">Opportunity Stage</dt><dd class=\"mt-1 text-lg font-bold\">{{ opportunity.projectStage || '-' }}</dd></div>\n          </dl>\n\n          <div class=\"mt-6 flex flex-wrap gap-2\">\n            <span class=\"investa-badge\">{{ label(categories(), opportunity.categoryId, opportunity.categoryName) }}</span>\n            <span *ngFor=\"let tag of opportunity.tags || []\" class=\"investa-badge investa-badge-accent\">{{ tagLabel(tag) }}</span>\n          </div>\n\n          <p *ngIf=\"opportunity.founderSummary\" class=\"investa-card-soft mt-6 p-4 text-sm\">{{ opportunity.founderSummary }}</p>\n        </div>\n      </section>\n\n      <section class=\"mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3\">\n        <div class=\"investa-card p-6 lg:col-span-2\">\n          <h2 class=\"investa-section-title text-xl\">Details</h2>\n          <p class=\"investa-muted mt-4 whitespace-pre-line\">{{ opportunity.fullDescription || opportunity.description || '-' }}</p>\n          <dl class=\"mt-6 grid grid-cols-1 gap-4 md:grid-cols-3\">\n            <div><dt class=\"investa-meta text-xs\">Funding Goal</dt><dd class=\"font-semibold\">{{ label(fundingGoals(), opportunity.fundingGoalId, opportunity.fundingGoalName) }}</dd></div>\n            <div><dt class=\"investa-meta text-xs\">Expected Duration</dt><dd class=\"font-semibold\">{{ opportunity.expectedDuration || '-' }}</dd></div>\n            <div><dt class=\"investa-meta text-xs\">Maximum Participation</dt><dd class=\"font-semibold\">{{ money(opportunity.maximumInvestment) }}</dd></div>\n          </dl>\n        </div>\n\n        <div class=\"investa-card p-6\">\n          <h2 class=\"investa-section-title text-xl\">Public Documents</h2>\n          <div *ngIf=\"documents().length === 0\" class=\"investa-muted mt-4 text-sm\">No public documents returned.</div>\n          <div *ngFor=\"let doc of documents()\" class=\"investa-card-soft mt-3 p-3\">\n            <div class=\"flex items-start gap-3\">\n              <div class=\"investa-badge flex h-10 w-10 flex-shrink-0 justify-center rounded-lg px-0\">{{ doc.fileExtension || 'FILE' }}</div>\n              <div class=\"min-w-0 flex-1\">\n                <p class=\"truncate text-sm font-semibold\">{{ fileTitle(doc) }}</p>\n                <p class=\"investa-meta mt-1 text-xs\">{{ doc.mimeType || '-' }} \u00B7 {{ fileSize(doc.fileSize) }} \u00B7 {{ doc.category || '-' }}</p>\n                <div class=\"mt-2 flex gap-3\">\n                  <a [href]=\"previewUrl(doc)\" target=\"_blank\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Preview</a>\n                  <a [href]=\"downloadUrl(doc)\" target=\"_blank\" class=\"text-xs font-semibold text-current underline-offset-4 hover:underline\">Download</a>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </section>\n\n      <section class=\"investa-card mt-8 p-6\">\n        <h2 class=\"investa-section-title text-xl\">Public Gallery</h2>\n        <div *ngIf=\"media().length === 0\" class=\"investa-muted mt-4 text-sm\">No public media returned.</div>\n        <div class=\"mt-4 grid grid-cols-1 gap-4 md:grid-cols-3\">\n          <div *ngFor=\"let item of media()\" class=\"investa-card-soft p-3\">\n            <img *ngIf=\"(item.mimeType || '').startsWith('image') || item.thumbnailUrl || item.fileUrl\" [src]=\"mediaUrl(item)\" [alt]=\"item.caption || item.originalFileName || 'Opportunity media'\" class=\"h-44 w-full rounded-lg object-cover\">\n            <div *ngIf=\"(item.mimeType || '').startsWith('video')\" class=\"mt-3\">\n              <a [href]=\"previewUrl(item)\" target=\"_blank\" class=\"text-sm font-semibold text-current underline-offset-4 hover:underline\">Open video preview</a>\n            </div>\n            <p class=\"investa-muted mt-2 truncate text-sm\">{{ item.caption || item.originalFileName || item.fileName || 'Media file' }}</p>\n          </div>\n        </div>\n      </section>\n\n      <section class=\"investa-card mt-8 p-6\">\n        <h2 class=\"investa-section-title text-xl\">Timeline</h2>\n        <app-opportunity-timeline class=\"mt-4 block\" [events]=\"events()\"></app-opportunity-timeline>\n      </section>\n\n      <section class=\"investa-card mt-8 p-6\">\n        <h2 class=\"investa-section-title text-xl\">Advanced Info</h2>\n        <dl class=\"mt-4 grid grid-cols-1 gap-4 md:grid-cols-3\">\n          <div><dt class=\"investa-meta text-xs\">Use of Funds</dt><dd class=\"investa-muted mt-1 text-sm\">{{ opportunity.fundingUsage || '-' }}</dd></div>\n          <div><dt class=\"investa-meta text-xs\">Risks</dt><dd class=\"investa-muted mt-1 text-sm\">{{ opportunity.risks || '-' }}</dd></div>\n          <div><dt class=\"investa-meta text-xs\">Exit Strategy</dt><dd class=\"investa-muted mt-1 text-sm\">{{ opportunity.exitStrategy || '-' }}</dd></div>\n        </dl>\n      </section>\n    </ng-container>\n  </div>\n</div>\n" }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OpportunityDetailsComponent, { className: "OpportunityDetailsComponent", filePath: "src/app/pages/admin/opportunities/opportunity-details.component.ts", lineNumber: 16 }); })();
