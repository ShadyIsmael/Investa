import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { AboutComponent } from '../../components/about/about.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { BlogComponent } from '../../components/blog/blog.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    HeroComponent,
    FeaturesComponent,
    AboutComponent,
    CtaComponent,
    TestimonialsComponent,
    BlogComponent,
    FooterComponent,
    TranslatePipe
  ]
})
export class HomeComponent {}