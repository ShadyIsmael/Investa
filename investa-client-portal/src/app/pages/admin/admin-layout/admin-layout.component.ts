import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../../../components/admin-navbar/admin-navbar.component';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminNavbarComponent]
})
export class AdminLayoutComponent {}