import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { BlogService, BlogPost } from '../../services/blog.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink]
})
export class AllPostsComponent {
  private blogService = inject(BlogService);
  posts = this.blogService.getAllPosts();
}
