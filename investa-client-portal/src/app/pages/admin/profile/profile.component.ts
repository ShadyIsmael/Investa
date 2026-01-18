import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmNewPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

type ActiveSection = 'details' | 'communication' | 'security' | 'notifications';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ProfileComponent {
  activeSection = signal<ActiveSection>('details');
  nationalIdFileName = signal<string | null>(null);

  isNationalIdVerified = signal(false);
  isIdCopyVerified = signal(false);
  
  private destroyRef = inject(DestroyRef);

  // Pre-fill with some dummy data
  profileForm = new FormGroup({
    firstName: new FormControl('Admin', [Validators.required]),
    lastName: new FormControl('User', [Validators.required]),
    businessRole: new FormControl('Lead Investor', [Validators.required]),
    nationalId: new FormControl('123-456-789', [Validators.required]),
    nationalIdCopy: new FormControl<File | null>(null),
    bio: new FormControl('Experienced investor with a passion for AI-driven strategies.', [Validators.maxLength(500)]),
    linkedinUrl: new FormControl('https://linkedin.com/in/admin', [Validators.pattern('https?://.+')]),
    facebookUrl: new FormControl('https://facebook.com/admin', [Validators.pattern('https?://.+')]),
  });

  communicationForm = new FormGroup({
    email: new FormControl({ value: 'admin@investa.com', disabled: true }),
    mobile: new FormControl({ value: '1234567890', disabled: true }),
    address: new FormControl('123 Tech Lane', [Validators.required]),
    city: new FormControl('Future City', [Validators.required]),
    state: new FormControl('CA', [Validators.required]),
    businessAddress: new FormControl('456 Business Blvd', [Validators.required]),
    businessLocationSearch: new FormControl(''),
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator });

  notificationSettingsForm = new FormGroup({
    newOpportunities: new FormControl(true),
    portfolioUpdates: new FormControl(false),
    securityAlerts: new FormControl(true),
    marketNews: new FormControl(true),
  });

  trustScore = computed(() => {
    let score = 10; // Base score
    if (this.isNationalIdVerified()) score += 30;
    if (this.isIdCopyVerified()) score += 30;
    if (this.profileForm.get('bio')?.value) score += 15;
    if (this.profileForm.get('linkedinUrl')?.value || this.profileForm.get('facebookUrl')?.value) score += 15;
    return Math.min(score, 100);
  });

  circumference = 2 * Math.PI * 45; // r = 45
  strokeOffset = computed(() => this.circumference - (this.trustScore() / 100) * this.circumference);

  constructor() {
    this.profileForm.get('nationalId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isNationalIdVerified.set(false);
    });
    this.profileForm.get('nationalIdCopy')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isIdCopyVerified.set(false);
    });
  }

  selectSection(section: ActiveSection) {
    this.activeSection.set(section);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.nationalIdFileName.set(file.name);
      this.profileForm.patchValue({ nationalIdCopy: file });
      this.profileForm.get('nationalIdCopy')?.markAsDirty();
    }
  }

  onProfileSubmit() {
    if (this.profileForm.invalid) return;
    
    console.log('Profile updated:', this.profileForm.getRawValue());
    
    // Simulate verification
    if (this.profileForm.get('nationalId')?.value) {
      setTimeout(() => this.isNationalIdVerified.set(true), 1000);
    }
    if (this.profileForm.get('nationalIdCopy')?.value) {
      setTimeout(() => this.isIdCopyVerified.set(true), 1000);
    }

    this.profileForm.markAsPristine();
  }

  onCommunicationSubmit() {
    if (this.communicationForm.invalid) return;
    console.log('Communication info updated:', this.communicationForm.getRawValue());
    this.communicationForm.markAsPristine();
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;
    console.log('Password change submitted.');
    this.passwordForm.reset();
  }

  onNotificationSettingsSubmit() {
    if (this.notificationSettingsForm.invalid) return;
    console.log('Notification settings updated:', this.notificationSettingsForm.getRawValue());
    this.notificationSettingsForm.markAsPristine();
  }
}