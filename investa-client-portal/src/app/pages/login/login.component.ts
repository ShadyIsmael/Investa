import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserRole } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe]
})
export class LoginComponent {
  private authService = inject(AuthService);
  // Fix: Explicitly type injected Router and ActivatedRoute to resolve type inference issues.
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  role = signal<UserRole>('investor');

  loginForm = new FormGroup({
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const roleParam = params.get('role');
      if (roleParam === 'investor' || roleParam === 'founder') {
        this.role.set(roleParam);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const role = this.role();
      this.authService.login(role);
      const redirectPath = role === 'investor' ? '/admin/investments' : '/admin/dashboard';
      this.router.navigate([redirectPath]);
    }
  }
}
