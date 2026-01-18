import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe]
})
export class ContactDetailsComponent {}
