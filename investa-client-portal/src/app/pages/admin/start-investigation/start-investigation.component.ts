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
  templateUrl: './start-investigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        summary: ['', [Validators.required, Validators.minLength(50)]],
        problem: ['', [Validators.required, Validators.minLength(50)]],
        solution: ['', [Validators.required, Validators.minLength(50)]],
        usp: ['', [Validators.required, Validators.minLength(20)]]
      }),
      step3: this.fb.group({
        targetFunding: [null, [Validators.required, Validators.min(1000)]],
        minInvestment: [null, [Validators.required, Validators.min(100)]],
        valuation: [null, [Validators.required, Validators.min(10000)]],
        financialsDoc: [null]
      }),
      step4: this.fb.group({
        teamMembers: this.fb.array([this.createTeamMember()]),
        legalEntity: ['', Validators.required],
        registrationCountry: ['', Validators.required],
        businessPlanDoc: [null, Validators.required]
      })
    });
  }

  // --- Step Navigation ---
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
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
    const stepGroup = this.investigationForm.get(`step${step}`);
    return stepGroup ? stepGroup.valid : false;
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
      console.log('Form Submitted!', this.investigationForm.getRawValue());
      
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
