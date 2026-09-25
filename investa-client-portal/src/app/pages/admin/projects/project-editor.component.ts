import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Project, ProjectService } from "../../../services/project.service";
import { OpportunityLookup, OpportunityService } from "../../../services/opportunity.service";
import { LanguageService } from "../../../services/language.service";
import { CurrencyService, CurrencyReference } from "../../../services/currency.service";
import { TranslatePipe } from "../../../pipes/translate.pipe";
import { CurrencyDisplayPipe } from "../../../pipes/currency-display.pipe";
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, CurrencyDisplayPipe],
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
})
export class ProjectEditorComponent {
  id = inject(ActivatedRoute).snapshot.paramMap.get("id");
  edit = inject(ActivatedRoute).snapshot.url.at(-1)?.path === "edit";
  router = inject(Router);
  languageService = inject(LanguageService);
  direction = this.languageService.direction;
  language = this.languageService.language;
  private api = inject(ProjectService);
  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);
  private opportunityService = inject(OpportunityService);
  error = signal("");
  project = signal<Project | null>(null);
  saving = signal(false);
  currencies = signal<CurrencyReference[]>([]);
  categories = signal<OpportunityLookup[]>([]);
  form = this.fb.group({
    displayName: ["", Validators.required],
    legalName: [""],
    summary: ["", [Validators.required, Validators.minLength(20)]],
    description: ["", [Validators.required, Validators.minLength(20)]],
    industry: [""],
    geography: [""],
    foundedOn: [""],
    websiteUrl: [""],
    logoUrl: [""],
    teamDescription: [""],
    businessModel: [""],
    riskDisclosure: [""],
    defaultCurrency: [""],
    categoryId: [null],
  });
  constructor() {
    Promise.all([this.currencyService.ensureLoaded(), this.opportunityService.getCategories()]).then(([, categories]) => {
      this.currencies.set(this.currencyService.master());
      this.categories.set(categories);
    });
    if (this.id)
      this.api
        .getOne(this.id)
        .then((p) => {
          this.project.set(p);
          this.form.patchValue(p as any);
          if (!this.edit) this.form.disable();
        })
        .catch((e) => this.error.set(e.message));
  }
  currencyLabel(c: CurrencyReference): string {
    return `${c.symbol} ${c.isoCode} — ${this.language() === 'ar' ? c.arabicName : c.englishName}`;
  }
  opportunityStageLabel(opportunity: NonNullable<Project['opportunities']>[number]): string {
    const names: Record<string, number> = { Idea: 1, MVP: 2, Startup: 3, Scaling: 4, Established: 5, Other: 6 };
    const stage = Number(opportunity.projectStage) || names[String(opportunity.projectStage)] || 0;
    const label = this.languageService.translate(`opportunityEditor.projectStages.${stage}`);
    return stage === 6 && opportunity.projectStageCustomName?.trim()
      ? `${label}: ${opportunity.projectStageCustomName.trim()}`
      : label;
  }
  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const value: any = this.form.getRawValue();
      if (!value.defaultCurrency) delete value.defaultCurrency;
      if (!value.foundedOn) delete value.foundedOn;
      const p = this.id
        ? await this.api.update(this.id, value)
        : await this.api.create(value);
      await this.router.navigate(["/admin/projects", p.id]);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.saving.set(false);
    }
  }
}
