import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ProfileService, CreditTransaction } from '../../../services/profile.service';
import { ApiErrorResponse } from '../../../models/api-response.model';
import { LanguageService } from '../../../services/language.service';
import { Router } from '@angular/router';
import { FileStoreService } from '../../../services/file-store.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmNewPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

type ActiveSection =
  | 'personal'
  | 'investment'
  | 'personalization'
  | 'notifications'
  | 'security'
  | 'credit'
  | 'score';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ProfileComponent {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('nationalIdInput') nationalIdInput!: ElementRef<HTMLInputElement>;

  activeSection = signal<ActiveSection>('personal');

  nationalIdFileName = signal<string | null>(null);
  nationalIdImageUrl = signal<string | null>(null);
  isUploadingNationalId = signal(false);
  nationalIdFiles = signal<Array<{ fileName: string; url: string; thumbUrl?: string }>>([]);
  replaceNationalIdIndex = signal<number | null>(null);

  isNationalIdVerified = signal(false);
  isIdCopyVerified = signal(false);

  isUploadingAvatar = signal(false);
  pendingAvatarUrl = signal<string | null>(null);

  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  public profileService = inject(ProfileService);

  private notificationService = inject(NotificationService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private fileStoreService = inject(FileStoreService);

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  fullName = computed(() => {
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
    if (this.pendingAvatarUrl()) return this.pendingAvatarUrl()!;
    const p = this.profileService.profile();
    if (p?.basicInfo?.avatarUrl) return p.basicInfo.avatarUrl;
    const seed = (p?.basicInfo?.firstName || 'user').replace(/\s+/g, '') || 'user';
    return `https://picsum.photos/seed/${seed}/200/200`;
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Phase 1 score/credibility UI removed for Profile V2.
  // Template references currentScorePts() and credit history; keep minimal score placeholder.
  currentScorePts = computed(() => 0);

  creditHistory = signal<CreditTransaction[]>([]);
  limitedCreditHistory = computed(() => this.creditHistory().slice(0, 5));

  currentLanguage = computed<'ar' | 'en'>(() => this.languageService.language());

  profileSnapshot = signal<string>('');

  communicationSnapshot = signal<string>('');

  profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl<string | null>(null),
    gender: new FormControl(''),
    nationality: new FormControl(''),
    country: new FormControl(''),
    nationalId: new FormControl(''),
    nationalIdCopy: new FormControl<File | null>(null),
    companyName: new FormControl(''),
    companyEmail: new FormControl(''),
    companyAddress: new FormControl(''),
    hrLetterCopy: new FormControl<File | null>(null),
    bio: new FormControl('', [Validators.maxLength(500)]),
    linkedinUrl: new FormControl(''),
    facebookUrl: new FormControl(''),
  });

  profileFormValues = toSignal(this.profileForm.valueChanges, { initialValue: this.profileForm.value });

  communicationForm = new FormGroup({
    email: new FormControl(''),
    mobile: new FormControl({ value: '', disabled: true }),
    address: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    businessAddress: new FormControl(''),
    businessLocationSearch: new FormControl(''),
    businessLat: new FormControl<number | null>(null),
    businessLng: new FormControl<number | null>(null),
  });

  communicationFormValues = toSignal(this.communicationForm.valueChanges, { initialValue: this.communicationForm.value });

  hrLetterFileName = signal<string>('');
  hrLetterBase64 = signal<string | null>(null);
  deviceMacAddress = signal<string | null>(null);

  otpSent = signal(false);
  passwordOtpMessage = signal<string>('');

  passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      otpToken: new FormControl(''),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmNewPassword: new FormControl('', [Validators.required])
    },
    { validators: passwordMatchValidator }
  );

  notificationSettingsForm = new FormGroup({
    newOpportunities: new FormControl(true),
    portfolioUpdates: new FormControl(false),
    securityAlerts: new FormControl(true),
    marketNews: new FormControl(true),
  });

  dobCalendarOpen = signal(false);
  dobCalendarMonth = signal<number>(new Date().getMonth());
  dobCalendarYear = signal<number>(new Date().getFullYear());

  isRtl = computed(() => this.languageService.direction() === 'rtl');

  nationalityOptions = [
    { code: 'EG', key: 'profile.personalInfo.country_egypt' },
    { code: 'SA', key: 'profile.personalInfo.country_saudi_arabia' },
    { code: 'AE', key: 'profile.personalInfo.country_uae' },
    { code: 'JO', key: 'profile.personalInfo.country_jordan' },
    { code: 'LB', key: 'profile.personalInfo.country_lebanon' },
    { code: 'US', key: 'profile.personalInfo.country_usa' },
    { code: 'GB', key: 'profile.personalInfo.country_uk' },
    { code: 'IN', key: 'profile.personalInfo.country_india' },
    { code: 'CA', key: 'profile.personalInfo.country_canada' },
    { code: 'AU', key: 'profile.personalInfo.country_australia' },
    { code: 'OT', key: 'profile.personalInfo.country_other' },
  ];

  isProfileChanged = computed(() => {
    const formValues = this.profileFormValues();
    const current = {
      firstName: formValues.firstName ?? '',
      lastName: formValues.lastName ?? '',
      nationalId: formValues.nationalId ?? '',
      companyName: formValues.companyName ?? '',
      companyEmail: formValues.companyEmail ?? '',
      companyAddress: formValues.companyAddress ?? '',
      hrLetterFileName: this.hrLetterFileName() ?? '',
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

  toggleDobCalendar(): void {
    const current = this.profileForm.get('dateOfBirth')?.value;
    if (!this.dobCalendarOpen()) {
      if (current) {
        const d = new Date(current);
        if (!isNaN(d.getTime())) {
          this.dobCalendarMonth.set(d.getMonth());
          this.dobCalendarYear.set(d.getFullYear());
        }
      }
    }
    this.dobCalendarOpen.set(!this.dobCalendarOpen());
  }

  closeDobCalendar(): void {
    this.dobCalendarOpen.set(false);
  }

  getYears(rangePast = 100, rangeFuture = 10): number[] {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = current - rangePast; y <= current + rangeFuture; y++) years.push(y);
    return years;
  }

  getMonths(): { idx: number; name: string }[] {
    const dict = this.languageService.dictionary();
    const m = dict?.common?.months;
    const names = [
      m?.jan ?? 'Jan',
      m?.feb ?? 'Feb',
      m?.mar ?? 'Mar',
      m?.apr ?? 'Apr',
      m?.may ?? 'May',
      m?.jun ?? 'Jun',
      m?.jul ?? 'Jul',
      m?.aug ?? 'Aug',
      m?.sep ?? 'Sep',
      m?.oct ?? 'Oct',
      m?.nov ?? 'Nov',
      m?.dec ?? 'Dec'
    ];
    return names.map((n, i) => ({ idx: i, name: n }));
  }

  getDaysForMonth(year: number, month: number): number[] {
    const last = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let d = 1; d <= last; d++) days.push(d);
    return days;
  }

  onSelectYear(y: number): void {
    this.dobCalendarYear.set(y);
  }

  onSelectMonth(m: number): void {
    this.dobCalendarMonth.set(m);
  }

  selectDob(day: Date): void {
    const iso = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())).toISOString().substr(0, 10);
    this.profileForm.patchValue({ dateOfBirth: iso });
    this.profileForm.get('dateOfBirth')?.markAsDirty();
    this.closeDobCalendar();
  }

  onSelectDayNumber(d: number): void {
    const y = this.dobCalendarYear();
    const m = this.dobCalendarMonth();
    this.selectDob(new Date(y, m, d));
  }

  isSelectedDob(day: number): boolean {
    const v = this.profileForm.get('dateOfBirth')?.value;
    if (!v) return false;
    const dt = new Date(v);
    if (isNaN(dt.getTime())) return false;
    return (
      dt.getFullYear() === this.dobCalendarYear() &&
      dt.getMonth() === this.dobCalendarMonth() &&
      dt.getDate() === day
    );
  }

  scrollToTop(): void {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    } catch {
      try {
        window.scrollTo(0, 0);
      } catch {}
    }
  }

  constructor() {
    (this as any).getCountryLabel = this.getCountryLabel.bind(this);

    this.profileForm.get('nationalId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isNationalIdVerified.set(false);
    });

    this.profileForm.get('nationalIdCopy')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isIdCopyVerified.set(false);
    });

    this.loadProfile();

    effect(() => {
      const p = this.profileService.profile();
      if (!p || this.profileSnapshot()) return;
      this.syncProfileToForms(p);
      this.initializeSnapshots(p);
    });

    this.loadProfileNotificationPreferences();
  }

  // Google Maps removed (Profile V2)

  getCountryLabel(code?: string | null): string {
    if (!code) return '';
    const found = this.nationalityOptions.find(c => c.code === code);
    if (found) return this.t(found.key);
    const foundByLabel = this.nationalityOptions.find(c => this.t(c.key) === code);
    if (foundByLabel) return this.t(foundByLabel.key);
    return code;
  }

  async loadCreditHistory(): Promise<void> {
    try {
      const history = await this.profileService.getCreditHistory();
      this.creditHistory.set(history);
    } catch {
      // non-critical
    }
  }

  async loadNationalIdFiles(): Promise<void> {
    try {
      const userId = this.profileService.profile()?.userId;
      if (!userId) return;
      const files = await this.fileStoreService.getNationalIdFiles(userId);
      const items = (files || []).map(f => ({ fileName: f.fileName, url: f.url }));
      const withThumbs = await this.generateThumbnails(items);
      this.nationalIdFiles.set(withThumbs);
      if (withThumbs.length > 0) this.nationalIdImageUrl.set(withThumbs[0].url);
    } catch {
      // non-critical
    }
  }

  private async generateThumbnails(items: Array<{ fileName: string; url: string }>): Promise<Array<{ fileName: string; url: string; thumbUrl?: string }>> {
    const results: Array<{ fileName: string; url: string; thumbUrl?: string }> = [];
    await Promise.all(
      items.map(async it => {
        try {
          const thumb = await this.createThumbnailFromUrl(it.url, 240, 160);
          results.push({ ...it, thumbUrl: thumb });
        } catch {
          results.push({ ...it, thumbUrl: undefined });
        }
      })
    );
    return results;
  }

  private createThumbnailFromUrl(url: string, maxWidth = 240, maxHeight = 160): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D not supported'));
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = url;
    });
  }

  private initializeSnapshots(p: ReturnType<typeof this.profileService.profile>): void {
    const snapshotObj = {
      firstName: p?.basicInfo?.firstName ?? '',
      lastName: p?.basicInfo?.lastName ?? '',
      dateOfBirth: p?.basicInfo?.dateOfBirth ? new Date(p.basicInfo.dateOfBirth as string).toISOString().substr(0, 10) : null,
      gender: (p?.basicInfo?.gender ?? '') as string,
      nationality: p?.basicInfo?.nationality ?? '',
      country: p?.basicInfo?.country ?? '',
      nationalId: p?.identityCompliance?.documentNumber ?? '',
      companyName: p?.basicInfo?.companyName ?? '',
      companyEmail: p?.contactInfo?.companyEmail ?? '',
      companyAddress: p?.contactInfo?.companyAddress ?? '',
      hrLetterFileName: p?.identityCompliance?.hrLetterFileName ?? '',
      bio: p?.basicInfo?.bio ?? '',
      linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
      facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? ''
    };
    this.profileSnapshot.set(JSON.stringify(snapshotObj));

    const commSnapshotObj = {
      email: p?.contactInfo?.email ?? '',
      address: p?.contactInfo?.address ?? '',
      city: p?.contactInfo?.city ?? '',
      state: p?.contactInfo?.phone2 ?? '',
      businessAddress: p?.contactInfo?.workAddress ?? p?.contactInfo?.companyAddress ?? '',
      businessLocationSearch: '',
      businessLat: null as number | null,
      businessLng: null as number | null
    };
    this.communicationSnapshot.set(JSON.stringify(commSnapshotObj));
  }

  private syncProfileToForms(p: ReturnType<typeof this.profileService.profile>): void {
    const incomingGender = p?.basicInfo?.gender ?? '';
    const normalizedGender = incomingGender
      ? incomingGender.toString().toLowerCase().startsWith('m')
        ? 'M'
        : incomingGender.toString().toLowerCase().startsWith('f')
          ? 'F'
          : incomingGender
      : '';

    const incomingNationality = p?.basicInfo?.nationality ?? '';
    let nationalityCode = '';
    if (incomingNationality) {
      const found = this.nationalityOptions.find(c => c.code === incomingNationality || this.t(c.key) === incomingNationality);
      nationalityCode = found ? found.code : incomingNationality;
    }

    this.profileForm.patchValue(
      {
        firstName: p?.basicInfo?.firstName ?? '',
        lastName: p?.basicInfo?.lastName ?? '',
        dateOfBirth: p?.basicInfo?.dateOfBirth ? new Date(p.basicInfo.dateOfBirth as string).toISOString().substr(0, 10) : null,
        gender: normalizedGender ?? '',
        nationality: nationalityCode ?? '',
        country: p?.basicInfo?.country ?? '',
        nationalId: p?.identityCompliance?.documentNumber ?? '',
        companyName: p?.basicInfo?.companyName ?? '',
        companyEmail: p?.contactInfo?.companyEmail ?? '',
        companyAddress: p?.contactInfo?.companyAddress ?? '',
        bio: p?.basicInfo?.bio ?? '',
        linkedinUrl: p?.basicInfo?.linkedInUrl ?? p?.contactInfo?.linkedInUrl ?? '',
        facebookUrl: p?.basicInfo?.facebookUrl ?? p?.contactInfo?.facebookUrl ?? ''
      },
      { emitEvent: false }
    );

    this.hrLetterFileName.set(p?.identityCompliance?.hrLetterFileName ?? '');
    this.hrLetterBase64.set(p?.identityCompliance?.hrLetterBase64 ?? null);

    // Communication fields retained but Google Places removed.
    this.communicationForm.patchValue(
      {
        email: p?.contactInfo?.email ?? '',
        mobile: p?.contactInfo?.phone1 ?? '',
        address: p?.contactInfo?.address ?? '',
        city: p?.contactInfo?.city ?? '',
        state: p?.contactInfo?.phone2 ?? '',
        businessAddress: p?.contactInfo?.workAddress ?? p?.contactInfo?.companyAddress ?? ''
      },
      { emitEvent: false }
    );

    const vs = p?.identityCompliance?.verificationStatus;
    const verified = vs === 'Verified';
    this.isNationalIdVerified.set(verified);
    this.isIdCopyVerified.set(verified);
  }

  async loadProfile(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const p = await this.profileService.loadMyProfile();
      if (!p) {
        this.errorMessage.set(this.t('profile.errors.notFound'));
      } else {
        await this.loadCreditHistory();
        await this.loadNationalIdFiles();
      }
    } catch {
      this.errorMessage.set(this.t('profile.errors.loadFailed'));
      this.profileService.clear();
    } finally {
      this.isLoading.set(false);
    }
  }

  loadProfileNotificationPreferences(): void {
    try {
      const raw = localStorage.getItem('investa:profileNotifications');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        newOpportunities?: boolean;
        portfolioUpdates?: boolean;
        securityAlerts?: boolean;
        marketNews?: boolean;
      };
      this.notificationSettingsForm.patchValue(
        {
          newOpportunities: parsed.newOpportunities ?? this.notificationSettingsForm.get('newOpportunities')?.value,
          portfolioUpdates: parsed.portfolioUpdates ?? this.notificationSettingsForm.get('portfolioUpdates')?.value,
          securityAlerts: parsed.securityAlerts ?? this.notificationSettingsForm.get('securityAlerts')?.value,
          marketNews: parsed.marketNews ?? this.notificationSettingsForm.get('marketNews')?.value
        },
        { emitEvent: false }
      );
    } catch {
      // ignore
    }
  }

  selectSection(section: ActiveSection) {
    this.activeSection.set(section);
    this.scrollToTop();
  }

  viewAllTransactions() {
    this.router.navigate(['/admin/transactions']);
  }

  navigateToChargeCredits() {
    this.router.navigate(['/admin/credit-charge']);
  }

  onAvatarClick(): void {
    this.avatarInput.nativeElement.click();
  }

  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.notificationService.showToast({
        title: this.t('profile.toasts.invalidFileTypeTitle'),
        message: this.t('profile.toasts.invalidFileTypeMessage'),
        type: 'error'
      });
      return;
    }

    const userId = this.profileService.profile()?.userId;
    if (!userId) return;

    try {
      this.isUploadingAvatar.set(true);
      const url = await this.fileStoreService.uploadProfilePicture(userId, file);
      this.pendingAvatarUrl.set(url);

      const existing = this.profileService.profile()!;
      await this.profileService.updateMyProfile({
        ...existing,
        basicInfo: { ...(existing.basicInfo ?? {}), avatarUrl: url }
      });

      await this.profileService.loadMyProfile();
      this.pendingAvatarUrl.set(null);

      this.notificationService.showToast({
        title: this.t('profile.toasts.avatarUpdatedTitle'),
        message: this.t('profile.toasts.avatarUpdatedMessage'),
        type: 'success'
      });
    } catch (e: any) {
      this.notificationService.showToast({
        title: this.t('profile.toasts.avatarUploadFailedTitle'),
        message: e?.message || this.t('profile.toasts.avatarUploadFailedMessage'),
        type: 'error'
      });
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files as FileList);
    this.nationalIdFileName.set(files[files.length - 1].name);
    this.profileForm.patchValue({ nationalIdCopy: files[files.length - 1] });
    this.profileForm.get('nationalIdCopy')?.markAsDirty();

    const userId = this.profileService.profile()?.userId;
    if (!userId) {
      input.value = '';
      return;
    }

    (async () => {
      const latestFiles = this.nationalIdFiles();
      let replaceIndex = this.replaceNationalIdIndex();

      try {
        this.isUploadingNationalId.set(true);

        for (const file of files) {
          let targetReplaceIndex = replaceIndex;
          const current = this.nationalIdFiles() || latestFiles || [];

          if (targetReplaceIndex === null) {
            targetReplaceIndex = current.length < 2 ? null : 0;
          }

          const url = await this.fileStoreService.uploadNationalId(userId, file);
          this.nationalIdImageUrl.set(url);

          if (targetReplaceIndex !== null) {
            const old = current[targetReplaceIndex];
            if (old) {
              try {
                await this.fileStoreService.deleteNationalId(userId, old.fileName);
              } catch {
                // ignore
              }
            }
          }

          await this.loadNationalIdFiles();
          replaceIndex = null;
        }
      } catch (e) {
        this.notificationService.showToast({
          title: this.t('profile.toasts.uploadFailedTitle'),
          message: this.t('profile.toasts.uploadFailedMessage'),
          type: 'error'
        });
      } finally {
        this.isUploadingNationalId.set(false);
        this.replaceNationalIdIndex.set(null);
        input.value = '';
      }
    })();
  }

  triggerNationalIdSelect(index?: number): void {
    try {
      this.replaceNationalIdIndex.set(typeof index === 'number' ? index : null);
      this.nationalIdInput?.nativeElement?.click();
    } catch {
      // ignore
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
        await this.profileService.loadMyProfile();
        const p = this.profileService.profile();
        if (p) this.initializeSnapshots(p);
        this.profileForm.markAsPristine();

        this.notificationService.showToast({
          title: this.t('profile.toasts.savedTitle'),
          message: this.t('profile.toasts.savedMessage'),
          type: 'success'
        });
      }
    } catch (e: any) {
      const apiErr = (e as any)?.error as ApiErrorResponse | undefined;
      const message = apiErr?.message || e?.message || this.t('profile.toasts.saveFailedMessage');
      this.errorMessage.set(message);
      this.notificationService.showToast({ title: this.t('profile.toasts.saveFailedTitle'), message, type: 'error' });
    } finally {
      this.isLoading.set(false);
    }
  }

  // Communication submit removed (Profile V2 removes Communication tab logic)

  async sendPasswordOtp(): Promise<void> {
    const currentPassword = this.passwordForm.get('currentPassword')?.value || '';
    if (!currentPassword) {
      this.passwordForm.get('currentPassword')?.markAsTouched();
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordValidationFailed') || 'Invalid password fields',
        message: this.t('profile.toasts.passwordValidationMessage') || 'Please fix the highlighted password fields before saving.',
        type: 'error'
      });
      return;
    }

    try {
      this.isLoading.set(true);
      await this.profileService.sendPasswordChangeOtp(currentPassword);
      this.otpSent.set(true);
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordOtpSentTitle') || 'OTP Sent',
        message: this.t('profile.toasts.passwordOtpSentMessage') || 'An OTP was sent to your mobile phone.',
        type: 'success'
      });
    } catch (e: any) {
      const apiErr = (e as any)?.error as ApiErrorResponse | undefined;
      const message = apiErr?.message || e?.message || this.t('profile.toasts.passwordSendOtpFailedMessage') || 'Failed to send OTP. Please try again.';
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordSendOtpFailedTitle') || 'OTP send failed',
        message,
        type: 'error'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPasswordSubmit(): Promise<void> {
    if (!this.otpSent()) {
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordOtpRequiredTitle') || 'OTP Required',
        message: this.t('profile.toasts.passwordOtpRequiredMessage') || 'Please request an OTP before changing your password.',
        type: 'error'
      });
      return;
    }

    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });

      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordValidationFailed') || 'Invalid password fields',
        message: this.t('profile.toasts.passwordValidationMessage') || 'Please fix the highlighted password fields before saving.',
        type: 'error'
      });
      return;
    }

    const otpToken = this.passwordForm.get('otpToken')?.value || '';
    const newPassword = this.passwordForm.get('newPassword')?.value || '';

    if (!otpToken) {
      this.passwordForm.get('otpToken')?.markAsTouched();
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordOtpRequiredTitle') || 'OTP Required',
        message: this.t('profile.toasts.passwordOtpRequiredMessage') || 'Please enter the OTP sent to your mobile.',
        type: 'error'
      });
      return;
    }

    try {
      this.isLoading.set(true);
      await this.profileService.confirmPasswordChange(otpToken, newPassword);
      this.passwordForm.reset();
      this.otpSent.set(false);

      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordChangedTitle') || 'Password changed',
        message: this.t('profile.toasts.passwordChangedMessage') || 'Your password was updated successfully.',
        type: 'success'
      });
    } catch (e: any) {
      const apiErr = (e as any)?.error as ApiErrorResponse | undefined;
      const message = apiErr?.message || e?.message || this.t('profile.toasts.passwordChangeFailedMessage') || 'Failed to change password. Please try again.';
      this.notificationService.showToast({
        title: this.t('profile.toasts.passwordChangeFailedTitle') || 'Password change failed',
        message,
        type: 'error'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  onNotificationSettingsSubmit() {
    if (this.notificationSettingsForm.invalid) return;
    try {
      const vals = this.notificationSettingsForm.getRawValue();
      localStorage.setItem('investa:profileNotifications', JSON.stringify(vals));
      this.notificationSettingsForm.markAsPristine();
      this.notificationService.showToast({ title: this.t('profile.toasts.savedTitle'), message: this.t('profile.toasts.savedMessage'), type: 'success' });
    } catch {
      this.notificationService.showToast({ title: this.t('profile.toasts.saveFailedTitle'), message: this.t('profile.toasts.saveFailedMessage'), type: 'error' });
    }
  }

  private buildProfileUpdatePayload() {
    const existing: NonNullable<ReturnType<typeof this.profileService.profile>> =
      this.profileService.profile() ?? { userId: '', coreMetrics: null, basicInfo: null, contactInfo: null, identityCompliance: null };

    const communicationRaw = this.communicationForm.getRawValue();
    const currentDocumentNumber = this.profileForm.get('nationalId')?.value ?? existing.identityCompliance?.documentNumber ?? null;
    const currentDocumentFrontImageUrl = this.nationalIdImageUrl() ?? existing.identityCompliance?.documentFrontImageUrl ?? null;
    const currentDocumentBackImageUrl = existing.identityCompliance?.documentBackImageUrl ?? null;

    return {
      ...existing,
      coreMetrics: {
        ...(existing.coreMetrics ?? {})
      },
      nationalId: currentDocumentNumber,
      basicInfo: {
        ...(existing.basicInfo ?? {}),
        firstName: this.profileForm.get('firstName')?.value ?? '',
        lastName: this.profileForm.get('lastName')?.value ?? '',
        dateOfBirth: this.profileForm.get('dateOfBirth')?.value ? new Date(this.profileForm.get('dateOfBirth')?.value as string).toISOString() : null,
        gender: this.profileForm.get('gender')?.value ?? null,
        nationality: this.profileForm.get('nationality')?.value ?? null,
        country: this.profileForm.get('country')?.value ?? null,
        companyName: this.profileForm.get('companyName')?.value ?? existing.basicInfo?.companyName ?? null,
        bio: this.profileForm.get('bio')?.value ?? '',
        linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? '',
        facebookUrl: this.profileForm.get('facebookUrl')?.value ?? '',
        avatarUrl: existing.basicInfo?.avatarUrl ?? null,
      },
      contactInfo: {
        ...(existing.contactInfo ?? {}),
        email: communicationRaw.email ?? existing.contactInfo?.email ?? null,
        phone1: existing.contactInfo?.phone1 ?? null,
        phone2: communicationRaw.state ?? existing.contactInfo?.phone2 ?? null,
        address: communicationRaw.address ?? existing.contactInfo?.address ?? null,
        city: communicationRaw.city ?? existing.contactInfo?.city ?? null,
        workAddress: communicationRaw.businessAddress ?? existing.contactInfo?.workAddress ?? null,
        companyEmail: this.profileForm.get('companyEmail')?.value ?? existing.contactInfo?.companyEmail ?? null,
        companyAddress: this.profileForm.get('companyAddress')?.value ?? communicationRaw.businessAddress ?? existing.contactInfo?.companyAddress ?? null,
        linkedInUrl: this.profileForm.get('linkedinUrl')?.value ?? existing.contactInfo?.linkedInUrl ?? null,
        facebookUrl: this.profileForm.get('facebookUrl')?.value ?? existing.contactInfo?.facebookUrl ?? null
      },
      identityCompliance: {
        ...(existing.identityCompliance ?? {}),
        documentNumber: currentDocumentNumber,
        verificationStatus: this.computeIdentityVerificationStatus(existing.identityCompliance, currentDocumentNumber, currentDocumentFrontImageUrl, currentDocumentBackImageUrl),
        documentFrontImageUrl: currentDocumentFrontImageUrl,
        documentBackImageUrl: currentDocumentBackImageUrl,
        hrLetterFileName: (this.hrLetterFileName() || existing.identityCompliance?.hrLetterFileName) ?? null,
        hrLetterBase64: (this.hrLetterBase64() || existing.identityCompliance?.hrLetterBase64) ?? null,
        deviceMacAddress: (this.deviceMacAddress() || existing.identityCompliance?.deviceMacAddress) ?? null
      }
    };
  }

  // KYC/Verification logic removed; keep only backend-driven verification status passthrough.
  private computeIdentityVerificationStatus(
    existingIdentityCompliance: NonNullable<ReturnType<typeof this.profileService.profile>>['identityCompliance'] | null,
    documentNumber: string | null,
    documentFrontImageUrl: string | null,
    documentBackImageUrl: string | null
  ): string | null {
    return existingIdentityCompliance?.verificationStatus ?? null;
  }
}

