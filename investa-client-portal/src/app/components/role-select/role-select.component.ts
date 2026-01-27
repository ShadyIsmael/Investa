import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.component.html',
  styleUrls: ['./role-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe]
})
export class RoleSelectComponent {
  // Fix: Explicitly type injected Router to resolve a type inference issue.
  private router: Router = inject(Router);
  private uiService = inject(UiService);

  selectRole(role: 'investor' | 'founder') {
    this.uiService.closeRoleSelectModal();
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  closeModal() {
    this.uiService.closeRoleSelectModal();
  }
}
