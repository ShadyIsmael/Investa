import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';

interface FooterLink {
  key: string;
  href?: string;
  routerLink?: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink]
})
export class FooterComponent {
  year = new Date().getFullYear();

  linkGroups = signal<FooterLinkGroup[]>([
    {
      title: 'footer.solutions.title',
      links: [
        { key: 'footer.solutions.ai', routerLink: '/services' },
        { key: 'footer.solutions.analytics', routerLink: '/services' },
        { key: 'footer.solutions.portfolio', routerLink: '/services' },
        { key: 'footer.solutions.api', routerLink: '/services' }
      ]
    },
    {
      title: 'footer.support.title',
      links: [
        { key: 'footer.support.pricing', routerLink: '/services' },
        { key: 'footer.support.docs', href: '#' },
        { key: 'footer.support.guides', href: '#' },
        { key: 'footer.support.center', routerLink: '/contact' }
      ]
    },
    {
      title: 'footer.company.title',
      links: [
        { key: 'footer.company.about', routerLink: '/about' },
        { key: 'footer.company.blog', routerLink: '/blog' },
        { key: 'footer.company.careers', href: '#' },
        { key: 'footer.company.press', href: '#' }
      ]
    },
    {
      title: 'footer.legal.title',
      links: [
        { key: 'footer.legal.claim', href: '#' },
        { key: 'footer.legal.privacy', href: '#' },
        { key: 'footer.legal.terms', href: '#' },
        { key: 'footer.legal.risk', href: '#' }
      ]
    }
  ]);
}