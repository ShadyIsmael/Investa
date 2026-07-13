import { Component, ChangeDetectionStrategy, inject, ElementRef, viewChild, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { AuthService } from '../../../services/auth.service';
import { RequestsService } from '../../../services/requests.service';
import { ProfileService } from '../../../services/profile.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { FileStoreService } from '../../../services/file-store.service';
import { RoleContextService } from '../../../services/role-context.service';
import { Opportunity, OpportunityService } from '../../../services/opportunity.service';
import { WalletService } from '../../../services/wallet.service';
import { OpportunityRequest, OpportunityRequestKind } from '../../../models/request.model';
import { TIME_INTERVALS } from '../../../config/constants';
import { get } from 'lodash-es';

declare var d3: any;

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

interface BarChartData {
  label: string;
  value: number;
}

interface Activity {
  type: 'investment' | 'watchlist' | 'milestone';
  text: string;
  time: string;
  imageUrl?: string;
}

interface RecentActivity {
  id: number;
  type: 'request' | 'message' | 'opportunity' | 'investment' | 'score';
  title: string;
  description: string;
  time: string;
  link?: (string | number)[];
}

interface SummaryStat {
  key: string;
  labelKey: string;
  value: string | number;
  route: (string | number)[];
}

interface CompositionItem {
  key: string;
  labelKey: string;
  value: number;
}


interface LineChartData {
  month: string;
  value: number;
}

interface D3PieArcDatum {
  data: ChartData;
}

interface ParticipantOverview {
  id: string;
  name: string;
  status: string;
  requestedAmount: number;
  updatedAt: Date;
  openConversation: boolean;
  conversationId?: string | number | null;
  hasReport?: boolean;
}

interface SentRequest {
  id: number | string;
  projectName: string;
  projectImageUrl: string;
  author: string;
  status: 'Pending' | 'Negotiating' | 'Partner' | 'Rejected';
  date: Date;
}

interface ProjectRoomActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  link?: (string | number)[];
}

type DashboardProject = Opportunity & Record<string, any>;

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe, RouterLink]
})
export class DashboardComponent {
  private opportunityService = inject(OpportunityService);
  private walletService = inject(WalletService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private requestsService = inject(RequestsService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private fileStoreService = inject(FileStoreService);
  roleContext = inject(RoleContextService);
  private router = inject(Router);
  private creditsRefreshed = signal(false);
  private routedFounderProjectId = signal<number | null>(null);

  t(path: string, fallback: string): string {
    return get(this.languageService.dictionary(), path, fallback);
  }
  
  pieChart = viewChild<ElementRef>('pieChart');
  lineChart = viewChild<ElementRef>('lineChart');
  barChart = viewChild<ElementRef>('barChart');
  
  userRole = this.authService.userRole;
  allInvestments = signal<DashboardProject[]>([]);
  direction = computed(() => this.languageService.direction());
  isInvestorDashboardContext = computed(() => this.roleContext.isActiveInvestorContext());
  isFounderDashboardContext = computed(() => this.roleContext.isActiveFounderContext());

  // --- Premium status (temporary - connect to subscription service when available) ---
  // TODO: Replace with actual subscription check from subscription service
  isPremium = computed(() => false);

  // --- Investor-specific computed signals ---
  investorParticipationRequests = computed(() => this.requestsService.outgoing().filter(request => request.requestType === OpportunityRequestKind.Participation || request.type === 'participation'));
  approvedParticipations = computed(() => this.investorParticipationRequests().filter(request => this.isApprovedParticipation(request)));
  pendingParticipations = computed(() => this.investorParticipationRequests().filter(request => request.status === 'Pending' || request.status === 'Requested' || request.status === 'Negotiating'));
  myInvestments = computed(() => this.approvedParticipations());
  portfolioValue = computed(() => this.totalInvested());
  favoriteInvestments = computed(() => this.allInvestments().filter(inv => inv.favorited));
  favoritePreviewInvestments = computed(() => this.favoriteInvestments().slice(0, 5));
  investmentUpdates = computed(() => this.approvedParticipations().slice(0, 3));
  incomingRequestsCount = computed(() => this.requestsService.incoming().length);
  unreadMessageCount = computed(() => this.notificationService.unreadCount());
  newOpportunitiesCount = computed(() => {
    const allInvestments = this.allInvestments();
    const viewedInvestmentIds = new Set(this.myInvestments().map(inv => inv.opportunityId).filter(Boolean).map(id => String(id)));
    const newInvestments = allInvestments.filter(inv => !viewedInvestmentIds.has(String(inv.id)));
    return newInvestments.length;
  });
  profileCompletion = computed(() => {
    const profile = this.profileService.profile();
    if (!profile) return 0;
    // Use the KYC completion percentage computed by ProfileService
    return profile.basicInfo?.kycCompletionPercentage ?? 0;
  });
  featuredInvestments = computed(() => this.allInvestments().sort((a, b) => b.credibilityScore - a.credibilityScore).slice(0, 3));
  investorScore = computed<number | null>(() => {
    const profile = this.profileService.profile();
    if (!profile?.coreMetrics) return null;
    if (profile.coreMetrics.credibilityScore !== undefined && profile.coreMetrics.credibilityScore !== null) {
      return profile.coreMetrics.credibilityScore;
    }
    if (profile.coreMetrics.currentCredibilityScore !== undefined && profile.coreMetrics.currentCredibilityScore !== null) {
      return profile.coreMetrics.currentCredibilityScore;
    }
    return null;
  });
  investorLevel = computed(() => {
    const score = this.investorScore();
    if (score === null) return this.t('dashboard.reputation.levels.unavailable', 'Unavailable');
    if (score >= 80) return this.t('dashboard.reputation.levels.excellent', 'Excellent');
    if (score >= 60) return this.t('dashboard.reputation.levels.strong', 'Strong');
    if (score >= 40) return this.t('dashboard.reputation.levels.building', 'Building');
    return this.t('dashboard.reputation.levels.starter', 'Starter');
  });
  currentCredits = computed(() => this.userService.credits()); // Live user credit balance
  availableCredits = this.userService.credits;
  totalInvested = computed(() => this.approvedParticipations().reduce((sum, request) => sum + this.getRequestAmount(request), 0));
  expectedEarnings = computed(() => this.approvedParticipations().reduce((sum, request) => sum + this.getExpectedEarnings(request), 0));
  returnRate = computed(() => {
    const invested = this.totalInvested();
    return invested > 0 ? (this.expectedEarnings() / invested) * 100 : 0;
  });
  activeNegotiations = computed(() => this.investorParticipationRequests().filter(request => request.status === 'Negotiating'));
  actionNeeded = computed(() => this.requestsService.incoming().filter(request => request.canAccept || request.canReject));
  latestProjectUpdates = computed(() => this.approvedParticipations().slice(0, 4));
  portfolioComposition = computed<CompositionItem[]>(() => {
    const totals = { equity: 0, loan: 0, profitSharing: 0 };
    for (const request of this.approvedParticipations()) {
      totals[this.getInvestmentModelKey(request)] += this.getRequestAmount(request);
    }
    return [
      { key: 'equity', labelKey: 'dashboard.summary.composition.equity', value: totals.equity },
      { key: 'loan', labelKey: 'dashboard.summary.composition.loan', value: totals.loan },
      { key: 'profitSharing', labelKey: 'dashboard.summary.composition.profitSharing', value: totals.profitSharing },
    ];
  });
  investmentSummaryStats = computed<SummaryStat[]>(() => [
    { key: 'activeInvestments', labelKey: 'dashboard.summary.activeInvestments', value: this.approvedParticipations().length, route: ['/admin/investments'] },
    { key: 'approvedParticipations', labelKey: 'dashboard.summary.approvedParticipations', value: this.approvedParticipations().length, route: ['/admin/requests'] },
    { key: 'pendingParticipations', labelKey: 'dashboard.summary.pendingParticipations', value: this.pendingParticipations().length, route: ['/admin/requests'] },
    { key: 'totalInvested', labelKey: 'dashboard.summary.totalInvested', value: this.formatCreditAmount(this.totalInvested()), route: ['/admin/requests'] },
  ]);

  recentActivityFeed = computed<RecentActivity[]>(() => {
    const activities: RecentActivity[] = [];
    let id = 0;

    // Add request activities
    const requests = this.sentRequests();
    requests.slice(0, 3).forEach(req => {
      activities.push({
        id: id++,
        type: 'request',
        title: req.status === 'Partner' ? 'Founder accepted your request' : req.status === 'Rejected' ? 'Founder rejected your request' : 'Request status updated',
        description: `${req.projectName} - ${req.author}`,
        time: this.getTimeAgo(req.date),
        link: ['/admin/investments']
      });
    });

    // Add message activities
    const unreadCount = this.unreadMessageCount();
    if (unreadCount > 0) {
      activities.push({
        id: id++,
        type: 'message',
        title: `${unreadCount} new message${unreadCount > 1 ? 's' : ''} received`,
        description: 'Check your messages for updates from founders',
        time: 'Recently',
        link: ['/admin/chat']
      });
    }

    // Add investment activities
    const investments = this.myInvestments();
    investments.slice(0, 2).forEach(inv => {
      activities.push({
        id: id++,
        type: 'investment',
        title: this.t('dashboard.activity.participationCompleted', 'Participation completed'),
        description: this.t('dashboard.activity.investedIn', 'Invested {amount} in {projectName}')
          .replace('{amount}', this.formatCreditAmount(this.getRequestAmount(inv)))
          .replace('{projectName}', inv.projectName || this.t('dashboard.opportunityFallback', 'Opportunity')),
        time: inv.createdAt ? this.getTimeAgo(new Date(inv.createdAt)) : this.t('common.recently', 'Recently'),
        link: inv.opportunityId ? ['/admin/investments', inv.opportunityId] : ['/admin/investments']
      });
    });

    // Do not fabricate reputation activity. Only show real platform events.

    // Add new opportunities activity
    const newOpps = this.newOpportunitiesCount();
    if (newOpps > 0) {
      activities.push({
        id: id++,
        type: 'opportunity',
        title: `${newOpps} new opportunity${newOpps > 1 ? 's' : ''} added`,
        description: 'New investment opportunities matching your interests',
        time: 'Recently',
        link: ['/admin/investments']
      });
    }

    // Sort by time (most recent first) and limit to 10
    return activities.slice(0, 10);
  });

  recommendedOpportunities = computed(() => {
    const allInvestments = this.allInvestments();
    const viewedInvestmentIds = new Set(this.myInvestments().map(inv => inv.opportunityId).filter(Boolean).map(id => String(id)));
    const newInvestments = allInvestments.filter(inv => !viewedInvestmentIds.has(String(inv.id)));
    return newInvestments
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, 4);
  });
  
  // --- Founder-specific computed signals & data ---
  founderProjects = computed(() => {
    const uid = this.profileService.profile()?.userId;
    if (!uid) return [] as DashboardProject[];
    return this.allInvestments().filter(inv => inv.founderId === uid);
  });
  founderProjectCount = computed(() => this.founderProjects().length);
  selectedFounderProject = signal<DashboardProject | null>(null);
  publishingOpportunityId = signal<string | number | null>(null);
  selectedFounderProjectRequests = computed(() => {
    const project = this.selectedFounderProject();
    if (!project) return [] as OpportunityRequest[];
    const projectId = String(project.id);

    return [
      ...this.requestsService.incoming(),
      ...this.requestsService.outgoing()
    ].filter(request => String(request.opportunityId) === projectId);
  });

  selectedFounderParticipationRequests = computed(() =>
    this.selectedFounderProjectRequests().filter(request =>
      request.requestType === OpportunityRequestKind.Participation || request.type === 'participation'
    )
  );

  selectedFounderConversationRequests = computed(() =>
    this.selectedFounderProjectRequests().filter(request =>
      request.requestType === OpportunityRequestKind.Conversation || request.type === 'conversation'
    )
  );

  founderProjectActionNeeded = computed(() =>
    this.selectedFounderProjectRequests().filter(request =>
      request.direction === 'incoming' &&
      (request.canAccept || request.canReject || request.status === 'Pending' || request.status === 'Negotiating')
    )
  );

  founderProjectNegotiations = computed(() =>
    this.selectedFounderParticipationRequests().filter(request => request.status === 'Negotiating')
  );

  founderProjectRequestsCount = computed(() => this.selectedFounderProjectRequests().length);

  founderProjectParticipationSummary = computed(() => {
    const requests = this.selectedFounderParticipationRequests();
    const summary = {
      total: requests.length,
      approved: 0,
      pending: 0,
      negotiating: 0,
      rejected: 0,
      requestedAmount: 0
    };

    for (const request of requests) {
      const status = request.status || '';
      if (status === 'Accepted' || status === 'Partner') {
        summary.approved += 1;
      } else if (status === 'Negotiating') {
        summary.negotiating += 1;
      } else if (status === 'Rejected' || status === 'Declined' || status === 'Cancelled') {
        summary.rejected += 1;
      } else {
        summary.pending += 1;
      }
      summary.requestedAmount += this.getRequestAmount(request);
    }

    return summary;
  });

  founderProjectParticipants = computed<ParticipantOverview[]>(() => {
    const participationRequests = this.selectedFounderParticipationRequests();
    const conversationRequests = this.selectedFounderConversationRequests();
    const map = new Map<string, ParticipantOverview>();

    const addParticipant = (request: OpportunityRequest, statusOverride?: string) => {
      const key = String(request.investorId ?? request.counterpartName ?? request.senderName ?? request.receiverName ?? request.id);
      const name = request.counterpartName || request.senderName || request.receiverName || this.t('dashboard.opportunityFallback', 'Opportunity');
      const status = statusOverride || request.status || 'Pending';
      const amount = this.getRequestAmount(request);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          id: key,
          name,
          status,
          requestedAmount: amount,
          updatedAt: request.createdAt ?? new Date(),
          openConversation: false,
          conversationId: undefined,
          hasReport: false
        });
        return;
      }

      if (this.getRequestPriority(status) > this.getRequestPriority(existing.status)) {
        existing.status = status;
      }
      existing.requestedAmount += amount;
      if (request.createdAt && request.createdAt > existing.updatedAt) {
        existing.updatedAt = request.createdAt;
      }
    };

    participationRequests.forEach(request => addParticipant(request));
    conversationRequests.forEach(request => {
      const key = String(request.investorId ?? request.counterpartName ?? request.senderName ?? request.receiverName ?? request.id);
      const participant = map.get(key);
      if (!participant) {
        addParticipant(request, request.status || 'Pending');
      }
      if (request.acceptedConversationId) {
        const existing = map.get(key);
        if (existing) {
          existing.openConversation = true;
          existing.conversationId = request.acceptedConversationId;
        }
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  });

  founderProjectParticipantCount = computed(() => {
    const ids = new Set<string>();
    this.selectedFounderProjectRequests().forEach(request => {
      const key = String(request.investorId ?? request.counterpartName ?? request.senderName ?? request.receiverName ?? request.id);
      if (key) ids.add(key);
    });
    return ids.size;
  });

  founderProjectPublicPerformance = computed(() => {
    const project = this.selectedFounderProject();
    return {
      totalRequests: this.selectedFounderProjectRequests().length,
      participationRequests: this.selectedFounderParticipationRequests().length,
      conversationRequests: this.selectedFounderConversationRequests().length,
      investorCount: project?.investors?.length ?? 0,
      fundingPercent: Number(project?.fundingProgressPercent ?? project?.fundingProgress ?? this.fundingProgress())
    };
  });

  projectViews = computed(() => Number(this.selectedFounderProject()?.views ?? this.selectedFounderProject()?.mediaCount ?? 0));

  engagementScore = computed(() => Number(this.selectedFounderProject()?.score ?? 0));

  founderProjectRoomActivity = computed<ProjectRoomActivityItem[]>(() => {
    const requests = this.selectedFounderProjectRequests()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return requests.map(request => ({
      id: String(request.id),
      title: request.projectName || this.t('dashboard.opportunityFallback', 'Opportunity'),
      description: `${this.getStatusLabel(request.status)} · ${request.type === 'conversation' ? 'Chat' : 'Participation'}`,
      time: this.getTimeAgo(request.createdAt),
      link: request.acceptedConversationId ? ['/admin/chat'] : undefined
    }));
  });

  selectedYear = signal<number>(new Date().getFullYear());
  availableYears = computed(() => {
    const years = new Set<number>();
    this.myInvestments().forEach(inv => {
      const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
      if (createdAt && !isNaN(createdAt.getTime())) {
        years.add(createdAt.getFullYear());
      }
    });
    const sorted = Array.from(years).sort((a, b) => b - a);
    return sorted.length ? sorted : [new Date().getFullYear()];
  });

  fundingProgress = computed(() => {
    const p = this.selectedFounderProject();
    if (!p) return null;
    return this.toNullableNumber((p as Record<string, any>)['fundingProgressPercentage'] ?? p.fundingProgressPercent);
  });
  
  // Mock data for founder dashboard
  sentRequests = signal<SentRequest[]>([]);

  requestToWithdraw = signal<SentRequest | null>(null);

  constructor() {
    void this.loadProjects();
    void this.requestsService.refreshRequests();

    effect(() => {
      const projects = this.founderProjects();
      if (this.roleContext.isActiveFounderContext() && projects.length === 1 && !this.selectedFounderProject()) {
        this.selectedFounderProject.set(projects[0]);
      }
    });

    effect(() => {
      const credits = this.currentCredits();
      if (credits < 0 && !this.creditsRefreshed()) {
        this.creditsRefreshed.set(true);
        void this.userService.refreshUser().catch(() => {});
      }
    });

    effect(() => {
      // This effect runs when view children are ready, role or language changes
      setTimeout(() => { // Allow view to render before drawing charts
        if (this.roleContext.isActiveInvestorContext()) {
          if (this.pieChart() && this.lineChart()) {
            this.createPieChart();
            this.createLineChart();
          }
        } else if (this.roleContext.isActiveFounderContext()) {
           if (this.barChart() && this.selectedFounderProject()) {
            this.createBarChart();
          }
        }
      }, 0);
    });

    effect(() => {
      const years = this.availableYears();
      if (years.length && !years.includes(this.selectedYear())) {
        this.selectedYear.set(years[0]);
      }
    });

    effect(() => {
      if (this.roleContext.isActiveInvestorContext() && this.lineChart()) {
        this.createLineChart();
      }
    });

    // Ensure the dashboard reads the latest user credit balance from the database.
    void this.userService.refreshUser().catch(() => {});
  }

  private async loadProjects(): Promise<void> {
    try {
      const [publicProjects, myProjects] = await Promise.all([
        this.opportunityService.getPublicOpportunities(),
        this.opportunityService.getMyOpportunities().catch(() => [])
      ]);

      const mapById = new Map<string, DashboardProject>();
      for (const item of [...publicProjects, ...myProjects]) {
        const id = String(item.id ?? '');
        if (!id) continue;
        mapById.set(id, this.normalizeDashboardProject({ ...mapById.get(id), ...item } as DashboardProject));
      }

      this.allInvestments.set(Array.from(mapById.values()));
    } catch (error) {
      console.error('Failed to load dashboard opportunities', error);
      this.allInvestments.set([]);
    }
  }

  selectProject(project: DashboardProject) {
    this.selectedFounderProject.set(project);
  }

  openProjectWorkspace(project: DashboardProject, navigate = false): Promise<boolean> {
    this.selectedFounderProject.set(project);
    if (navigate) {
      return this.router.navigate(['/admin/investments', project.id]);
    }
    return Promise.resolve(true);
  }

  openParticipantConversation(conversationId: string | number | null | undefined): void {
    if (!conversationId) return;
    void this.router.navigate(['/admin/chat'], { queryParams: { conversationId } });
  }

  getRoomOpportunityId(project: DashboardProject): string | number | null {
    return project.opportunityId ?? project.id ?? null;
  }

  isDraftOpportunity(project: DashboardProject): boolean {
    const status = String(project.status ?? '').trim().toLowerCase();
    return status === '1' || status === 'draft';
  }

  async publishFounderOpportunity(project: DashboardProject, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!this.isDraftOpportunity(project) || this.publishingOpportunityId() !== null) return;

    try {
      this.publishingOpportunityId.set(project.id);
      const quote = await this.walletService.getPaidActionQuote('PublishOpportunity');
      if (!quote.hasSufficientCredit) {
        this.notificationService.showToast({
          title: this.t('paidActions.insufficientTitle', 'Insufficient CREDIT'),
          message: this.t('paidActions.insufficientMessage', 'Required: {required} CREDIT. Current balance: {balance} CREDIT.')
            .replace('{required}', this.formatCredits(quote.creditCost))
            .replace('{balance}', this.formatCredits(quote.currentBalance)),
          type: 'error'
        });
        return;
      }

      const confirmation = this.t('opportunityPublish.confirmation', '{action} will become publicly visible. Fixed platform fee: {cost} CREDIT. Current balance: {balance} CREDIT. Balance after publishing: {after} CREDIT.')
        .replace('{action}', this.t('opportunityPublish.action', 'Publish Opportunity'))
        .replace('{cost}', this.formatCredits(quote.creditCost))
        .replace('{balance}', this.formatCredits(quote.currentBalance))
        .replace('{after}', this.formatCredits(quote.balanceAfter));
      if (!window.confirm(confirmation)) return;

      const published = this.normalizeDashboardProject(await this.opportunityService.publishOpportunity(project.id) as DashboardProject);
      this.allInvestments.update(items => items.map(item => String(item.id) === String(project.id) ? published : item));
      if (String(this.selectedFounderProject()?.id) === String(project.id)) this.selectedFounderProject.set(published);
      this.notificationService.showToast({ title: this.t('opportunityPublish.successTitle', 'Published'), message: this.t('opportunityPublish.successMessage', 'Opportunity published successfully'), type: 'success' });
      await Promise.all([this.loadProjects(), this.userService.refreshUser().catch(() => {})]);
    } catch (error: any) {
      this.notificationService.showToast({ title: this.t('opportunityPublish.failureTitle', 'Publishing failed'), message: error?.error?.message || error?.message || this.t('opportunityPublish.failureMessage', 'The opportunity remains a Draft. Please try again.'), type: 'error' });
    } finally {
      this.publishingOpportunityId.set(null);
    }
  }

  private formatCredits(value: number): string {
    return new Intl.NumberFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(Number(value ?? 0));
  }

  private normalizeDashboardProject(project: DashboardProject): DashboardProject {
    const raw = project as Record<string, any>;
    const investors = this.safeArray(raw['investors'] ?? raw['participants']);
    const media = this.safeArray(raw['media']);

    return {
      ...project,
      investors,
      media,
      teamMembers: this.safeArray(raw['teamMembers'])
    } as DashboardProject;
  }

  private getRequestPriority(status: string): number {
    const key = String(status || '').toLowerCase();
    if (key === 'partner' || key === 'accepted') return 4;
    if (key === 'negotiating') return 3;
    if (key === 'pending' || key === 'requested') return 2;
    if (key === 'rejected' || key === 'declined' || key === 'cancelled') return 1;
    return 0;
  }

  getParticipantStatusLabel(status: string): string {
    return this.getStatusLabel(status);
  }

  getParticipantBadgeClass(status: string): string {
    const key = String(status || '').toLowerCase();
    if (key === 'partner' || key === 'accepted') return 'badge-approved';
    if (key === 'negotiating') return 'badge-negotiating';
    if (key === 'pending' || key === 'requested') return 'badge-pending';
    if (key === 'rejected' || key === 'declined' || key === 'cancelled') return 'badge-rejected';
    return 'badge-default';
  }

  formatProjectAmount(value: number): string {
    if (!value || value === 0) return this.t('dashboard.unavailable', 'Unavailable');
    return `$${value.toLocaleString()}`;
  }

  private safeArray<T = any>(value: unknown): T[] {
    return Array.isArray(value) ? value as T[] : [];
  }

  private toSafeNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private isApprovedParticipation(request: OpportunityRequest): boolean {
    return request.status === 'Accepted' || request.status === 'Partner';
  }

  getRequestAmount(request: OpportunityRequest): number {
    return this.toSafeNumber(
      request.requestedAmount
      ?? request.calculatedTotalAmount
      ?? request.loanTermsSnapshot?.contributionAmount
      ?? request.loanTermsSnapshot?.requestedAmount
      ?? request.profitSharingTermsSnapshot?.contributionAmount
      ?? request.profitSharingTermsSnapshot?.requestedAmount
      ?? request.requestMetadata?.calculatedTotalAmount
      ?? request.requestMetadata?.requestedAmount
    );
  }

  getExpectedEarnings(request: OpportunityRequest): number {
    const explicit = this.toSafeNumber(
      request.loanTermsSnapshot?.expectedReturnAmount
      ?? request.profitSharingTermsSnapshot?.expectedProfitAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedReturnAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedProfitAmount
    );
    if (explicit > 0) return explicit;

    const totalPayout = this.toSafeNumber(
      request.loanTermsSnapshot?.expectedTotalRepaymentAmount
      ?? request.profitSharingTermsSnapshot?.expectedTotalPayoutAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedTotalRepaymentAmount
      ?? request.requestMetadata?.termsSnapshot?.ExpectedTotalPayoutAmount
    );
    const invested = this.getRequestAmount(request);
    return totalPayout > invested ? totalPayout - invested : 0;
  }

  getInvestmentModelKey(request: OpportunityRequest): 'equity' | 'loan' | 'profitSharing' {
    const raw = String(request.investmentModel ?? request.requestMetadata?.investmentModel ?? request.requestMetadata?.termsSnapshot?.InvestmentModel ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw.includes('loan') || raw === '3') return 'loan';
    if (raw.includes('profit') || raw === '2') return 'profitSharing';
    return 'equity';
  }

  formatCreditAmount(value: number): string {
    return `${value.toLocaleString()} ${this.t('dashboard.creditUnit', 'CREDIT')}`;
  }

  getStatusLabel(status: string): string {
    return this.t(`dashboard.requestStatus.${status.toLowerCase()}`, status);
  }

getProjectAvatar(project: DashboardProject): string {
    // Prefer project image for project overview, fall back to profile avatar
    const projectImage = this.getImageSrc(project);
    if (projectImage) return projectImage;
    const profile = this.profileService.profile();
    return profile?.basicInfo?.avatarUrl ? this.fileStoreService.getPublicUrl(profile.basicInfo.avatarUrl) : '';
  }

  getImageSrc(inv: DashboardProject): string {
    if (!inv) return '';
    
    // Priority 1: Find CoverImage type (mediaType === 0)
    if (Array.isArray(inv.media) && inv.media.length > 0) {
      const coverImage = inv.media.find((i: any) => i?.isCover === true || String(i?.purpose || '').toLowerCase() === 'cover');
      if (coverImage) return this.fileStoreService.getPublicUrl(coverImage.fileUrl || coverImage.previewUrl || coverImage.thumbnailUrl || '');
      
      // Priority 2: Find primary image
      const primary = inv.media.find((i: any) => i?.isPrimary === true);
      if (primary) return this.fileStoreService.getPublicUrl(primary.fileUrl || primary.previewUrl || primary.thumbnailUrl || '');
      
      // Priority 3: First image
      const first = inv.media[0] as any;
      return this.fileStoreService.getPublicUrl(first?.fileUrl || first?.previewUrl || first?.thumbnailUrl || '');
    }
    
    // Priority 4: Use imageUrl from investment
    if (inv.imageUrl) return this.fileStoreService.getPublicUrl(inv.imageUrl);
    
    // Priority 5: Team member avatar fallback
    const tm = inv.teamMembers && inv.teamMembers.length ? inv.teamMembers[0] : undefined;
    if (tm && tm.avatar) return this.fileStoreService.getPublicUrl(tm.avatar);
    
    return '';
  }

  getNativeFundedAmount(project: DashboardProject): number | null {
    const source = project as Record<string, any>;
    return this.toNullableNumber(source['fundedAmount']);
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  getNameInitial(name?: string): string {
    return name?.trim().charAt(0).toUpperCase() || 'I';
  }

  unselectProject() {
    this.selectedFounderProject.set(null);
  }

  async toggleFavorite(investment: DashboardProject) {
    try {
      const id = investment.id;
      this.allInvestments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: !item.favorited }) : item));
    } catch (error) {
      console.error('Failed to update favorite status', error);
    }
  }

  promptWithdraw(request: SentRequest) {
    this.requestToWithdraw.set(request);
  }

  cancelWithdraw() {
    this.requestToWithdraw.set(null);
  }

  confirmWithdraw() {
    const request = this.requestToWithdraw();
    if (request) {
      this.sentRequests.update(requests => requests.filter(r => r.id !== request.id));
      
      const dictionary = this.languageService.dictionary();
      const titleTemplate = get(dictionary, 'dashboard.withdrawSuccess.title');
      const messageTemplate = get(dictionary, 'dashboard.withdrawSuccess.message');
      const message = messageTemplate.replace('{projectName}', request.projectName);

      this.notificationService.showToast({
        title: titleTemplate,
        message: message,
        type: 'success'
      });

      this.requestToWithdraw.set(null);
    }
  }
  
  getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / TIME_INTERVALS.YEAR;
    if (interval > 1) {
      const years = Math.floor(interval);
      const key = years > 1 ? 'common.timeAgo.years' : 'common.timeAgo.year';
      return this.t(key, '{count} years ago').replace('{count}', String(years));
    }
    interval = seconds / TIME_INTERVALS.MONTH;
    if (interval > 1) {
      const months = Math.floor(interval);
      const key = months > 1 ? 'common.timeAgo.months' : 'common.timeAgo.month';
      return this.t(key, '{count} months ago').replace('{count}', String(months));
    }
    interval = seconds / TIME_INTERVALS.DAY;
    if (interval > 1) {
      const days = Math.floor(interval);
      const key = days > 1 ? 'common.timeAgo.days' : 'common.timeAgo.day';
      return this.t(key, '{count} days ago').replace('{count}', String(days));
    }
    interval = seconds / TIME_INTERVALS.HOUR;
    if (interval > 1) {
      const hours = Math.floor(interval);
      const key = hours > 1 ? 'common.timeAgo.hours' : 'common.timeAgo.hour';
      return this.t(key, '{count} hours ago').replace('{count}', String(hours));
    }
    interval = seconds / TIME_INTERVALS.MINUTE;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      const key = minutes > 1 ? 'common.timeAgo.minutes' : 'common.timeAgo.minute';
      return this.t(key, '{count} minutes ago').replace('{count}', String(minutes));
    }
    const secs = Math.floor(seconds);
    const key = secs > 1 ? 'common.timeAgo.seconds' : 'common.timeAgo.second';
    return this.t(key, '{count} seconds ago').replace('{count}', String(secs));
  }

  private getPieChartData(): ChartData[] {
    if (this.roleContext.isActiveInvestorContext()) {
      const totals: Record<string, number> = {
        [this.t('dashboard.summary.composition.equity', 'Equity')]: 0,
        [this.t('dashboard.summary.composition.loan', 'Loan')]: 0,
        [this.t('dashboard.summary.composition.profitSharing', 'Profit Sharing')]: 0,
      };
      for (const request of this.approvedParticipations()) {
        const label = this.t(`dashboard.summary.composition.${this.getInvestmentModelKey(request)}`, this.getInvestmentModelKey(request));
        totals[label] = (totals[label] || 0) + this.getRequestAmount(request);
      }
      const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
      return Object.entries(totals)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value, percentage: total > 0 ? (value / total) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);
    }

    const investments = this.allInvestments();

    const categoryTotals: Record<string, number> = {};
    const lang = this.languageService.language();
    for (const investment of investments) {
      const value = this.getNativeFundedAmount(investment);
      if (value === null || value <= 0) continue;

      const categoryName = lang === 'ar'
        ? (investment.businessCategoryNameAr || investment.businessCategoryName || this.t('dashboard.uncategorized', 'Uncategorized'))
        : (investment.businessCategoryName || this.t('dashboard.uncategorized', 'Uncategorized'));

      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + value;
    }

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  private getLineChartData(): LineChartData[] {
    if (!this.roleContext.isActiveInvestorContext()) {
      return [
        { month: this.t('common.months.jan', 'Jan'), value: 78000 },
        { month: this.t('common.months.feb', 'Feb'), value: 81000 },
        { month: this.t('common.months.mar', 'Mar'), value: 85000 },
        { month: this.t('common.months.apr', 'Apr'), value: 83000 },
        { month: this.t('common.months.may', 'May'), value: 90000 },
        { month: this.t('common.months.jun', 'Jun'), value: 92000 },
        { month: this.t('common.months.jul', 'Jul'), value: 95000 },
        { month: this.t('common.months.aug', 'Aug'), value: 98000 },
      ];
    }

    const year = this.selectedYear();
    const monthNames = [
      this.t('common.months.jan', 'Jan'),
      this.t('common.months.feb', 'Feb'),
      this.t('common.months.mar', 'Mar'),
      this.t('common.months.apr', 'Apr'),
      this.t('common.months.may', 'May'),
      this.t('common.months.jun', 'Jun'),
      this.t('common.months.jul', 'Jul'),
      this.t('common.months.aug', 'Aug'),
      this.t('common.months.sep', 'Sep'),
      this.t('common.months.oct', 'Oct'),
      this.t('common.months.nov', 'Nov'),
      this.t('common.months.dec', 'Dec'),
    ];

    const monthlyTotals = new Array<number>(12).fill(0);
    for (const investment of this.myInvestments()) {
      const createdAt = investment.createdAt ? new Date(investment.createdAt) : null;
      if (!createdAt || isNaN(createdAt.getTime())) continue;
      if (createdAt.getFullYear() !== year) continue;

      const invested = this.getRequestAmount(investment);
      if (invested <= 0) continue;
      monthlyTotals[createdAt.getMonth()] += invested;
    }

    return monthlyTotals.map((value, index) => ({
      month: monthNames[index],
      value,
    }));
  }

  private getBarChartData(): BarChartData[] {
     // Mock data for new investors over time
    return [
      { label: this.t('common.months.apr', 'Apr'), value: 5 },
      { label: this.t('common.months.may', 'May'), value: 8 },
      { label: this.t('common.months.jun', 'Jun'), value: 12 },
      { label: this.t('common.months.jul', 'Jul'), value: 7 },
      { label: this.t('common.months.aug', 'Aug'), value: 15 },
      { label: this.t('common.months.sep', 'Sep'), value: 11 },
    ];
  }
  
  private createBarChart(): void {
    const data = this.getBarChartData();
    const element = this.barChart()?.nativeElement;
    
    if (!element || element.clientWidth === 0) return;

    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
        
    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.label))
        .padding(0.4);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#94a3b8');

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.2])
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .style('fill', '#94a3b8');
        
    svg.selectAll('.domain, .tick line').attr('stroke', '#374151');

    const barGradient = svg.append("defs").append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");
    barGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    barGradient.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6");

    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "url(#bar-gradient)")
        .attr('rx', 4)
        .attr('ry', 4);
  }


  private createPieChart(): void {
    const data = this.getPieChartData();
    const element = this.pieChart()?.nativeElement;

    if (!element) return;
    
    d3.select(element).select('svg').remove();
    d3.select(element).select('.d3-tooltip').remove();
    
    if (data.length === 0) {
      element.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">No data to display</div>`;
      return;
    }
    element.innerHTML = ''; // Clear fallback text

    const width = 500;
    const height = 300;
    const radius = Math.min(height, height) / 2;
    const chartCenterY = height / 2;
    const lang = this.languageService.language();
    const chartCenterX = lang === 'ar' ? width - radius - 20 : radius + 20;

    const svg = d3.select(element)
      .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
        .attr('transform', `translate(${chartCenterX}, ${chartCenterY})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(['#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899']);

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    const data_ready = pie(data as any);
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    const centerLabel = this.roleContext.isActiveInvestorContext() ? this.t('dashboard.allocationTotal', 'Total Invested') : this.t('dashboard.allocationTotal', 'Total');
    const formattedTotal = `$${totalValue.toLocaleString()}`;

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.9);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('fill', '#e2e8f0')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text(centerLabel);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('fill', '#93a5b4')
      .style('font-size', '20px')
      .style('font-weight', '700')
      .text(formattedTotal);
      
    const tooltip = d3.select(element)
      .append('div')
      .attr('class', 'd3-tooltip absolute bg-slate-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg pointer-events-none')
      .style('opacity', 0);

    // Role-aware label for tooltip (investor sees 'You invested')
    const valueLabel = this.roleContext.isActiveInvestorContext() ? 'You invested' : 'Amount';

    const sanitize = (name: string) => name.replace(/\s+/g, '-');

    svg
      .selectAll('allSlices')
      .data(data_ready)
      .join('path')
        .attr('d', arc)
        .attr('fill', (d: D3PieArcDatum) => color(d.data.name) as string)
        .attr('stroke', '#1e293b')
        .attr('id', (d: D3PieArcDatum) => `slice-${sanitize(d.data.name)}`)
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .style('transition', 'opacity 0.2s ease-in-out')
        .on('mouseover', function(event: MouseEvent, d: D3PieArcDatum) {
            d3.select(this).style('opacity', 1);
            d3.select(`#legend-${sanitize(d.data.name)}`).style('opacity', 1);
            tooltip.style('opacity', 1);
        })
        .on('mousemove', function(event: MouseEvent, d: D3PieArcDatum) {
            const percentage = d.data.percentage ? d.data.percentage.toFixed(1) : '0.0';
            tooltip
              .html(`<b>${d.data.name}</b><br>${valueLabel}: <b>$${d.data.value.toLocaleString()}</b><br>${percentage}% of portfolio`)
              .style('left', (event.pageX - element.getBoundingClientRect().left + 15) + 'px')
              .style('top', (event.pageY - element.getBoundingClientRect().top - 15) + 'px');
        })
        .on('mouseout', function(event: MouseEvent, d: D3PieArcDatum) {
            d3.select(this).style('opacity', 0.8);
            d3.select(`#legend-${sanitize(d.data.name)}`).style('opacity', 0.8);
            tooltip.style('opacity', 0);
        });
      
    const legendX = lang === 'ar' ? -radius - 40 : radius + 40;
    const legend = svg.append('g')
        .attr('transform', `translate(${legendX}, ${-height/2 + 60})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .join('g')
        .attr('class', 'legend-item')
        .attr('id', (d: ChartData) => `legend-${sanitize(d.name)}`)
        .attr('transform', (d: ChartData, i: number) => `translate(0, ${i * 30})`)
        .style('opacity', 0.8)
        .style('cursor', 'default')
        .style('transition', 'opacity 0.2s ease-in-out')
        .on('mouseover', function(event: MouseEvent, d: ChartData) {
            d3.select(this).style('opacity', 1);
            d3.select(`#slice-${sanitize(d.name)}`).style('opacity', 1);
        })
        .on('mouseout', function(event: MouseEvent, d: ChartData) {
            d3.select(this).style('opacity', 0.8);
            d3.select(`#slice-${sanitize(d.name)}`).style('opacity', 0.8);
        });

    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', (d: ChartData) => color(d.name) as string);

    legendItems.append('text')
      .attr('x', lang === 'ar' ? -24 : 24)
      .attr('y', 14)
      .text((d: ChartData) => {
        const percentage = d.percentage ? d.percentage.toFixed(1) : '0.0';
        return `${d.name} (${percentage}%)`;
      })
      .style('fill', '#e2e8f0')
      .style('font-size', '14px')
      .style('text-anchor', lang === 'ar' ? 'end' : 'start');
  }

  private createLineChart(): void {
    const data = this.getLineChartData();
    const element = this.lineChart()?.nativeElement;

    if (!element || element.clientWidth === 0) return;

    d3.select(element).select('svg').remove();
    d3.select(element).select('.d3-tooltip').remove();
    
    if (data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const defs = svg.append("defs");
    const lineGradient = defs.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    lineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    lineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6");

    const areaGradient = defs.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.3);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#111827").attr("stop-opacity", 0);

    const x = d3.scaleBand()
      .domain(data.map((d: LineChartData) => d.month))
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: LineChartData) => d.value) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').style('fill', '#94a3b8');
    svg.selectAll('.domain, .tick line').attr('stroke', '#374151');
      
    const yAxis = svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: any) => `$${d / 1000}k`));
    yAxis.selectAll('text').style('fill', '#94a3b8');
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line')
       .attr('stroke', '#374151')
       .attr('stroke-dasharray', '3,3')
       .attr('x2', width);

    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', d3.area()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y0(height)
        .y1((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3)
      .attr('d', d3.line()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );
    
    const tooltip = d3.select(element)
      .append('div')
      .attr('class', 'd3-tooltip absolute bg-slate-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg pointer-events-none')
      .style('opacity', 0);
      
    const focus = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'y-hover-line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', height);

    focus.append('circle')
      .attr('r', 6)
      .attr('fill', '#8b5cf6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => { focus.style('display', null); tooltip.style('opacity', 1); })
      .on('mouseout', () => { focus.style('display', 'none'); tooltip.style('opacity', 0); })
      .on('mousemove', mousemove);
      
    const xValues = data.map((d: LineChartData) => x(d.month)! + x.bandwidth() / 2);
    const bisect = d3.bisector((d: number) => d).left;

    function mousemove(event: MouseEvent) {
      const mouseX = d3.pointer(event)[0];
      const index = bisect(xValues, mouseX, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      
      const d = (d1 && (mouseX - xValues[index-1] > xValues[index] - mouseX)) ? d1 : d0;
      
      if (d) {
        const focusX = x(d.month)! + x.bandwidth() / 2;
        const focusY = y(d.value);
        
        focus.select('circle')
          .attr('cx', focusX)
          .attr('cy', focusY);
          
        focus.select('.y-hover-line')
          .attr('x1', focusX)
          .attr('x2', focusX);
          
        tooltip
          .html(`<b>${d.month}</b><br>$${d.value.toLocaleString()}`)
          .style('left', (focusX + margin.left + 15) + 'px')
          .style('top', (focusY + margin.top) + 'px');
      }
    }
  }
}
