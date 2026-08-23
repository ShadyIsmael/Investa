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
import { ApprovedInvestor, Opportunity, OpportunityService, OpportunityRoom, OpportunityMilestone, OpportunityEvent, OpportunityDocument } from '../../../services/opportunity.service';
import { WalletService } from '../../../services/wallet.service';
import { CashFlowService, CashFlowSummary, MonthlyCashFlow, PaymentScheduleItem } from '../../../services/cash-flow.service';
import { CurrencyService } from '../../../services/currency.service';
import { OpportunityRequest, OpportunityRequestKind } from '../../../models/request.model';
import { TIME_INTERVALS } from '../../../config/constants';
import { get } from 'lodash-es';
import { sumParticipationValues } from './dashboard-calculations';
import { FounderPortfolioDashboardComponent } from './founder-portfolio-dashboard.component';

declare var d3: any;

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
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

interface SentRequest {
  id: number | string;
  projectName: string;
  projectImageUrl: string;
  author: string;
  status: 'Pending' | 'Negotiating' | 'Partner' | 'Rejected';
  date: Date;
}

type DashboardProject = Opportunity & Record<string, any>;

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe, RouterLink, FounderPortfolioDashboardComponent]
})
export class DashboardComponent {
private opportunityService = inject(OpportunityService);
private walletService = inject(WalletService);
private currencyService = inject(CurrencyService);
  private cashFlowService = inject(CashFlowService);
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
  projectsLoading = signal(false);
  cashFlowSummary = signal<CashFlowSummary | null>(null);
  monthlyCashFlow = signal<MonthlyCashFlow[]>([]);
  upcomingCashFlow = signal<PaymentScheduleItem[]>([]);
  cashFlowLoading = signal(false);
  cashFlowUnavailable = signal(false);
  opportunityRoom = signal<OpportunityRoom | null>(null);
  roomLoading = signal(false);
  direction = computed(() => this.languageService.direction());
  isInvestorDashboardContext = computed(() => this.roleContext.isActiveInvestorContext());
  isFounderDashboardContext = computed(() => this.roleContext.isActiveFounderContext());

  // No subscription/entitlement endpoint is currently exposed to the client portal.
  isPremium = computed<boolean | null>(() => null);
  identityName = computed(() => {
    const profile = this.profileService.profile();
    const basic = profile?.basicInfo;
    return basic?.fullName || [basic?.firstName, basic?.lastName].filter(Boolean).join(' ') || profile?.coreMetrics?.email || this.t('dashboard.partnerFallback', 'FOPX One Partner');
  });
  identityAvatar = computed(() => {
    const value = this.profileService.profile()?.basicInfo?.avatarUrl;
    return value ? this.fileStoreService.getPublicUrl(value) : '';
  });
  hasGrowthHistory = computed(() => {
    if (this.investorParticipationRequests().some(item => !!item.createdAt)) return true;
    const flow = this.cashFlowSummary();
    return flow != null && flow.totalInvestedAmount > 0;
  });
  nextProfileAchievement = computed(() => Math.max(0, 100 - this.profileCompletion()));

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
    return profile.profileCompletionPercentage ?? 0;
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
  currentCredits = computed(() => this.userService.credits());
  availableCredits = this.userService.credits;
  investmentCurrency = computed(() => this.cashFlowSummary()?.currency ?? this.currencyService.resolve()?.isoCode ?? '');
  cashFlowTotalInvested = computed(() => this.cashFlowSummary()?.totalInvestedAmount ?? this.cashFlowSummary()?.remainingPrincipal ?? 0);
  totalInvested = computed(() => {
    return sumParticipationValues(this.approvedParticipations(), request => this.getRequestAmount(request));
  });
  expectedEarnings = computed(() => {
    return sumParticipationValues(this.approvedParticipations(), request => this.getExpectedEarnings(request));
  });
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
  approvedInvestors = signal<ApprovedInvestor[]>([]);
  approvedInvestorsLoading = signal(false);
  founderProjectDataError = signal<string | null>(null);
  approvedInvestorsExpanded = signal(false);
  private failedApprovedInvestorAvatars = signal<ReadonlySet<string>>(new Set());
  private approvedInvestorsLoadSequence = 0;
  private opportunityRoomLoadSequence = 0;
  visibleApprovedInvestors = computed(() => this.approvedInvestorsExpanded() ? this.approvedInvestors() : this.approvedInvestors().slice(0, 4));
  hiddenApprovedInvestorCount = computed(() => Math.max(0, this.approvedInvestors().length - this.visibleApprovedInvestors().length));
  private approvedInvestorsProjectId: string | null = null;
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

  founderProjectParticipantCount = computed(() => {
    const ids = new Set<string>();
    this.selectedFounderProjectRequests().forEach(request => {
      const key = String(request.investorId ?? request.counterpartName ?? request.senderName ?? request.receiverName ?? request.id);
      if (key) ids.add(key);
    });
    return ids.size;
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

  roomTimeline = computed<OpportunityEvent[]>(() => {
    const room = this.opportunityRoom();
    const raw = room?.timeline;
    if (!raw) return [];
    let items: any[] = [];
    if (Array.isArray(raw)) {
      items = raw.flatMap((item: any) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean);
    } else if (typeof raw === 'object') {
      items = Object.values(raw).flat().filter(Boolean);
    }
    return items as OpportunityEvent[];
  });

  roomMilestones = computed<OpportunityMilestone[]>(() => {
    const room = this.opportunityRoom();
    const extract = (source: any): any[] => {
      if (!source) return [];
      if (Array.isArray(source)) return source.flatMap((item: any) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean);
      if (typeof source === 'object') return Object.values(source).flat().filter(Boolean);
      return [];
    };
    const isPlainTitle = (v: any) => v && typeof v === 'string' && !v.includes('.') && !v.startsWith('project');
    let items = extract(room?.milestones).filter((item: any) => {
      // Keep if no titleKey (real milestone) OR has plain title (milestone with both title+titleKey)
      return !item.titleKey || isPlainTitle(item.title);
    });
    // Fallback: if no real milestones found, look in timeline for 'Milestone' events
    if (items.length === 0) {
      items = extract(room?.timeline ?? room?.events).filter((item: any) =>
        (item.eventType === 'Milestone' || item.type === 'Milestone') && isPlainTitle(item.title)
      );
    }
    return items as OpportunityMilestone[];
  });

  roomDocuments = computed<OpportunityDocument[]>(() => {
    const room = this.opportunityRoom();
    const raw = room?.documents ?? room?.documentsLibrary;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.flatMap((item: any) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean) as OpportunityDocument[];
    if (typeof raw === 'object') return Object.values(raw).flat().filter(Boolean) as OpportunityDocument[];
    return [];
  });

  completedMilestoneCount = computed(() => this.roomMilestones().filter(m => String(m.status ?? '').toLowerCase() === 'completed').length);

  pendingInvestorCount = computed(() => {
    const project = this.selectedFounderProject();
    if (!project) return 0;
    return project.approvedParticipantCount ?? this.approvedInvestors().length;
  });

  pendingParticipationCount = computed(() =>
    this.selectedFounderParticipationRequests().filter(r => r.status === 'Pending' || r.status === 'Requested').length
  );

  pendingConversationCount = computed(() =>
    this.selectedFounderConversationRequests().filter(r => r.status === 'Pending').length
  );

  latestApprovedInvestor = computed<ApprovedInvestor | null>(() => {
    const list = this.approvedInvestors();
    if (list.length === 0) return null;
    return list.reduce((latest, current) =>
      new Date(current.approvedAt) > new Date(latest.approvedAt) ? current : latest
    );
  });

  investmentModelType = computed<string | null>(() => {
    const project = this.selectedFounderProject();
    if (!project) return null;
    const raw = String(project.investmentModel ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    if (raw.includes('loan') || raw === '3') return 'loan';
    if (raw.includes('profit') || raw === '2') return 'profitSharing';
    if (raw.includes('equity') || raw === '1' || raw.includes('capital')) return 'equity';
    return null;
  });

  totalMilestoneCount = computed(() => this.roomMilestones().length);

  nextIncompleteMilestone = computed<OpportunityMilestone | null>(() => {
    const milestones = this.roomMilestones();
    const incomplete = milestones
      .filter(m => String(m.status ?? '').toLowerCase() !== 'completed')
      .sort((a, b) => new Date(a.targetDate ?? 0).getTime() - new Date(b.targetDate ?? 0).getTime());
    return incomplete.length > 0 ? incomplete[0] : null;
  });

  overdueMilestoneCount = computed(() => {
    const now = new Date();
    return this.roomMilestones().filter(m => {
      if (!m.targetDate) return false;
      if (String(m.status ?? '').toLowerCase() === 'completed') return false;
      return new Date(m.targetDate) < now;
    }).length;
  });

  sortedMilestones = computed<OpportunityMilestone[]>(() => {
    return [...this.roomMilestones()]
      .map(m => {
        const anyM = m as any;
        const metadata = this.parseMetadata(anyM.metadata);

        // Priority: metadata.milestoneTitle > newValue > m.title (plain text) > titleKey (i18n) > name/milestoneName
        let resolvedTitle = metadata?.milestoneTitle || anyM.newValue || '';
        if (!resolvedTitle) {
          const titleRaw = m.title;
          const titleKey = anyM.titleKey;
          // If m.title is a plain name (not an i18n key), use it directly
          if (titleRaw && !titleRaw.includes('.') && !titleRaw.startsWith('project')) {
            resolvedTitle = titleRaw;
          } else if (titleKey) {
            const translated = this.resolveI18n(titleKey, metadata);
            resolvedTitle = translated || titleRaw || '';
          } else if (titleRaw) {
            resolvedTitle = titleRaw;
          }
        }
        resolvedTitle = resolvedTitle || anyM.name || anyM.milestoneName || '';

        // Priority for description: metadata.milestoneDescription > m.description (plain) > descriptionKey (i18n) > desc
        let resolvedDesc = metadata?.milestoneDescription || '';
        if (!resolvedDesc) {
          const descRaw = m.description;
          const descKey = anyM.descriptionKey;
          if (descRaw && !descRaw.includes('.') && !descRaw.startsWith('project')) {
            resolvedDesc = descRaw;
          } else if (descKey) {
            const translated = this.resolveI18n(descKey, metadata);
            resolvedDesc = translated || descRaw || '';
          } else if (descRaw) {
            resolvedDesc = descRaw;
          }
        }
        resolvedDesc = resolvedDesc || anyM.desc || '';

        // Date: completedAt, targetDate, eventDate, date, createdAt
        const resolvedDate = anyM.completedAt || m.targetDate || anyM.eventDate || anyM.date || anyM.createdAt || null;

        return {
          ...m,
          title: resolvedTitle,
          description: resolvedDesc,
          status: String(m.status || anyM.type || '').toLowerCase(),
          targetDate: resolvedDate,
        };
      })
      .sort((a, b) => {
        const aDate = a.targetDate ? new Date(a.targetDate).getTime() : 0;
        const bDate = b.targetDate ? new Date(b.targetDate).getTime() : 0;
        return aDate - bDate;
      });
  });

  currentMilestoneIndex = computed(() => {
    const milestones = this.sortedMilestones();
    const idx = milestones.findIndex(m => m.status !== 'completed');
    return idx >= 0 ? idx : milestones.length - 1;
  });

  latestDocument = computed<OpportunityDocument | null>(() => {
    const docs = this.roomDocuments();
    if (docs.length === 0) return null;
    return docs.reduce((latest, current) =>
      new Date(current.createdAt ?? 0) > new Date(latest.createdAt ?? 0) ? current : latest
    );
  });

  latestRoomActivity = computed<{ title: string; timeAgo: string } | null>(() => {
    const timeline = this.roomTimeline();
    if (timeline.length === 0) return null;
    const latest = timeline.reduce((a, b) =>
      new Date(b.occurredAt ?? 0) > new Date(a.occurredAt ?? 0) ? b : a
    );
    return {
      title: latest.title,
      timeAgo: latest.occurredAt ? this.getDateAgo(latest.occurredAt) : ''
    };
  });

  nextPaymentDate = computed<string | null>(() => {
    const project = this.selectedFounderProject();
    if (!project?.finalRepaymentDate) return null;
    const freq = String(project.repaymentFrequency ?? 'Monthly').toLowerCase();
    const final = new Date(project.finalRepaymentDate);
    const now = new Date();
    if (final <= now) return project.finalRepaymentDate;
    let monthsBack = 0;
    if (freq.includes('month')) monthsBack = 1;
    else if (freq.includes('quarter')) monthsBack = 3;
    else if (freq.includes('semi') || freq.includes('semi-annual')) monthsBack = 6;
    else if (freq.includes('annual')) monthsBack = 12;
    if (monthsBack === 0) return project.finalRepaymentDate;
    const candidate = new Date(final);
    while (candidate > now) candidate.setMonth(candidate.getMonth() - monthsBack);
    candidate.setMonth(candidate.getMonth() + monthsBack);
    return candidate.toISOString().split('T')[0];
  });

  paymentPerInvestor = computed<{ displayName: string; amount: number }[]>(() => {
    const investors = this.approvedInvestors();
    return investors.map(inv => ({
      displayName: inv.displayName,
      amount: inv.totalApprovedContribution
    })).filter(p => p.amount > 0).sort((a, b) => b.amount - a.amount);
  });

  // Mock data for founder dashboard
  sentRequests = signal<SentRequest[]>([]);

  requestToWithdraw = signal<SentRequest | null>(null);

  constructor() {
    this.currencyService.ensureLoaded();
    if (this.roleContext.isActiveInvestorContext()) {
      void this.loadProjects();
      void this.requestsService.refreshRequests();
      void this.loadCashFlow();
    }

    effect(() => {
      const projects = this.founderProjects();
      if (this.roleContext.isActiveFounderContext() && projects.length === 1 && !this.selectedFounderProject()) {
        this.selectedFounderProject.set(projects[0]);
      }
    });

    effect(() => {
      const projectId = this.selectedFounderProject()?.id;
      if (projectId == null) {
        this.approvedInvestors.set([]);
        this.approvedInvestorsProjectId = null;
        return;
      }
      void this.loadApprovedInvestors(projectId);
    });

    effect(() => {
      const projectId = this.selectedFounderProject()?.id;
      if (!this.roleContext.isActiveFounderContext() || projectId == null) {
        this.opportunityRoom.set(null);
        return;
      }
      void this.loadOpportunityRoom(projectId);
    });

    effect(() => {
      const credits = this.currentCredits();
      if (credits < 0 && !this.creditsRefreshed()) {
        this.creditsRefreshed.set(true);
        void this.userService.refreshUser().catch(() => {});
      }
    });

    effect(() => {
      this.approvedParticipations();
      this.cashFlowSummary();
      this.selectedYear();
      this.languageService.language();
      setTimeout(() => {
        if (this.roleContext.isActiveInvestorContext()) {
          if (this.pieChart()) this.createPieChart();
          if (this.lineChart()) this.createLineChart();
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

  private async loadCashFlow(): Promise<void> {
    if (!this.roleContext.isActiveInvestorContext()) return;
    this.cashFlowLoading.set(true);
    this.cashFlowUnavailable.set(false);
    try {
      const [summary, monthly, upcoming] = await Promise.all([
        this.cashFlowService.getSummary(),
        this.cashFlowService.getMonthly(12),
        this.cashFlowService.getUpcoming(5)
      ]);
      this.cashFlowSummary.set(summary);
      this.monthlyCashFlow.set(monthly);
      this.upcomingCashFlow.set(upcoming);
    } catch (error) {
      console.warn('Expected cash flow is not available.', error);
      this.cashFlowSummary.set(null);
      this.monthlyCashFlow.set([]);
      this.upcomingCashFlow.set([]);
      this.cashFlowUnavailable.set(true);
    } finally {
      this.cashFlowLoading.set(false);
    }
  }

  cashFlowChartMaximum(): number {
    return Math.max(1, ...this.monthlyCashFlow().flatMap(item => [item.expectedInterest, item.expectedPrincipal, item.actualReceived]));
  }

  cashFlowBarHeight(value: number): number {
    return Math.max(value > 0 ? 3 : 0, (value / this.cashFlowChartMaximum()) * 100);
  }

  formatCashFlowDate(value: string | null | undefined): string {
    if (!value) return this.t('dashboard.unavailable', 'Unavailable');
    return new Intl.DateTimeFormat(this.languageService.language() === 'ar' ? 'ar-EG' : 'en-EG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  private async loadProjects(): Promise<void> {
    this.projectsLoading.set(true);
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
    } finally {
      this.projectsLoading.set(false);
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

  private async loadApprovedInvestors(projectId: string | number): Promise<void> {
    const key = String(projectId);
    if (this.approvedInvestorsProjectId === key) return;
    const sequence = ++this.approvedInvestorsLoadSequence;
    this.approvedInvestorsProjectId = key;
    this.approvedInvestorsExpanded.set(false);
    this.approvedInvestorsLoading.set(true);
    try {
      const investors = await this.opportunityService.getApprovedInvestors(projectId);
      if (sequence !== this.approvedInvestorsLoadSequence || String(this.selectedFounderProject()?.id) !== key) return;
      this.approvedInvestors.set(investors);
      this.founderProjectDataError.set(null);
    } catch {
      if (sequence !== this.approvedInvestorsLoadSequence) return;
      this.approvedInvestors.set([]);
      this.founderProjectDataError.set(this.t('dashboard.errors.approvedInvestors', 'Approved investors could not be loaded. Please retry.'));
    } finally {
      if (sequence === this.approvedInvestorsLoadSequence) this.approvedInvestorsLoading.set(false);
    }
  }

  private async loadOpportunityRoom(projectId: string | number): Promise<void> {
    const key = String(projectId);
    const sequence = ++this.opportunityRoomLoadSequence;
    this.roomLoading.set(true);
    try {
      const room = await this.opportunityService.getOpportunityRoom(projectId);
      if (sequence !== this.opportunityRoomLoadSequence || String(this.selectedFounderProject()?.id) !== key) return;
      this.opportunityRoom.set(room);
      this.founderProjectDataError.set(null);
    } catch {
      if (sequence !== this.opportunityRoomLoadSequence) return;
      this.opportunityRoom.set(null);
      this.founderProjectDataError.set(this.t('dashboard.errors.projectRoom', 'Project execution data could not be loaded. Please retry.'));
    } finally {
      if (sequence === this.opportunityRoomLoadSequence) this.roomLoading.set(false);
    }
  }

  expandApprovedInvestors(): void {
    this.approvedInvestorsExpanded.set(true);
  }

  approvedInvestorAvatar(investor: ApprovedInvestor): string | null {
    return investor.avatarUrl && !this.failedApprovedInvestorAvatars().has(investor.userId)
      ? this.fileStoreService.getPublicUrl(investor.avatarUrl)
      : null;
  }

  onApprovedInvestorAvatarError(userId: string): void {
    if (this.failedApprovedInvestorAvatars().has(userId)) return;
    this.failedApprovedInvestorAvatars.update(failed => new Set(failed).add(userId));
  }

  approvedInvestorInitials(displayName: string): string {
    return displayName.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase() || '?';
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
      const chargingEnabled = await this.walletService.loadChargingEnabled();
      if (!chargingEnabled) {
        const freeConfirmation = this.t('opportunityPublish.confirmationFree', '{action} will become publicly visible.')
          .replace('{action}', this.t('opportunityPublish.action', 'Publish Opportunity'));
        if (!window.confirm(freeConfirmation)) return;
      } else {
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
      }

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

  formatProjectAmount(value: number, currency?: string | null): string {
    if (!value || value === 0) return this.t('dashboard.unavailable', 'Unavailable');
    const cur = currency ?? this.selectedFounderProject()?.currency ?? this.currencyService.resolve()?.isoCode ?? '';
    return this.currencyService.format(value, cur);
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
    const currency = this.investmentCurrency();
    return this.currencyService.format(value, currency);
  }

  getStatusLabel(status: string): string {
    return this.t(`dashboard.requestStatus.${status.toLowerCase()}`, status);
  }

  translateStatus(raw: string | null | undefined): string {
    if (!raw) return '—';
    return this.t(`dashboard.enums.status.${raw.toLowerCase()}`, raw);
  }

  translateInvestmentModel(raw: string | number | null | undefined): string {
    if (raw == null) return '—';
    return this.t(`dashboard.enums.investmentModel.${String(raw).toLowerCase()}`, String(raw));
  }

  participationModelLabel(raw: string | null | undefined): string {
    const normalized = String(raw ?? '').toLowerCase().replace(/[\s_-]+/g, '');
    const key = normalized.includes('loan')
      ? 'loan'
      : normalized.includes('profit')
        ? 'profitSharing'
        : 'equity';
    return this.t(`dashboard.summary.composition.${key}`, raw || key);
  }

  translateFrequency(raw: string | null | undefined): string {
    if (!raw) return '—';
    return this.t(`dashboard.enums.frequency.${raw.toLowerCase()}`, raw);
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

  isMilestoneCompleted(ms: OpportunityMilestone): boolean {
    return ms.status === 'completed';
  }

  isMilestoneCurrent(ms: OpportunityMilestone, index: number): boolean {
    if (this.isMilestoneCompleted(ms)) return false;
    return index === this.currentMilestoneIndex();
  }

  getMilestoneDescription(ms: OpportunityMilestone): string {
    return ms.description || '';
  }

  private parseMetadata(raw: unknown): Record<string, string> | null {
    if (!raw) return null;
    if (typeof raw === 'object') return raw as Record<string, string>;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
  }

  private resolveI18n(key: string, metadata: Record<string, string> | null): string {
    const translated = this.t(key, '');
    if (!translated || translated === key) return '';
    if (!metadata) return translated;
    let result = translated;
    for (const [k, v] of Object.entries(metadata)) {
      if (v != null) result = result.replaceAll(`{${k}}`, v);
    }
    return result;
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
    const id = investment.id;
    const previous = !!investment.favorited;
    this.allInvestments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: !previous }) : item));
    try {
      const result = await this.opportunityService.setFavorite(id, !previous);
      this.allInvestments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: result.favorited }) : item));
    } catch (error) {
      this.allInvestments.update(items => items.map(item => item.id === id ? ({ ...item, favorited: previous }) : item));
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
  
  getDateAgo(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
      return this.getTimeAgo(new Date(dateStr));
    } catch {
      return '';
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

    // If no participation data, use cash-flow total invested as a single data point
    const hasDataPoints = monthlyTotals.some(v => v > 0);
    if (!hasDataPoints) {
      const totalAmount = this.cashFlowTotalInvested();
      if (totalAmount > 0) {
        monthlyTotals[new Date().getMonth()] = totalAmount;
      }
    }

    let cumulativeValue = 0;
    return monthlyTotals.map((value, index) => ({
      month: monthNames[index],
      value: cumulativeValue += value,
    }));
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
    const formattedTotal = this.currencyService.format(totalValue, this.investmentCurrency());

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
              .html(`<b>${d.data.name}</b><br>${valueLabel}: <b>${this.currencyService.format(d.data.value, this.investmentCurrency())}</b><br>${percentage}% of portfolio`)
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
    const realData = this.getLineChartData();
    const hasRealData = realData.some(item => item.value > 0);
    const data = realData.length ? realData : [{ month: this.t('common.months.jan', 'Jan'), value: 0 }];
    const element = this.lineChart()?.nativeElement;

    if (!element || element.clientWidth === 0 || typeof d3 === 'undefined') return;

    d3.select(element).select('svg').remove();
    d3.select(element).select('.d3-tooltip').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const textColor = 'var(--investa-text-muted)';
    const gridColor = 'var(--investa-border)';
    const surfaceColor = 'var(--investa-surface-2)';
    const svg = d3.select(element)
      .append('svg')
        .attr('class', 'growth-chart-svg')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
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
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", surfaceColor).attr("stop-opacity", 0);

    const x = d3.scaleBand()
      .domain(data.map((d: LineChartData) => d.month))
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, Math.max(1, d3.max(data, (d: LineChartData) => d.value) * 1.1)])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').style('fill', textColor);
    svg.selectAll('.domain, .tick line').attr('stroke', gridColor);
      
    const currency = this.investmentCurrency();
    const yAxis = svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: any) => {
        if (d >= 1000) return `${(d / 1000).toFixed(1)}k ${currency}`;
        return `${d.toFixed(0)} ${currency}`;
      }));
    yAxis.selectAll('text').style('fill', textColor);
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line')
       .attr('stroke', gridColor)
       .attr('stroke-dasharray', '3,3')
       .attr('x2', width);

    if (hasRealData) svg.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', d3.area()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y0(height)
        .y1((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );

    if (hasRealData) svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3)
      .attr('d', d3.line()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );
    
    if (!hasRealData) return;

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
          .html(`<b>${d.month}</b><br>${this.currencyService.format(d.value, this.investmentCurrency())}`)
          .style('left', (focusX + margin.left + 15) + 'px')
          .style('top', (focusY + margin.top) + 'px');
      }
    }
  }
}
