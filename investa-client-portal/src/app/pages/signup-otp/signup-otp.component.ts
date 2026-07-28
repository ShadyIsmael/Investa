import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-signup-otp',
  templateUrl: './signup-otp.component.html',
  styleUrls: ['./signup-otp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe]
})
export class SignupOtpComponent {
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private authService: AuthService = inject(AuthService);
  private notificationService: NotificationService = inject(NotificationService);
  private uiService: UiService = inject(UiService);
  private languageService: LanguageService = inject(LanguageService);

  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  verificationSessionId = signal<string | null>(null);

  otpForm = new FormGroup({
    otpCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4,8}$')])
  });

  constructor() {
    const session = this.route.snapshot.queryParamMap.get('session');
    if (!session) {
      this.router.navigate(['/signup']);
      return;
    }
    this.verificationSessionId.set(session);
  }

  async onSubmit() {
    if (!this.otpForm.valid || this.isSubmitting()) return;

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const sessionId = this.verificationSessionId()!;
    const otpCode = this.otpForm.get('otpCode')!.value!;

    try {
      await this.authService.signupVerify(sessionId, otpCode);
      this.notificationService.showToast({
        title: this.languageService.translate('signup.accountCreated'),
        message: '',
        type: 'success'
      });
      this.uiService.openRoleSelectModal();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Verification failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
