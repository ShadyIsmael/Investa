import { Injectable, signal, computed } from '@angular/core';
import * as i0 from "@angular/core";
export class BlogService {
    constructor() {
        this.allPosts = signal([
            {
                slug: 'from-idea-to-impact',
                imageUrl: 'https://picsum.photos/seed/blog10/800/400',
                categoryKey: 'blog.post10.category',
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
                categoryKey: 'blog.post1.category',
                titleKey: 'blog.post1.title',
                excerptKey: 'blog.post1.excerpt',
                author: 'John Smith',
                authorAvatar: 'https://picsum.photos/seed/author1/100/100',
                publishedDate: 'October 22, 2024'
            },
            {
                slug: '2024-tech-stack',
                imageUrl: 'https://picsum.photos/seed/blog2/800/400',
                categoryKey: 'blog.post2.category',
                titleKey: 'blog.post2.title',
                excerptKey: 'blog.post2.excerpt',
                author: 'Alex Johnson',
                authorAvatar: 'https://picsum.photos/seed/author2/100/100',
                publishedDate: 'October 19, 2024'
            },
            {
                slug: 'risk-management-strategies',
                imageUrl: 'https://picsum.photos/seed/blog3/800/400',
                categoryKey: 'blog.post3.category',
                titleKey: 'blog.post3.title',
                excerptKey: 'blog.post3.excerpt',
                author: 'Emily White',
                authorAvatar: 'https://picsum.photos/seed/author3/100/100',
                publishedDate: 'October 15, 2024'
            },
            {
                slug: 'psychology-of-investing',
                imageUrl: 'https://picsum.photos/seed/blog4/800/400',
                categoryKey: 'blog.post4.category',
                titleKey: 'blog.post4.title',
                excerptKey: 'blog.post4.excerpt',
                author: 'Chris Green',
                authorAvatar: 'https://picsum.photos/seed/author4/100/100',
                publishedDate: 'October 11, 2024'
            },
            {
                slug: 'guide-to-crypto-staking',
                imageUrl: 'https://picsum.photos/seed/blog5/800/400',
                categoryKey: 'blog.post5.category',
                titleKey: 'blog.post5.title',
                excerptKey: 'blog.post5.excerpt',
                author: 'Sarah J.',
                authorAvatar: 'https://picsum.photos/seed/person1/100/100',
                publishedDate: 'October 8, 2024'
            },
            {
                slug: 'diversification-is-key',
                imageUrl: 'https://picsum.photos/seed/blog6/800/400',
                categoryKey: 'blog.post6.category',
                titleKey: 'blog.post6.title',
                excerptKey: 'blog.post6.excerpt',
                author: 'Michael B.',
                authorAvatar: 'https://picsum.photos/seed/person2/100/100',
                publishedDate: 'October 5, 2024'
            },
            {
                slug: 'ai-in-real-estate',
                imageUrl: 'https://picsum.photos/seed/blog7/800/400',
                categoryKey: 'blog.post7.category',
                titleKey: 'blog.post7.title',
                excerptKey: 'blog.post7.excerpt',
                author: 'Jessica L.',
                authorAvatar: 'https://picsum.photos/seed/person3/100/100',
                publishedDate: 'October 1, 2024'
            },
            {
                slug: 'etfs-vs-mutual-funds',
                imageUrl: 'https://picsum.photos/seed/blog8/800/400',
                categoryKey: 'blog.post8.category',
                titleKey: 'blog.post8.title',
                excerptKey: 'blog.post8.excerpt',
                author: 'David Brown',
                authorAvatar: 'https://picsum.photos/seed/author8/100/100',
                publishedDate: 'September 28, 2024'
            },
            {
                slug: 'the-rise-of-esg-investing',
                imageUrl: 'https://picsum.photos/seed/blog9/800/400',
                categoryKey: 'blog.post9.category',
                titleKey: 'blog.post9.title',
                excerptKey: 'blog.post9.excerpt',
                author: 'Laura Wilson',
                authorAvatar: 'https://picsum.photos/seed/author9/100/100',
                publishedDate: 'September 25, 2024'
            }
        ], ...(ngDevMode ? [{ debugName: "allPosts" }] : []));
    }
    getAllPosts() {
        return computed(() => this.allPosts());
    }
    getLatestPosts(count) {
        return computed(() => this.allPosts().slice(0, count));
    }
    getPostBySlug(slug) {
        return computed(() => this.allPosts().find(p => p.slug === slug));
    }
    getRelatedPosts(currentSlug, count) {
        return computed(() => this.allPosts()
            .filter(p => p.slug !== currentSlug)
            .slice(0, count));
    }
    static { this.ɵfac = function BlogService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BlogService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: BlogService, factory: BlogService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BlogService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();
