import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ProfileService, CreditTransaction } from '../../../services/profile.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmNewPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

type ActiveSection = 'details' | 'communication' | 'security' | 'notifications';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',  styleUrls: ['./profile.component.scss'],  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ProfileComponent {
  activeSection = signal<ActiveSection>('details');
  nationalIdFileName = signal<string | null>(null);

  isNationalIdVerified = signal(false);
  isIdCopyVerified = signal(false);
  
  private destroyRef = inject(DestroyRef);
  public profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);

  // Derived fields from loaded profile
  fullName = computed(() => {
    const p = this.profileService.profile();
    if (!p) return '';
    if (p.basicInfo?.fullName) return p.basicInfo.fullName;
    return `${p.basicInfo?.firstName ?? ''} ${p.basicInfo?.lastName ?? ''}`.trim();
  });

  avatarUrl = computed(() => {
    const p = this.profileService.profile();
    if (p?.basicInfo?.avatarUrl) return p.basicInfo.avatarUrl;
    const seed = (p?.basicInfo?.firstName || 'user').replace(/\s+/g, '') || 'user';
    return `https://picsum.photos/seed/${seed}/200/200`;
  });

  // Loading and error state for fetch
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // KYC status derived from backend
  kycStatus = computed(() => this.profileService.profile()?.identityCompliance?.verificationStatus ?? 'None');

  // Credit history
  creditHistory = signal<CreditTransaction[]>([]);

  // Current language preference (detect from navigator or user settings)
  currentLanguage = signal<'ar' | 'en'>('en');

  // Snapshot used to detect changes for enabling Save button
  profileSnapshot = signal<string>('');

  isProfileChanged = computed(() => {
    const current = {
      firstName: this.profileForm.get('firstName')?.value ?? '',
      lastName: this.profileForm.get('lastName')?.value ?? '',
      bio: this.profileForm.get('bio')?.value ?? '',
      linkedinUrl: this.profileForm.get('linkedinUrl')?.value ?? '',
      facebookUrl: this.profileForm.get('facebookUrl')?.value ?? ''
    };
    try {
      return JSON.stringify(current) !== this.profileSnapshot();
    } catch {
      return false;
    }
  });

  getJustification = (transaction: CreditTransaction): string => {
    return this.currentLanguage() === 'ar' ? transaction.justificationAr : transaction.justificationEn;
  };

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
    const p = this.profileService.profile();
    // Prefer backend-provided credibilityScore when available (scale to 0-100)
    if (p?.coreMetrics?.credibilityScore != null) {
      const percent = Math.min(100, Math.round((p.coreMetrics.credibilityScore / 5000) * 100));
      return percent;
    }

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
    // Reset verification flags when id inputs change
    this.profileForm.get('nationalId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isNationalIdVerified.set(false);
    });
    this.profileForm.get('nationalIdCopy')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isIdCopyVerified.set(false);
    });

    // Load profile from API on component init
    this.loadProfile();

    // Patch forms whenever the profile signal updates
    effect(() => {
      const p = this.profileService.profile();
      if (!p) return;

      // Patch personal details
      this.profileForm.patchValue({
        firstName: p.basicInfo?.firstName ?? '',
        lastName: p.basicInfo?.lastName ?? '',
        bio: p.basicInfo?.bio ?? '',
        linkedinUrl: p.basicInfo?.linkedInUrl ?? p.contactInfo?.linkedInUrl ?? '',
        facebookUrl: p.basicInfo?.facebookUrl ?? p.contactInfo?.facebookUrl ?? '',
      }, { emitEvent: false });

      // Patch communication info
      this.communicationForm.patchValue({
        email: p.contactInfo?.email ?? '',
        mobile: p.contactInfo?.phone1 ?? '',
      }, { emitEvent: false });

      // Sync identity verification flags from backend
      const vs = p.identityCompliance?.verificationStatus;
      this.isNationalIdVerified.set(vs === 'Verified');
      this.isIdCopyVerified.set(vs === 'Verified');

    });
  }

  async onStartKyc(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      await this.profileService.startKyc();
      // Reload credit history after starting KYC
      await this.loadCreditHistory();
      this.errorMessage.set('KYC started successfully. You earned +10 credibility points!');
    } catch (e: any) {
      const message = e?.error?.message || 'Failed to start KYC. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCreditHistory(): Promise<void> {
    try {
      const history = await this.profileService.getCreditHistory();
      this.creditHistory.set(history);
    } catch (e) {
      // Silently fail - credit history is not critical
    }
  }

  async loadProfile(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const p = await this.profileService.loadMyProfile();
      if (!p) {
        this.errorMessage.set('Profile not found');
      } else {
        // Load credit history after loading profile
        await this.loadCreditHistory();

        // Initialize profile snapshot for change detection
        const snapshotObj = {
          firstName: p.basicInfo?.firstName ?? '',
          lastName: p.basicInfo?.lastName ?? '',
          bio: p.basicInfo?.bio ?? '',
          linkedinUrl: p.basicInfo?.linkedInUrl ?? p.contactInfo?.linkedInUrl ?? '',
          facebookUrl: p.basicInfo?.facebookUrl ?? p.contactInfo?.facebookUrl ?? ''
        };
        this.profileSnapshot.set(JSON.stringify(snapshotObj));
      }
    } catch (e) {
      this.errorMessage.set('Failed to load profile. Please try again.');
      // Clear any stale profile data
      this.profileService.clear();
    } finally {
      this.isLoading.set(false);
    }
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

  async onProfileSubmit(): Promise<void> {
    if (this.profileForm.invalid) return;

    // Build profile DTO to send (merge with existing profile where available)
    const existing = this.profileService.profile() ?? { userId: '', coreMetrics: null, basicInfo: null, contactInfo: null, identityCompliance: null };

    const profileDto = {
      ...existing,
      basicInfo: {
        ...(existing.basicInfo ?? {}),
        firstName: this.profileForm.get('firstName')?.value ?? '',
        lastName: this.profileForm.get('lastName')?.value ?? '',
        bio: this.profileForm.get('bio')?.value ?? '',
        linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? '',
        facebookUrl: this.profileForm.get('facebookUrl')?.value ?? '',
      },
      contactInfo: {
        ...(existing.contactInfo ?? {}),
        linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? '',
        facebookUrl: this.profileForm.get('facebookUrl')?.value ?? ''
      }
    } as any;

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // show a transient saving toast
      this.notificationService.showToast({ title: 'Saving', message: 'Saving your profile…', type: 'info' });

      const updated = await this.profileService.updateMyProfile(profileDto);
      if (updated) {
        // update snapshot and mark pristine
        const snapshotObj = {
          firstName: updated.basicInfo?.firstName ?? '',
          lastName: updated.basicInfo?.lastName ?? '',
          bio: updated.basicInfo?.bio ?? '',
          linkedinUrl: updated.basicInfo?.linkedInUrl ?? updated.contactInfo?.linkedInUrl ?? '',
          facebookUrl: updated.basicInfo?.facebookUrl ?? updated.contactInfo?.facebookUrl ?? ''
        };
        this.profileSnapshot.set(JSON.stringify(snapshotObj));
        this.profileForm.markAsPristine();
        this.errorMessage.set('Profile saved successfully');

        // show success toast
        this.notificationService.showToast({
          title: 'Profile Saved',
          message: 'Your profile was updated successfully.',
          type: 'success'
        });
      }
    } catch (e) {
      const message = e && e.error && e.error.message ? e.error.message : 'Failed to save profile. Please try again.';
      this.errorMessage.set(message);
      this.notificationService.showToast({
        title: 'Save Failed',
        message: message,
        type: 'error'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  onCommunicationSubmit() {
    if (this.communicationForm.invalid) return;
    // TODO: Implement communication settings update
    this.communicationForm.markAsPristine();
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;
    // TODO: Implement password change
    this.passwordForm.reset();
  }

  onNotificationSettingsSubmit() {
    if (this.notificationSettingsForm.invalid) return;
    // TODO: Implement notification settings update
    this.notificationSettingsForm.markAsPristine();
  }
}