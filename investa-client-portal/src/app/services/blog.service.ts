import { Injectable, signal, computed } from '@angular/core';

export interface BlogPostContent {
  type: 'p' | 'h2' | 'ul';
  text?: string;
  items?: string[];
}

export interface BlogPost {
  slug: string;
  imageUrl: string;
  category: string;
  titleKey: string;
  excerptKey: string;
  contentKey?: string;
  author: string;
  authorAvatar: string;
  publishedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private allPosts = signal<BlogPost[]>([
    {
      slug: 'from-idea-to-impact',
      imageUrl: 'https://picsum.photos/seed/blog10/800/400',
      category: 'Business Strategy',
      titleKey: 'blog.post10.title',
      excerptKey: 'blog.post10.excerpt',
      contentKey: 'blog.post10.content',
      author: 'Jane Doe',
      authorAvatar: 'https://picsum.photos/seed/author10/100/100',
      publishedDate: 'October 26, 2024'
    },
    {
      slug: 'ai-on-forex-trading',
      imageUrl: 'https://picsum.photos/seed/blog1/800/400',
      category: 'Market Analysis',
      titleKey: 'blog.post1.title',
      excerptKey: 'blog.post1.excerpt',
      author: 'John Smith',
      authorAvatar: 'https://picsum.photos/seed/author1/100/100',
      publishedDate: 'October 22, 2024'
    },
    {
      slug: '2024-tech-stack',
      imageUrl: 'https://picsum.photos/seed/blog2/800/400',
      category: 'Technology',
      titleKey: 'blog.post2.title',
      excerptKey: 'blog.post2.excerpt',
      author: 'Alex Johnson',
      authorAvatar: 'https://picsum.photos/seed/author2/100/100',
      publishedDate: 'October 19, 2024'
    },
    {
      slug: 'risk-management-strategies',
      imageUrl: 'https://picsum.photos/seed/blog3/800/400',
      category: 'Investing 101',
      titleKey: 'blog.post3.title',
      excerptKey: 'blog.post3.excerpt',
      author: 'Emily White',
      authorAvatar: 'https://picsum.photos/seed/author3/100/100',
      publishedDate: 'October 15, 2024'
    },
    {
      slug: 'psychology-of-investing',
      imageUrl: 'https://picsum.photos/seed/blog4/800/400',
      category: 'Strategy',
      titleKey: 'blog.post4.title',
      excerptKey: 'blog.post4.excerpt',
      author: 'Chris Green',
      authorAvatar: 'https://picsum.photos/seed/author4/100/100',
      publishedDate: 'October 11, 2024'
    },
    {
      slug: 'guide-to-crypto-staking',
      imageUrl: 'https://picsum.photos/seed/blog5/800/400',
      category: 'Crypto',
      titleKey: 'blog.post5.title',
      excerptKey: 'blog.post5.excerpt',
      author: 'Sarah J.',
      authorAvatar: 'https://picsum.photos/seed/person1/100/100',
      publishedDate: 'October 8, 2024'
    },
    {
      slug: 'diversification-is-key',
      imageUrl: 'https://picsum.photos/seed/blog6/800/400',
      category: 'Portfolio Management',
      titleKey: 'blog.post6.title',
      excerptKey: 'blog.post6.excerpt',
      author: 'Michael B.',
      authorAvatar: 'https://picsum.photos/seed/person2/100/100',
      publishedDate: 'October 5, 2024'
    },
     {
      slug: 'ai-in-real-estate',
      imageUrl: 'https://picsum.photos/seed/blog7/800/400',
      category: 'Real Estate',
      titleKey: 'blog.post7.title',
      excerptKey: 'blog.post7.excerpt',
      author: 'Jessica L.',
      authorAvatar: 'https://picsum.photos/seed/person3/100/100',
      publishedDate: 'October 1, 2024'
    },
    {
      slug: 'etfs-vs-mutual-funds',
      imageUrl: 'https://picsum.photos/seed/blog8/800/400',
      category: 'Funds',
      titleKey: 'blog.post8.title',
      excerptKey: 'blog.post8.excerpt',
      author: 'David Brown',
      authorAvatar: 'https://picsum.photos/seed/author8/100/100',
      publishedDate: 'September 28, 2024'
    },
    {
      slug: 'the-rise-of-esg-investing',
      imageUrl: 'https://picsum.photos/seed/blog9/800/400',
      category: 'Trends',
      titleKey: 'blog.post9.title',
      excerptKey: 'blog.post9.excerpt',
      author: 'Laura Wilson',
      authorAvatar: 'https://picsum.photos/seed/author9/100/100',
      publishedDate: 'September 25, 2024'
    }
  ]);

  getAllPosts() {
    return computed(() => this.allPosts());
  }

  getLatestPosts(count: number) {
    return computed(() => this.allPosts().slice(0, count));
  }

  getPostBySlug(slug: string) {
    return computed(() => this.allPosts().find(p => p.slug === slug));
  }

  getRelatedPosts(currentSlug: string, count: number) {
    return computed(() => 
      this.allPosts()
        .filter(p => p.slug !== currentSlug)
        .slice(0, count)
    );
  }
}