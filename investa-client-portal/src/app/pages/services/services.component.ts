import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { ServicesListComponent } from '../../components/services/services.component';
import { ProcessComponent } from '../../components/process/process.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-services-page',
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    FooterComponent,
    CtaComponent,
    ServicesListComponent,
    ProcessComponent,
    PricingComponent,
    FaqComponent,
    TranslatePipe
  ]
})
export class ServicesPageComponent {}
