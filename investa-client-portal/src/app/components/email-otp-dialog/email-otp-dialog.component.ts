import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: true,
  selector: 'app-email-otp-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './email-otp-dialog.component.html',
  styleUrl: './email-otp-dialog.component.scss'
})
export class EmailOtpDialogComponent implements OnDestroy {
  @ViewChild('otpInput') otpInput?: ElementRef<HTMLInputElement>;
  otp = '';
  submitting = signal(false);
  error = signal('');
  seconds = signal(60);
  private timer = window.setInterval(() => this.seconds.update(value => Math.max(0, value - 1)), 1000);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private dialogRef: MatDialogRef<EmailOtpDialogComponent>,
    private profile: ProfileService,
    private language: LanguageService
  ) {}

  get maskedEmail(): string {
    const [name, domain] = this.data.email.split('@');
    return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
  }

  get ar(): boolean { return this.language.direction() === 'rtl'; }

  onInput(value: string): void {
    this.otp = value.replace(/\D/g, '').slice(0, 6);
    this.error.set('');
    if (this.otp.length === 6) void this.verify();
  }

  async verify(): Promise<void> {
    if (this.otp.length !== 6 || this.submitting()) return;
    this.submitting.set(true);
    try {
      await this.profile.verifyEmailOtp(this.data.email, this.otp);
      this.dialogRef.close(true);
    } catch (error: unknown) {
      this.error.set(this.messageFor(error));
      queueMicrotask(() => this.otpInput?.nativeElement.focus());
    } finally {
      this.submitting.set(false);
    }
  }

  async resend(): Promise<void> {
    if (this.seconds() > 0 || this.submitting()) return;
    this.submitting.set(true);
    try {
      await this.profile.resendEmailOtp(this.data.email);
      this.otp = '';
      this.error.set('');
      this.seconds.set(60);
    } catch (error: unknown) {
      this.error.set(this.messageFor(error));
    } finally {
      this.submitting.set(false);
    }
  }

  private messageFor(error: unknown): string {
    const record = error as { error?: { message?: string; data?: { retryAfterSeconds?: number } }; message?: string };
    const code = record?.error?.message || record?.message || '';
    if (code.includes('EXPIRED')) return this.ar ? 'انتهت صلاحية رمز التأكيد. اطلب رمزًا جديدًا.' : 'The verification code has expired. Request a new code.';
    if (code.includes('TOO_MANY')) return this.ar ? 'تم تجاوز عدد المحاولات المسموح بها. اطلب رمزًا جديدًا.' : 'Too many incorrect attempts. Request a new code.';
    if (code.includes('COOLDOWN')) {
      const retry = record?.error?.data?.retryAfterSeconds ?? 60;
      this.seconds.set(retry);
      return this.ar ? `يمكنك إعادة الإرسال خلال ${retry} ثانية` : `Resend available in ${retry}s`;
    }
    return this.ar ? 'رمز التأكيد غير صحيح.' : 'The verification code is incorrect.';
  }

  ngOnDestroy(): void { window.clearInterval(this.timer); }
}
