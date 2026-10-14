import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Project, ProjectService } from "../../../services/project.service";
import { CurrencyService } from "../../../services/currency.service";
import { ProjectStageService } from "../../../services/project-stage.service";
import { LanguageService } from "../../../services/language.service";
import { TranslatePipe } from "../../../pipes/translate.pipe";
@Component({
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  router = inject(Router);
  languageService = inject(LanguageService);
  direction = this.languageService.direction;
  private api = inject(ProjectService);
  currency = inject(CurrencyService);
  stageService = inject(ProjectStageService);
  items = signal<Project[]>([]);
  expandedProjectId = signal<number | null>(null);
  error = signal("");
  loading = signal(true);
  constructor() {
    this.currency.ensureLoaded();
    this.stageService.ensureLoaded();
    this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set("");
    try {
      this.items.set(await this.api.list());
    } catch (e: any) {
      this.error.set(this.readableError(e, 'Unable to load your projects.'));
    } finally {
      this.loading.set(false);
    }
  }

  private readableError(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.error || error?.message || fallback;
  }
  statusLabel(status: number | string): string {
    const key = String(status);
    const map: Record<string, string> = {
      "0": "projectsList.status.draft",
      "1": "projectsList.status.active",
      "2": "projectsList.status.paused",
      "3": "projectsList.status.completed",
      "4": "projectsList.status.archived",
      Draft: "projectsList.status.draft",
      Active: "projectsList.status.active",
      Paused: "projectsList.status.paused",
      Completed: "projectsList.status.completed",
      Archived: "projectsList.status.archived",
    };
    return map[key] ?? "projectsList.status.draft";
  }
  statusTone(status: number | string): string {
    const key = String(status);
    const map: Record<string, string> = {
      "0": "pending",
      "2": "pending",
      "1": "success",
      "3": "success",
      Draft: "pending",
      Paused: "pending",
      Active: "success",
      Completed: "success",
    };
    return map[key] ?? "danger";
  }

  isProjectExpanded(projectId: number): boolean {
    return this.expandedProjectId() === projectId;
  }

  toggleProjectOpportunities(projectId: number): void {
    this.expandedProjectId.update(current => current === projectId ? null : projectId);
  }

  latestOpportunities(project: Project): Project['opportunities'] {
    const timeline = [...(project.opportunities ?? [])]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber || this.opportunityDate(a) - this.opportunityDate(b) || a.id - b.id);
    return this.isProjectExpanded(project.id) ? timeline : timeline.slice(0, 2);
  }

  hasMoreOpportunities(project: Project): boolean {
    return (project.opportunities?.length ?? 0) > 2;
  }

  private opportunityDate(opportunity: Project['opportunities'][number]): number {
    const timestamp = Date.parse(opportunity.createdAt ?? '');
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  opportunityStageLabel(opportunity: Project['opportunities'][number]): string {
    const label = this.stageService.label(opportunity.projectStage, this.languageService.language() as 'en' | 'ar') || String(opportunity.projectStage ?? '');
    return this.stageService.find(opportunity.projectStage)?.allowsCustomName && opportunity.projectStageCustomName?.trim()
      ? `${label}: ${opportunity.projectStageCustomName.trim()}`
      : label;
  }

  categoryLabel(project: Project): string {
    const category = project.category;
    if (!category) return '-';
    return this.languageService.language() === 'ar'
      ? category.nameAr || category.nameEn
      : category.nameEn || category.nameAr;
  }
}
