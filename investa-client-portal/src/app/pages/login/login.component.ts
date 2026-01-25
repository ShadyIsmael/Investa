import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserRole } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe]
})
export class LoginComponent {
  private authService = inject(AuthService);
  // Fix: Explicitly type injected Router and ActivatedRoute to resolve type inference issues.
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private profileService: ProfileService = inject(ProfileService);

  role = signal<UserRole>('investor');
  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  isDropdownOpen = signal<boolean>(false);

  countries = [
    { code: '+20', flag: 'eg', name: 'Egypt' },
    { code: '+1', flag: 'us', name: 'USA' },
    { code: '+44', flag: 'gb', name: 'UK' },
    { code: '+91', flag: 'in', name: 'India' },
    { code: '+61', flag: 'au', name: 'Australia' },
    { code: '+81', flag: 'jp', name: 'Japan' },
    { code: '+49', flag: 'de', name: 'Germany' },
  ];

  // Default to Egypt
  loginForm = new FormGroup({
    countryCode: new FormControl(this.countries[0].code, [Validators.required]),
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6,15}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  selectedCountry = computed(() => {
    const countryCode = this.loginForm.get('countryCode')!.value;
    return this.countries.find(c => c.code === countryCode);
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const roleParam = params.get('role');
      if (roleParam === 'investor' || roleParam === 'founder') {
        this.role.set(roleParam);
      }
    });
  }

  selectCountry(country: any) {
    this.loginForm.get('countryCode')!.setValue(country.code);
    this.isDropdownOpen.set(false);
  }


  async onSubmit() {
    if (!this.loginForm.valid || this.isSubmitting()) return;

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const countryCode = this.loginForm.get('countryCode')!.value;
    const mobile = this.loginForm.get('mobile')!.value;
    const password = this.loginForm.get('password')!.value;
    const role = this.role();
    const fullMobile = `${countryCode}${mobile}`;

    try {
      await this.authService.login(fullMobile, password, role);

      // Load profile from backend after successful login
      try {
        await this.profileService.loadMyProfile();
      } catch (profileErr) {
        // Non-fatal: continue navigation even if profile load fails
      }

      const redirectPath = role === 'investor' ? '/admin/investments' : '/admin/dashboard';
      this.router.navigate([redirectPath]);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Login failed');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
