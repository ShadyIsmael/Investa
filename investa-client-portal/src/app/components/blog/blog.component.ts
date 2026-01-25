import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { BlogService, BlogPost } from '../../services/blog.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink]
})
export class BlogComponent {
  private blogService = inject(BlogService);
  posts = this.blogService.getLatestPosts(3);
}