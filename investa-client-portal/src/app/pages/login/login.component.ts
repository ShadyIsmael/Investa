import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserRole } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RoleContextService } from '../../services/role-context.service';

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
  private languageService: LanguageService = inject(LanguageService);
  private roleContext: RoleContextService = inject(RoleContextService);

  role = signal<UserRole>('investor');
  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  isDropdownOpen = signal<boolean>(false);

  theme = computed(() => {
    const isFounder = this.role() === 'founder';
    return {
      primaryGradient: isFounder 
        ? 'from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700' 
        : 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
      textAccent: isFounder ? 'text-violet-400' : 'text-emerald-400',
      textHover: isFounder ? 'hover:text-violet-300' : 'hover:text-emerald-300',
      ringFocus: isFounder ? 'focus:ring-violet-500' : 'focus:ring-emerald-500', 
      borderFocus: isFounder ? 'focus:border-violet-500' : 'focus:border-emerald-500',
      bgGlow: isFounder ? 'bg-violet-500/10' : 'bg-emerald-500/10',
      bgGlowSecond: isFounder ? 'bg-indigo-500/10' : 'bg-teal-500/10',
      iconColor: isFounder ? 'text-violet-400' : 'text-emerald-400',
      checkboxText: isFounder ? 'text-violet-500 focus:ring-violet-600' : 'text-emerald-500 focus:ring-emerald-600'
    };
  });

  countries = [
    { code: '+20', flag: 'eg', nameKey: 'login.countries.egypt' },
    { code: '+1', flag: 'us', nameKey: 'login.countries.usa' },
    { code: '+44', flag: 'gb', nameKey: 'login.countries.uk' },
    { code: '+91', flag: 'in', nameKey: 'login.countries.india' },
    { code: '+61', flag: 'au', nameKey: 'login.countries.australia' },
    { code: '+81', flag: 'jp', nameKey: 'login.countries.japan' },
    { code: '+49', flag: 'de', nameKey: 'login.countries.germany' },
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
    // initialize role from query param snapshot (handles direct navigation)
    const initial = this.route.snapshot.queryParamMap.get('role');
    if (initial === 'investor' || initial === 'founder') {
      this.role.set(initial as UserRole);
    }

    // also react to query param changes
    this.route.queryParamMap.subscribe(params => {
      const roleParam = params.get('role');
      if (roleParam === 'investor' || roleParam === 'founder') {
        this.role.set(roleParam as UserRole);
      }
    });
  }

  isFounder = computed(() => this.role() === 'founder');

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

      const activeContext = this.roleContext.setActiveContext(role);
      this.router.navigate([activeContext === 'investor' ? '/admin/investments' : '/admin/dashboard']);
    } catch (err: any) {
      let key = 'login.errorGeneric';
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) key = 'login.invalidCredentials';
      } else if (typeof err?.message === 'string') {
        const m = err.message.toLowerCase();
        if (m.includes('invalid') || m.includes('credential') || m.includes('wrong') || m.includes('incorrect') || m.includes('not found')) {
          key = 'login.invalidCredentials';
        }
      }
      this.errorMessage.set(this.languageService.translate(key));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close() {
    try {
      this.router.navigate(['/']);
    } catch {
      // ignore navigation errors
    }
  }
}
