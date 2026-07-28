import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ErrorResult } from '../../services/error-mapping.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  standalone: true,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe]
})
export class SignupComponent {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  signupForm = new FormGroup({
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator });

  async onSubmit() {
    if (!this.signupForm.valid || this.isSubmitting()) return;

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const mobile = this.signupForm.get('mobile')!.value!;
    const firstName = this.signupForm.get('firstName')!.value!;
    const lastName = this.signupForm.get('lastName')!.value!;
    const password = this.signupForm.get('password')!.value!;

    try {
      const result = await this.authService.signupInit(mobile, password, firstName, lastName);
      this.router.navigate(['/signup-otp'], { queryParams: { session: result.verificationSessionId } });
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Signup failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close() {
    this.router.navigate(['/']);
  }
}
