import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectRoom, ProjectService } from '../../../services/project.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-project-room',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './project-room.component.html',
  styleUrls: ['./project-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRoomComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectService);
  private readonly languageService = inject(LanguageService);
  direction = this.languageService.direction;
  room = signal<ProjectRoom | null>(null);
  loading = signal(true);
  error = signal('');
  title = '';
  description = '';
  entryType = 1;
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      this.room.set(await this.projects.getRoom(this.route.snapshot.paramMap.get('id')!));
    } catch (e: any) {
      this.error.set(e.message ?? '');
    } finally {
      this.loading.set(false);
    }
  }
  async post() {
    if (!this.title.trim()) return;
    await this.projects.addRoomEntry(this.room()!.projectId, { entryType: this.entryType, title: this.title.trim(), description: this.description, isInvestorVisible: true });
    this.title = '';
    this.description = '';
    await this.load();
  }
  async complete(id: number) {
    await this.projects.completeMilestone(this.room()!.projectId, id);
    await this.load();
  }
}
