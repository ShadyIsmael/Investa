import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Project, ProjectService } from "../../../services/project.service";
import { ProjectCategoryReference, ProjectCategoryService } from "../../../services/project-category.service";
import { LanguageService } from "../../../services/language.service";
import { CurrencyService, CurrencyReference } from "../../../services/currency.service";
import { ProjectStageReference, ProjectStageService } from "../../../services/project-stage.service";
import { TranslatePipe } from "../../../pipes/translate.pipe";
import { CurrencyDisplayPipe } from "../../../pipes/currency-display.pipe";

const foundedOnNotFutureValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { invalidDate: true };
  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) {
    return { invalidDate: true };
  }
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return value > todayKey ? { futureDate: true } : null;
};
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
  private categoryService = inject(ProjectCategoryService);
  private stageService = inject(ProjectStageService);
  error = signal("");
  submitted = signal(false);
  project = signal<Project | null>(null);
  saving = signal(false);
  currencies = signal<CurrencyReference[]>([]);
  categories = signal<ProjectCategoryReference[]>([]);
  stages = signal<ProjectStageReference[]>([]);
  form = this.fb.group({
    displayName: ["", [Validators.required, Validators.maxLength(200)]],
    legalName: ["", Validators.maxLength(250)],
    summary: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
    description: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(4000)]],
    industry: ["", Validators.maxLength(150)],
    geography: ["", Validators.maxLength(200)],
    foundedOn: ["", foundedOnNotFutureValidator],
    websiteUrl: ["", Validators.maxLength(500)],
    logoUrl: ["", Validators.maxLength(1000)],
    teamDescription: ["", Validators.maxLength(2000)],
    businessModel: ["", Validators.maxLength(2000)],
    riskDisclosure: ["", Validators.maxLength(4000)],
    defaultCurrency: ["", [Validators.minLength(3), Validators.maxLength(3)]],
    categoryId: [null],
    projectStage: [null as number | null, Validators.required],
  });
  constructor() {
    if (this.id && !this.edit) this.form.disable();
    Promise.all([this.currencyService.ensureLoaded(), this.categoryService.ensureLoaded(), this.stageService.ensureLoaded()]).then(() => {
      this.currencies.set(this.currencyService.master().filter(currency => currency.isActive));
      this.categories.set(this.categoryService.active());
      this.stages.set(this.stageService.all());
      if (!this.id) this.form.get('projectStage')?.setValue(this.stageService.active()[0]?.value ?? null);
    });
    if (this.id)
      this.api
        .getOne(this.id)
        .then((p) => {
          this.project.set(p);
          this.form.patchValue(p as any);
        })
        .catch((e) => this.error.set(e.message));
  }
  currencyLabel(c: CurrencyReference): string {
    return `${c.symbol} ${c.isoCode} — ${this.language() === 'ar' ? c.arabicName : c.englishName}`;
  }
  categoryLabel(category: ProjectCategoryReference): string { return this.categoryService.label(category, this.language()); }
  opportunityStageLabel(opportunity: NonNullable<Project['opportunities']>[number]): string {
    const label = this.stageService.label(opportunity.projectStage, this.language() as 'en' | 'ar') || String(opportunity.projectStage ?? '');
    return this.stageService.find(opportunity.projectStage)?.allowsCustomName && opportunity.projectStageCustomName?.trim()
      ? `${label}: ${opportunity.projectStageCustomName.trim()}`
      : label;
  }
  stageLabel(stage: ProjectStageReference): string { return this.stageService.label(stage.value, this.language() as 'en' | 'ar'); }
  fieldError(name: string): string {
    const control = this.form.get(name);
    if (!control || (!control.touched && !this.submitted())) return '';
    const server = control.errors?.['server'];
    if (server) {
      if (name === 'foundedOn' && /future|المستقبل/i.test(String(server))) return this.languageService.translate('projectEditor.validation.foundedOnFuture');
      if (name === 'categoryId' && /category|تصنيف/i.test(String(server))) return this.languageService.translate('projectEditor.validation.categoryInvalid');
      if (name === 'projectStage' && /stage|مرحلة/i.test(String(server))) return this.languageService.translate('projectEditor.validation.projectStageInvalid');
      if ((name === 'websiteUrl' || name === 'logoUrl') && /url|uri|رابط/i.test(String(server))) return this.languageService.translate('projectEditor.validation.urlInvalid');
      return String(server);
    }
    if (control.errors?.['required']) return this.languageService.translate(`projectEditor.validation.${name}Required`);
    if (control.errors?.['minlength']) {
      const required = control.errors['minlength'].requiredLength;
      return this.languageService.translate(`projectEditor.validation.${name}MinLength`).replace('{min}', String(required));
    }
    if (control.errors?.['maxlength']) {
      const required = control.errors['maxlength'].requiredLength;
      return this.languageService.translate(`projectEditor.validation.${name}MaxLength`).replace('{max}', String(required));
    }
    if (control.errors?.['futureDate']) return this.languageService.translate('projectEditor.validation.foundedOnFuture');
    if (control.errors?.['invalidDate']) return this.languageService.translate('projectEditor.validation.foundedOnInvalid');
    if (control.errors?.['email'] || control.errors?.['pattern']) return this.languageService.translate(`projectEditor.validation.${name}Invalid`);
    return '';
  }
  private focusFirstInvalid(): void {
    const first = Object.keys(this.form.controls).find(name => this.form.get(name)?.invalid);
    if (!first) return;
    setTimeout(() => {
      const element = document.querySelector<HTMLElement>(`[formControlName="${first}"]`);
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  private clearServerErrors(): void {
    Object.values(this.form.controls).forEach(control => {
      if (!control.errors?.['server']) return;
      const { server, ...rest } = control.errors;
      control.setErrors(Object.keys(rest).length ? rest : null);
    });
  }
  private applyBackendErrors(error: any): boolean {
    const body = error?.error ?? error;
    const data = body?.data ?? body?.errors;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    let mapped = false;
    Object.entries(data).forEach(([key, value]) => {
      const name = Object.keys(this.form.controls).find(controlName => controlName.toLowerCase() === key.toLowerCase());
      if (!name) return;
      const message = Array.isArray(value) ? value[0] : value;
      const control = this.form.get(name);
      if (!control || !message) return;
      control.setErrors({ ...(control.errors ?? {}), server: String(message) });
      control.markAsTouched();
      mapped = true;
    });
    if (mapped) this.focusFirstInvalid();
    return mapped;
  }
  isDraftProject(): boolean {
    const status = String(this.project()?.status ?? '').toLowerCase();
    return status === 'draft' || status === '0';
  }
  async save() {
    this.submitted.set(true);
    this.clearServerErrors();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set(this.languageService.translate('errors.validationSummary'));
      this.focusFirstInvalid();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      const value: any = this.form.getRawValue();
      if (!value.defaultCurrency) delete value.defaultCurrency;
      if (!value.foundedOn) delete value.foundedOn;
      const p = this.id
        ? await this.api.update(this.id, value)
        : await this.api.create(value);
      await this.router.navigate(["/admin/projects", p.id]);
    } catch (e: any) {
      const hasFieldErrors = this.applyBackendErrors(e);
      this.error.set(hasFieldErrors
        ? this.languageService.translate('errors.validationSummary')
        : this.readableError(e, this.languageService.translate('projectEditor.validation.saveFailed')));
    } finally {
      this.saving.set(false);
    }
  }

  async publishProject() {
    if (!this.id || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      const published = await this.api.transitionStatus(this.id, 'Active');
      this.project.set(published);
    } catch (e: any) {
      this.error.set(this.readableError(e, 'The project could not be published.'));
    } finally {
      this.saving.set(false);
    }
  }

  private readableError(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.error || error?.message || fallback;
  }
}
