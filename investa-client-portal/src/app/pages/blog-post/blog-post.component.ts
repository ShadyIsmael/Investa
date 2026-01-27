import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { BlogService, BlogPost, BlogPostContent } from '../../services/blog.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { get } from 'lodash-es';

@Component({
  selector: 'app-blog-post-page',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    CtaComponent,
    TranslatePipe,
    RouterLink
  ]
})
export class BlogPostPageComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private languageService = inject(LanguageService);
  
  post = signal<BlogPost | undefined>(undefined);
  relatedPosts = signal<BlogPost[]>([]);
  
  postContent = computed(() => {
    const p = this.post();
    if (!p || !p.contentKey) {
      return [];
    }
    const dictionary = this.languageService.dictionary();
    const content = get(dictionary, p.contentKey, []) as any[];
    return content.map(item => {
      if (item.type === 'ul' && Array.isArray(item.items)) {
        return { ...item, items: item.items.map((key: string) => get(dictionary, key, key)) };
      }
      return item;
    });
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        // We must get the value from the computed signal inside the subscription
        const foundPost = this.blogService.getPostBySlug(slug)();
        this.post.set(foundPost);

        const related = this.blogService.getRelatedPosts(slug, 3)();
        this.relatedPosts.set(related);
        
        // Scroll to top on post change
        window.scrollTo(0, 0);
      }
    });
  }
}
