import { Injectable, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly language = inject(LanguageService);
  private currentTitleKey = 'pageTitles.app';

  constructor() {
    super();
    effect(() => {
      this.language.language();
      this.title.setTitle(this.language.translate(this.currentTitleKey));
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentTitleKey = this.buildTitle(snapshot) || 'pageTitles.app';
    this.title.setTitle(this.language.translate(this.currentTitleKey));
  }
}
