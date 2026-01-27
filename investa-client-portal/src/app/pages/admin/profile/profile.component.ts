import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ProfileService, CreditTransaction } from '../../../services/profile.service';
import { LanguageService } from '../../../services/language.service';

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
  private languageService = inject(LanguageService);

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  // Derived fields from loaded profile
  fullName = computed(() => {
    // Use form values for real-time updates, fall back to backend profile
    const formFirst = this.profileForm.get('firstName')?.value || '';
    const formLast = this.profileForm.get('lastName')?.value || '';
    
    if (formFirst || formLast) {
      return `${formFirst} ${formLast}`.trim();
    }
    
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
    const formValues = this.profileFormValues();
    const current = {
      firstName: formValues.firstName ?? '',
      lastName: formValues.lastName ?? '',
      businessRole: formValues.businessRole ?? '',
      nationalId: formValues.nationalId ?? '',
      bio: formValues.bio ?? '',
      linkedinUrl: formValues.linkedinUrl ?? '',
      facebookUrl: formValues.facebookUrl ?? ''
    };
    try {
      return JSON.stringify(current) !== this.profileSnapshot();
    } catch {
      return false;
    }
  });

  communicationSnapshot = signal<string>('');

  isCommunicationChanged = computed(() => {
    const formValues = this.communicationFormValues();
    const current = {
      email: formValues.email ?? '',
      address: formValues.address ?? '',
      city: formValues.city ?? '',
      state: formValues.state ?? '',
      businessAddress: formValues.businessAddress ?? ''
    };
    try {
      return JSON.stringify(current) !== this.communicationSnapshot();
    } catch {
      return false;
    }
  });

  getJustification = (transaction: CreditTransaction): string => {
    return this.currentLanguage() === 'ar' ? transaction.justificationAr : transaction.justificationEn;
  };

  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    businessRole: new FormControl(''),
    nationalId: new FormControl(''),
    nationalIdCopy: new FormControl<File | null>(null),
    bio: new FormControl('', [Validators.maxLength(500)]),
    linkedinUrl: new FormControl(''),
    facebookUrl: new FormControl(''),
  });

  // Convert form values to signal for reactive change detection
  profileFormValues = toSignal(this.profileForm.valueChanges, { initialValue: this.profileForm.value });

  communicationForm = new FormGroup({
    email: new FormControl(''),
    mobile: new FormControl({ value: '', disabled: true }),
    address: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    businessAddress: new FormControl(''),
    businessLocationSearch: new FormControl(''),
  });

  // Convert form values to signal for reactive change detection
  communicationFormValues = toSignal(this.communicationForm.valueChanges, { initialValue: this.communicationForm.value });

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
    const backendScore = p?.coreMetrics?.currentCredibilityScore ?? p?.coreMetrics?.credibilityScore;
    if (backendScore != null) {
      return Math.min(100, Math.max(0, backendScore));
    }

    let score = 10; // Base score when backend not provided
    const kycVerified = this.kycStatus() === 'Verified';
    if (kycVerified) score += 60;
    if (this.isNationalIdVerified()) score += 20;
    if (this.isIdCopyVerified()) score += 20;
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

    // Patch forms once when profile first loads
    effect(() => {
      const p = this.profileService.profile();
      if (!p || this.profileSnapshot()) return; // Only sync if snapshot not initialized

      this.syncProfileToForms(p);
      this.initializeSnapshots(p);

    });
  }

  private syncProfileToForms(p: ReturnType<typeof this.profileService.profile>): void {
    // Patch personal details
    this.profileForm.patchValue({
      firstName: p?.basicInfo?.firstName ?? '',
      lastName: p?.basicInfo?.lastName ?? '',
      businessRole: p?.coreMetrics?.clientType ?? p?.coreMetrics?.role ?? '',
      nationalId: p?.identityCompliance?.documentNumber ?? '',
      bio: p?.basicInfo?.bio ?? '',
      linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
      facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? '',
    }, { emitEvent: false });

    // Patch communication info
    this.communicationForm.patchValue({
      email: p?.contactInfo?.email ?? '',
      mobile: p?.contactInfo?.phone1 ?? '',
      address: p?.contactInfo?.address ?? '',
      city: p?.contactInfo?.workAddress ?? '',
      state: p?.contactInfo?.phone2 ?? '',
      businessAddress: p?.contactInfo?.workAddress ?? '',
    }, { emitEvent: false });

    // Sync identity verification flags from backend
    const vs = p?.identityCompliance?.verificationStatus;
    const verified = vs === 'Verified';
    this.isNationalIdVerified.set(verified);
    this.isIdCopyVerified.set(verified);
  }

  private initializeSnapshots(p: ReturnType<typeof this.profileService.profile>): void {
    // Initialize profile snapshot for change detection
    const snapshotObj = {
      firstName: p?.basicInfo?.firstName ?? '',
      lastName: p?.basicInfo?.lastName ?? '',
      businessRole: p?.coreMetrics?.clientType ?? p?.coreMetrics?.role ?? '',
      nationalId: p?.identityCompliance?.documentNumber ?? '',
      bio: p?.basicInfo?.bio ?? '',
      linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
      facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? ''
    };
    this.profileSnapshot.set(JSON.stringify(snapshotObj));

    // Initialize communication snapshot for change detection
    const commSnapshotObj = {
      email: p?.contactInfo?.email ?? '',
      address: p?.contactInfo?.address ?? '',
      city: p?.contactInfo?.workAddress ?? '',
      state: p?.contactInfo?.phone2 ?? '',
      businessAddress: p?.contactInfo?.workAddress ?? ''
    };
    this.communicationSnapshot.set(JSON.stringify(commSnapshotObj));
  }

  async onStartKyc(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      await this.profileService.startKyc();
      await this.profileService.loadMyProfile();
      await this.loadCreditHistory();
      this.notificationService.showToast({
        title: this.t('profile.toasts.kycStartedTitle'),
        message: this.t('profile.toasts.kycStartedMessage'),
        type: 'success'
      });
    } catch (e: any) {
      const message = e?.error?.message || this.t('profile.toasts.kycFailedMessage');
      this.errorMessage.set(message);
      this.notificationService.showToast({
        title: this.t('profile.toasts.kycFailedTitle'),
        message,
        type: 'error'
      });
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
        this.errorMessage.set(this.t('profile.errors.notFound'));
      } else {
        // Load credit history after loading profile
        await this.loadCreditHistory();
      }
    } catch (e) {
      this.errorMessage.set(this.t('profile.errors.loadFailed'));
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

    const profileDto = this.buildProfileUpdatePayload();

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.notificationService.showToast({
        title: this.t('profile.toasts.savingTitle'),
        message: this.t('profile.toasts.savingMessage'),
        type: 'info'
      });

      const updated = await this.profileService.updateMyProfile(profileDto);
      if (updated) {
        // Reload profile to get fresh data from backend
        await this.profileService.loadMyProfile();
        
        // Reinitialize snapshots with updated data
        const p = this.profileService.profile();
        if (p) this.initializeSnapshots(p);
        this.profileForm.markAsPristine();

        // Verify server persisted client-side changes (role, national id)
        const submittedRole = profileDto.coreMetrics?.clientType ?? profileDto.coreMetrics?.role ?? null;
        const submittedNationalId = profileDto.identityCompliance?.documentNumber ?? null;
        if (p) {
          const persistedRole = p.coreMetrics?.clientType ?? p.coreMetrics?.role ?? null;
          const persistedNationalId = p.identityCompliance?.documentNumber ?? null;
          if (submittedRole && persistedRole !== submittedRole) {
            console.warn('Role was not persisted by server', { submittedRole, persistedRole });
            this.notificationService.showToast({ title: this.t('profile.toasts.roleNotPersistedTitle'), message: this.t('profile.toasts.roleNotPersistedMessage'), type: 'warning' });
          }
          if (submittedNationalId && persistedNationalId !== submittedNationalId) {
            console.warn('National ID was not persisted by server', { submittedNationalId, persistedNationalId });
            this.notificationService.showToast({ title: this.t('profile.toasts.nationalIdNotPersistedTitle'), message: this.t('profile.toasts.nationalIdNotPersistedMessage'), type: 'warning' });
          }

          // If the submitted national id was persisted and differs from previous, notify user that change is recorded and under review
          const previousNationalId = existing.identityCompliance?.documentNumber ?? null;
          if (submittedNationalId && persistedNationalId === submittedNationalId && submittedNationalId !== previousNationalId) {
            this.notificationService.showToast({ title: this.t('profile.toasts.nationalIdChangeRecordedTitle'), message: this.t('profile.toasts.nationalIdChangeRecordedMessage'), type: 'info' });
          }
        }

        this.notificationService.showToast({
          title: this.t('profile.toasts.savedTitle'),
          message: this.t('profile.toasts.savedMessage'),
          type: 'success'
        });
      }
    } catch (e) {
      const message = e && e.error && e.error.message ? e.error.message : this.t('profile.toasts.saveFailedMessage');
      this.errorMessage.set(message);
      this.notificationService.showToast({
        title: this.t('profile.toasts.saveFailedTitle'),
        message: message,
        type: 'error'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  onCommunicationSubmit() {
    if (this.communicationForm.invalid) return;
    const profileDto = this.buildProfileUpdatePayload();
    this.profileService.updateMyProfile(profileDto)
      .then(async () => {
        // Reload profile to get fresh data from backend
        await this.profileService.loadMyProfile();
        
        // Reinitialize communication snapshot with updated data
        const p = this.profileService.profile();
        if (p) this.initializeSnapshots(p);
        
        this.communicationForm.markAsPristine();
        this.notificationService.showToast({
          title: this.t('profile.toasts.savedTitle'),
          message: this.t('profile.toasts.savedMessage'),
          type: 'success'
        });
      })
      .catch((e) => {
        const message = e && e.error && e.error.message ? e.error.message : this.t('profile.toasts.saveFailedMessage');
        this.notificationService.showToast({
          title: this.t('profile.toasts.saveFailedTitle'),
          message,
          type: 'error'
        });
      });
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

  private buildProfileUpdatePayload() {
    const existing = this.profileService.profile() ?? { userId: '', coreMetrics: null, basicInfo: null, contactInfo: null, identityCompliance: null };
    const communicationRaw = this.communicationForm.getRawValue();

    return {
      ...existing,
      coreMetrics: {
        ...(existing.coreMetrics ?? {}),
        clientType: this.profileForm.get('businessRole')?.value ?? existing.coreMetrics?.clientType ?? null,
        role: this.profileForm.get('businessRole')?.value ?? existing.coreMetrics?.role ?? null,
        // Try to provide a numeric clientType when a known role is used (backend may expect enum int)
        clientTypeId: this.mapBusinessRoleToClientTypeId(this.profileForm.get('businessRole')?.value) ?? null
      },
      // Also include a top-level nationalId (some backend versions use this field)
      nationalId: this.profileForm.get('nationalId')?.value ?? existing.identityCompliance?.documentNumber ?? null,
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
        email: communicationRaw.email ?? existing.contactInfo?.email ?? null,
        phone1: existing.contactInfo?.phone1 ?? null,
        phone2: communicationRaw.state ?? existing.contactInfo?.phone2 ?? null,
        address: communicationRaw.address ?? existing.contactInfo?.address ?? null,
        workAddress: communicationRaw.businessAddress ?? existing.contactInfo?.workAddress ?? null,
        linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? existing.contactInfo?.linkedInUrl ?? null,
        facebookUrl: this.profileForm.get('facebookUrl')?.value ?? existing.contactInfo?.facebookUrl ?? null
      },
      identityCompliance: {
        ...(existing.identityCompliance ?? {}),
        documentNumber: this.profileForm.get('nationalId')?.value ?? existing.identityCompliance?.documentNumber ?? null
      }
    };
  }

  private mapBusinessRoleToClientTypeId(role?: string | null): number | null {
    if (!role) return null;
    const normalized = role.trim().toLowerCase();
    const map: Record<string, number> = {
      'investor': 0,
      'founder': 1,
      'both': 2
    };
    return map[normalized] ?? null;
  }
}