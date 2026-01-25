import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AboutComponent } from '../../components/about/about.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    FooterComponent,
    AboutComponent,
    CtaComponent,
    TestimonialsComponent,
    TranslatePipe
  ]
})
export class AboutPageComponent {}
