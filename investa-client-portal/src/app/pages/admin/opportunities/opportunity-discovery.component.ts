import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Opportunity, OpportunityFilters, OpportunityLookup, OpportunityService } from '../../../services/opportunity.service';
import { lookupLabel, money, opportunityDescription, opportunityTitle } from './opportunity-utils';
import { RoleContextService } from '../../../services/role-context.service';

@Component({
  standalone: true,
  selector: 'app-opportunity-discovery',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './opportunity-discovery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDiscoveryComponent {
  private service = inject(OpportunityService);
  roleContext = inject(RoleContextService);

  opportunities = signal<Opportunity[]>([]);
  categories = signal<OpportunityLookup[]>([]);
  tags = signal<OpportunityLookup[]>([]);
  fundingGoals = signal<OpportunityLookup[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedTags = signal<Array<string | number>>([]);

  filters: OpportunityFilters = {};
  investmentModels = computed(() => this.unique('investmentModel'));
  projectStages = computed(() => this.unique('projectStage'));

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      const [categories, tags, fundingGoals, opportunities] = await Promise.all([
        this.service.getCategories(),
        this.service.getTags(),
        this.service.getFundingGoals(),
        this.service.getPublicOpportunities(this.currentFilters())
      ]);
      this.categories.set(categories);
      this.tags.set(tags);
      this.fundingGoals.set(fundingGoals);
      this.opportunities.set(opportunities);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Failed to load opportunities.');
      this.opportunities.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async applyFilters(): Promise<void> {
    await this.load();
  }

  clearFilters(): void {
    this.filters = {};
    this.selectedTags.set([]);
    this.load();
  }

  toggleTag(id: string | number): void {
    this.selectedTags.update(current => current.some(item => String(item) === String(id))
      ? current.filter(item => String(item) !== String(id))
      : [...current, id]
    );
  }

  isTagSelected(id: string | number): boolean {
    return this.selectedTags().some(item => String(item) === String(id));
  }

  currentFilters(): OpportunityFilters {
    return { ...this.filters, tagIds: this.selectedTags() };
  }

  label(items: OpportunityLookup[], id: string | number | null | undefined, fallback?: string | null): string {
    return lookupLabel(items, id, fallback);
  }

  title = opportunityTitle;
  description = opportunityDescription;
  money = money;

  tagLabel(tag: string | OpportunityLookup): string {
    return typeof tag === 'string' ? tag : this.service.label(tag);
  }

  cover(opportunity: Opportunity): string {
    return opportunity.coverImageUrl || 'assets/boardroom-bg.jpg';
  }

  private unique(key: keyof Opportunity): string[] {
    return Array.from(new Set(this.opportunities().map(item => item[key]).filter(Boolean).map(String))).sort();
  }
}
