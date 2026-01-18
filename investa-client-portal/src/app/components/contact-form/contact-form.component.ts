import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ContactFormComponent {
  contactForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Contact form submitted:', this.contactForm.value);
      this.contactForm.reset();
      // Here you would typically send the data to a server
    }
  }
}
