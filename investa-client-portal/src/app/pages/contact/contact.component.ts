import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { ContactDetailsComponent } from '../../components/contact-details/contact-details.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    FooterComponent,
    CtaComponent,
    ContactDetailsComponent,
    ContactFormComponent,
    TranslatePipe
  ]
})
export class ContactPageComponent {}
