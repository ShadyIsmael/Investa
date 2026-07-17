import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { HeroService } from '../../services/hero.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeaderComponent]
})
export class HeroComponent implements OnInit {
  private heroService = inject(HeroService);
  protected languageService = inject(LanguageService);

  hero = this.heroService.hero;
  loading = this.heroService.loading;

  title = computed(() => this.heroService.title);
  subtitle = computed(() => this.heroService.subtitle);
  primaryCtaLabel = computed(() => this.heroService.primaryCtaLabel);
  primaryCtaUrl = computed(() => this.heroService.primaryCtaUrl);
  secondaryCtaLabel = computed(() => this.heroService.secondaryCtaLabel);
  secondaryCtaUrl = computed(() => this.heroService.secondaryCtaUrl);

  highlightedTitle = computed(() => {
    const t = this.title();
    let result = t
      .replace(/\bAI\b/g, '<span class="hero-word-accent">AI</span>')
      .replace(/الذكاء الاصطناعي/g, '<span class="hero-word-accent">الذكاء الاصطناعي</span>');
    return result;
  });

  ngOnInit() {
    this.heroService.load();
  }
}
