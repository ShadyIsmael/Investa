import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { NotificationService } from '../../../services/notification.service';
import { LanguageService } from '../../../services/language.service';
import { get } from 'lodash-es';

@Component({
  standalone: true,
  selector: 'app-start-investigation',
  templateUrl: './start-investigation.component.html',  styleUrls: ['./start-investigation.component.scss'],  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class StartInvestigationComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);

  currentStep = signal(1);
  readonly totalSteps = 5;
  readonly stepKeys = ['basic', 'details', 'financials', 'team', 'review'];

  // Allow skipping Step 4 (Team & Legal)
  skipTeam = signal(false);

  // Draft key for localStorage
  private readonly DRAFT_KEY = 'investigationDraft';

  investigationForm: FormGroup;

  constructor() {
    this.investigationForm = this.fb.group({
      step1: this.fb.group({
        projectName: ['', Validators.required],
        tagline: ['', [Validators.required, Validators.maxLength(120)]],
        category: ['', Validators.required],
        projectLogo: [null, Validators.required]
      }),
      step2: this.fb.group({
        summary: ['', [Validators.required, Validators.minLength(20)]],
        problem: ['', [Validators.required, Validators.minLength(20)]],
        solution: ['', [Validators.required, Validators.minLength(20)]],
        usp: ['', [Validators.required, Validators.minLength(20)]]
      }),
      step3: this.fb.group({
        targetFunding: [null, [Validators.required, Validators.min(1000)]],
        minInvestment: [null, [Validators.required, Validators.min(100)]],
        valuation: [null, [Validators.required, Validators.min(10000)]],
        financialsDoc: [null]
      }),
      step4: this.fb.group({
        teamMembers: this.fb.array([]), // optional by default
        legalEntity: [''],
        registrationCountry: [''],
        businessPlanDoc: [null]
      })
    });
  }

  // --- Step Navigation ---
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      // mark current step controls as touched so validation UI updates
      this.markStepAsTouched(this.currentStep());

      if (this.isStepValid(this.currentStep())) {
        this.currentStep.update(s => s + 1);
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  isStepValid(step: number): boolean {
    // If step 4 and user chose to skip, it's valid
    if (step === 4 && this.skipTeam()) return true;

    const stepGroup = this.investigationForm.get(`step${step}`);
    return stepGroup ? stepGroup.valid : false;
  }

  // --- Draft management ---
  saveDraft(): void {
    const payload = {
      form: this.investigationForm.getRawValue(),
      currentStep: this.currentStep(),
      skipTeam: this.skipTeam()
    };
    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(payload));
      this.notificationService.showToast({ title: 'Draft Saved', message: 'Your draft was saved locally.', type: 'success' });
    } catch (e) {
      this.notificationService.showToast({ title: 'Save Failed', message: 'Unable to save draft.', type: 'error' });
    }
  }

  loadDraft(): void {
    const raw = localStorage.getItem(this.DRAFT_KEY);
    if (!raw) {
      this.notificationService.showToast({ title: 'No Draft', message: 'No saved draft found.', type: 'info' });
      return;
    }

    try {
      const payload = JSON.parse(raw);
      if (payload?.form) {
        // Patch values to form groups
        Object.keys(payload.form).forEach(key => {
          const group = this.investigationForm.get(key);
          if (group && typeof payload.form[key] === 'object') {
            group.patchValue(payload.form[key]);
          }
        });
        // rebuild teamMembers FormArray if present
        if (payload.form.step4?.teamMembers && Array.isArray(payload.form.step4.teamMembers)) {
          const arr = this.investigationForm.get('step4.teamMembers') as FormArray;
          arr.clear();
          for (const tm of payload.form.step4.teamMembers) {
            const fg = this.createTeamMember();
            fg.patchValue(tm);
            arr.push(fg);
          }
        }
        this.currentStep.set(payload.currentStep || 1);
        this.skipTeam.set(Boolean(payload.skipTeam));
        this.notificationService.showToast({ title: 'Draft Loaded', message: 'Your draft was loaded.', type: 'success' });
      }
    } catch (e) {
      this.notificationService.showToast({ title: 'Load Failed', message: 'Unable to load draft.', type: 'error' });
    }
  }

  clearDraft(): void {
    localStorage.removeItem(this.DRAFT_KEY);
    this.notificationService.showToast({ title: 'Draft Cleared', message: 'Saved draft removed.', type: 'success' });
  }
  
  isStepVisited(step: number): boolean {
    if (step <= this.currentStep()) return true;
    for (let i = 1; i < step; i++) {
        if (!this.isStepValid(i)) return false;
    }
    return true;
  }

  // --- FormArray for Team Members ---
  get teamMembers(): FormArray {
    return this.investigationForm.get('step4.teamMembers') as FormArray;
  }

  // --- Helpers for validation and UI feedback ---
  private markStepAsTouched(step: number): void {
    const group = this.investigationForm.get(`step${step}`) as FormGroup | null;
    if (!group) return;
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  getStepControl(step: number, name: string) {
    return this.investigationForm.get(`step${step}.${name}`);
  }

  getCharCount(step: number, name: string): number {
    const value = this.getStepControl(step, name)?.value || '';
    return typeof value === 'string' ? value.length : 0;
  }

  createTeamMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      bio: ['', Validators.maxLength(200)],
      linkedin: ['', Validators.pattern('https?://.+')]
    });
  }

  addTeamMember() {
    this.teamMembers.push(this.createTeamMember());
  }

  removeTeamMember(index: number) {
    this.teamMembers.removeAt(index);
  }

  // --- File Handling ---
  onFileChange(event: Event, controlName: string, step: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formGroup = this.investigationForm.get(`step${step}`) as FormGroup;
      formGroup.patchValue({ [controlName]: file });
      formGroup.get(controlName)?.markAsDirty();
    }
  }

  getFileName(controlName: string, step: number): string | null {
    const file = this.investigationForm.get(`step${step}.${controlName}`)?.value;
    return file instanceof File ? file.name : null;
  }
  
  // --- Submission ---
  onSubmit() {
    if (this.investigationForm.valid) {
      const dictionary = this.languageService.dictionary();
      const titleTemplate = get(dictionary, 'startInvestigation.success.title', 'Submission Received');
      const messageTemplate = get(dictionary, 'startInvestigation.success.message', 'Your project has been submitted.');
      const projectName = this.investigationForm.get('step1.projectName')?.value || 'New Project';
      
      this.notificationService.showToast({
        title: titleTemplate,
        message: messageTemplate.replace('{projectName}', projectName),
        type: 'success'
      });
      
      this.router.navigate(['/admin/investments']);
    }
  }
}
