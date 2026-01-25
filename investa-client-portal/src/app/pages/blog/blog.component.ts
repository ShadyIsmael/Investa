import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { AllPostsComponent } from '../../components/all-posts/all-posts.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    FooterComponent,
    CtaComponent,
    AllPostsComponent,
    TranslatePipe
  ]
})
export class BlogPageComponent {}
