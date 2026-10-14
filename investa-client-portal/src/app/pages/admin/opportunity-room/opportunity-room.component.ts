import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Opportunity,
  OpportunityDocument,
  OpportunityEvent,
  OpportunityMilestone,
  OpportunityMedia,
  OpportunityRoom,
  OpportunityRoomParticipation,
  ParticipationLeg,
  OpportunityRoomParticipantContext,
  OpportunityProjectContext,
  OpportunityService,
  InvestorPaymentSummary,
  InvestorPaymentDetail,
  PaymentTransactionDetail,
  MonthlyBulkConfirmPreview,
  BulkConfirmMonthlyResult,
  FundingDeclaration,
  LoanRepaymentRecord,
  ProfitSharingDistributionDeclaration,
  ProfitSharingReportingPeriod
} from '../../../services/opportunity.service';
import { FileStoreService } from '../../../services/file-store.service';
import { ReportReasonCode, ReportService } from '../../../services/report.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { FirebaseClientService, RealtimeEvent } from '../../../services/firebase-client.service';
import { CurrencyService } from '../../../services/currency.service';
import { ProjectStageService } from '../../../services/project-stage.service';
import { Subscription } from 'rxjs';
import {
  ContractService,
  InvestmentContractDetail,
  InvestmentContractSummary,
  InvestmentContractVersion,
  InvestmentContractVersionSummary,
  PdfGenerationStatus
} from '../../../services/contract.service';
import { repaymentModelLabelKey } from '../../../models/offer.model';

type RoomTab = 'overview' | 'milestones' | 'contracts' | 'timeline' | 'documents' | 'media';

interface ActivityFeedItem {
  trackKey: string;
  kind: 'milestone' | 'document' | 'media';
  title: string;
  detail: string;
  dateText: string;
  dateValue: number;
}

interface RoomError {
  status?: number;
  title: string;
  message: string;
}

interface InvestorContractGroup {
  investorUserId: string;
  investorDisplayName: string;
  contracts: InvestmentContractSummary[];
}

export interface FundingHistoryEntry extends FundingDeclaration {
  investorDisplayName: string;
}

const RECENT_ACTIVITY_LIMIT = 5;

export function opportunityRoomProjectRoute(
  projectId: number | string | null | undefined,
  isFounder: boolean
): Array<string | number> {
  if (projectId === null || projectId === undefined || projectId === '') return ['/admin/projects'];
  return ['/admin/projects', projectId];
}

/**
 * The Room endpoint is authoritative, but a stale or partially failed response
 * must not be allowed to crash Angular's @for tracking expressions. Room
 * participation rows are immutable records, so malformed rows can be omitted
 * safely until the next refresh returns a valid record.
 */
export function normalizeOpportunityRoomParticipations(
  values: readonly (OpportunityRoomParticipation | null | undefined)[] | null | undefined
): OpportunityRoomParticipation[] {
  const rows = Array.isArray(values) ? values : [];
  return rows
    .filter((participation): participation is OpportunityRoomParticipation => {
      const id = Number(participation?.participationId);
      return !!participation && Number.isFinite(id) && id > 0;
    })
    .map(participation => ({
      ...participation,
      participationId: Number(participation.participationId),
      legs: (Array.isArray(participation.legs) ? participation.legs : [])
        .filter((leg): leg is ParticipationLeg => !!leg)
        .map((leg, index) => ({
          ...leg,
          legNumber: Number.isFinite(Number(leg.legNumber)) && Number(leg.legNumber) > 0
            ? Number(leg.legNumber)
            : index + 1,
          cashFlows: Array.isArray(leg.cashFlows) ? leg.cashFlows : [],
          obligations: Array.isArray(leg.obligations) ? leg.obligations : [],
          profitSharingReportingPeriods: Array.isArray(leg.profitSharingReportingPeriods) ? leg.profitSharingReportingPeriods : []
        }))
    }));
}

export function calculateConfirmedFundingProgress(
  fundingTarget: number | string | null | undefined,
  confirmedReceivedAmount: number | string | null | undefined
): number | null {
  const target = Number(fundingTarget);
  const confirmed = Number(confirmedReceivedAmount);
  if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(confirmed)) return null;
  return Math.round((confirmed * 100 / target) * 100) / 100;
}

@Component({
  standalone: true,
  selector: 'app-opportunity-room',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './opportunity-room.component.html',
  styleUrl: './opportunity-room.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityRoomComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private opportunityService = inject(OpportunityService);
  private fileStore = inject(FileStoreService);
  private reportService = inject(ReportService);
  private languageService = inject(LanguageService);
  private contractService = inject(ContractService);
private firebaseClient = inject(FirebaseClientService);
private currencyService = inject(CurrencyService);
private stageService = inject(ProjectStageService);
  private readonly realtimeSubscriptions = new Subscription();
  private roomRefreshInFlight: Promise<void> | null = null;
  private roomRefreshQueued = false;

  room = signal<OpportunityRoom | null>(null);
  isLoading = signal(false);
  error = signal<RoomError | null>(null);
  activeTab = signal<RoomTab>('overview');
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  isSubmittingAction = signal(false);
  completingMilestoneId = signal<string | number | null>(null);
  showAllRecentActivity = signal(false);
  documentModalOpen = signal(false);
  milestoneModalOpen = signal(false);
  milestoneForm = signal({ title: '', description: '', isPublic: true });
  documentForm = signal({
    title: '',
    visibility: 'Private' as 'Public' | 'Private',
    purpose: 'PrivateDocument',
    category: 'OPPORTUNITYPRIVATEDOCUMENT',
    searchTags: ''
  });
  selectedDocumentFile = signal<File | null>(null);
  payments = signal<InvestorPaymentSummary[]>([]);
  paymentsLoading = signal(false);
  paymentsError = signal<string | null>(null);
  selectedPaymentInvestor = signal<InvestorPaymentDetail | null>(null);
  selectedPaymentInvestorLoading = signal(false);
  selectedPaymentInvestorError = signal<string | null>(null);
  recordPaymentModalOpen = signal(false);
  recordPaymentForm = signal({ participationRequestId: 0, amount: 0, paymentDate: '', reference: '', notes: '' });
  reversePaymentModalOpen = signal(false);
  reversePaymentForm = signal({ paymentTransactionId: 0, reason: '' });
  bulkConfirmPreview = signal<MonthlyBulkConfirmPreview | null>(null);
  bulkConfirmPreviewLoading = signal(false);
  bulkConfirmModalOpen = signal(false);
  bulkConfirmResult = signal<BulkConfirmMonthlyResult | null>(null);
  bulkConfirmSubmitting = signal(false);
  recordPaymentInvestorName = signal<string>('');
  recordPaymentInstallmentInfo = signal<string>('');
  reportModalOpen = signal(false);
  reportSubmitting = signal(false);
  reportSuccess = signal(false);
  reportError = signal<string | null>(null);
  reportReason = signal<ReportReasonCode>('Spam');
  reportDescription = signal('');
  contracts = signal<InvestmentContractSummary[]>([]);
  investorContractGroups = computed<InvestorContractGroup[]>(() => {
    const groups = new Map<string, InvestorContractGroup>();
    for (const contract of this.contracts()) {
      const key = contract.investorUserId || contract.investorDisplayName;
      const group = groups.get(key);
      if (group) {
        group.contracts.push(contract);
      } else {
        groups.set(key, {
          investorUserId: contract.investorUserId,
          investorDisplayName: contract.investorDisplayName,
          contracts: [contract]
        });
      }
    }
    return Array.from(groups.values());
  });
  contractsLoading = signal(false);
  contractsLoaded = signal(false);
  contractsError = signal<string | null>(null);
  selectedContract = signal<InvestmentContractDetail | null>(null);
  selectedVersion = signal<InvestmentContractVersion | null>(null);
  contractDetailsLoading = signal(false);
  contractDetailsError = signal<string | null>(null);
  previewModalOpen = signal(false);
  previewHtml = signal<string | null>(null);
  previewLoading = signal(false);
  previewError = signal<string | null>(null);
  pdfDownloading = signal<string | null>(null);
  contractEmailing = signal<string | null>(null);
  pdfStatusOverrides = signal<Record<string, PdfGenerationStatus>>({});
  fundingDeclarationModalOpen = signal(false);
  fundingDeclarationSubmitting = signal(false);
  fundingDeclarationForm = signal({
    participationId: 0,
    amount: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BankTransfer',
    externalReference: '',
    notes: '',
    proofFile: null as File | null
  });
  fundingDecisionModalOpen = signal(false);
  fundingDecisionType = signal<'confirm' | 'dispute'>('confirm');
  fundingDecisionDeclaration = signal<FundingDeclaration | null>(null);
  fundingDecisionReason = signal('');
  fundingDecisionSubmitting = signal(false);
  loanRepaymentModalOpen = signal(false);
  loanRepaymentSubmitting = signal(false);
  loanRepaymentParticipation = signal<OpportunityRoomParticipation | null>(null);
  loanRepaymentLeg = signal<ParticipationLeg | null>(null);
  loanRepaymentForm = signal({ amount: 0, externalPaymentDate: new Date().toISOString().split('T')[0], externalReference: '', proofFile: null as File | null });
  loanRepaymentDecisionRecord = signal<LoanRepaymentRecord | null>(null);
  loanRepaymentDecisionType = signal<'confirm' | 'dispute'>('confirm');
  loanRepaymentDecisionText = signal('');
  loanRepaymentDecisionSubmitting = signal(false);
  profitSharingDistributionModalOpen = signal(false);
  profitSharingDistributionSubmitting = signal(false);
  profitSharingDistributionParticipation = signal<OpportunityRoomParticipation | null>(null);
  profitSharingDistributionLeg = signal<ParticipationLeg | null>(null);
  profitSharingDistributionPeriod = signal<ProfitSharingReportingPeriod | null>(null);
  profitSharingDistributionForm = signal({ amount: 0, externalReference: '', notes: '', evidenceFile: null as File | null });
  profitSharingDistributionDecision = signal<ProfitSharingDistributionDeclaration | null>(null);
  profitSharingDistributionDecisionType = signal<'confirm' | 'dispute'>('confirm');
  profitSharingDistributionDecisionText = signal('');
  profitSharingDistributionDecisionSubmitting = signal(false);

  readonly reportReasons: ReportReasonCode[] = [
    'SuspiciousOpportunity',
    'MisleadingInformation',
    'Spam',
    'Abuse',
    'FraudConcern',
    'InappropriateContent',
    'Other'
  ];

  tabs: Array<{ id: RoomTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'contracts', label: '' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
    { id: 'media', label: 'Media' }
  ];

  overview = computed(() => (this.room()?.overview ?? {}) as Opportunity & Record<string, any>);
  projectContext = computed<OpportunityProjectContext | null>(() => this.room()?.projectContext ?? null);
  participantContext = computed(() => (this.room()?.participantContext ?? {}) as OpportunityRoomParticipantContext);
  roomParticipations = computed(() => normalizeOpportunityRoomParticipations(this.room()?.participations));
  documents = computed(() => this.flattenLibrary<OpportunityDocument>(this.room()?.documentsLibrary ?? this.room()?.documents));
  media = computed(() => this.flattenLibrary<OpportunityMedia>(this.room()?.mediaLibrary ?? this.room()?.media));
  milestones = computed(() => this.flattenLibrary<OpportunityMilestone>(this.room()?.milestones));
  timeline = computed(() => this.flattenLibrary<OpportunityEvent>(this.room()?.timeline));
  fundingHistory = computed<FundingHistoryEntry[]>(() => this.roomParticipations()
    .flatMap(participation => (participation.fundingDeclarations ?? []).map(declaration => ({
      ...declaration,
      investorDisplayName: participation.investorDisplayName
    })))
    .sort((left, right) => this.dateValueFromRaw(right.declaredAt) - this.dateValueFromRaw(left.declaredAt)));

  milestonesSorted = computed(() => this.sortMilestonesByDateDesc(this.milestones()));
  milestonesInSequence = computed(() => [...this.milestones()].sort((a, b) =>
    this.dateValueFromRaw(a.createdAt) - this.dateValueFromRaw(b.createdAt)
  ));
  currentMilestone = computed(() =>
    this.milestonesInSequence().find(milestone => String(milestone.status ?? '').toLowerCase() !== 'completed') ?? null
  );
  completedMilestoneCount = computed(() =>
    this.milestones().filter(milestone => String(milestone.status ?? '').toLowerCase() === 'completed').length
  );
  timelineSorted = computed(() => this.sortEventsByDateDesc(this.timeline()));
  documentsSorted = computed(() => this.sortByDateDesc(this.documents(), item => this.documentRawDate(item)));
  mediaSorted = computed(() => this.sortByDateDesc(this.media(), item => this.mediaRawDate(item)));

  documentGroups = computed(() => this.groupDocuments(this.documents()));
  mediaGroups = computed(() => this.groupMedia(this.media()));

  latestMilestone = computed(() => this.room()?.latestMilestone ?? this.milestonesSorted()[0] ?? null);

  recentActivity = computed(() => this.activityFeed().sort((a, b) => b.dateValue - a.dateValue));
  displayedRecentActivity = computed(() => {
    const items = this.recentActivity();
    return this.showAllRecentActivity() ? items : items.slice(0, RECENT_ACTIVITY_LIMIT);
  });
  hasMoreRecentActivity = computed(() => this.recentActivity().length > RECENT_ACTIVITY_LIMIT);

  recommendedNextSteps = computed(() => {
    const steps: string[] = [];
    const context = this.participantContext();
    const latest = this.latestMilestone();

    if (!context.canViewPrivateFiles) {
      steps.push('Review public documents first, then request private-room permissions if needed.');
    }

    if (this.documents().length === 0) {
      steps.push('No documents are available yet. Watch this room for founder uploads.');
    } else if (!context.canDownloadFiles) {
      steps.push('Use in-browser preview links while downloads are restricted for your current role.');
    } else {
      steps.push('Download and review the latest documents before your next founder conversation.');
    }

    if (this.timeline().length > 0) {
      steps.push('Review milestones to understand strategic progress before evaluating new updates.');
    }

    if (latest) {
      steps.push('Review the latest milestone to understand what changed most recently.');
    }

    if (steps.length === 0) {
      steps.push('Check back soon for new milestones, updates, or documents in this room.');
    }

    return steps.slice(0, 4);
  });

  constructor() {
    void this.stageService.ensureLoaded();
    void this.load();
    this.realtimeSubscriptions.add(
      this.firebaseClient.onRealtimeEvent.subscribe(event => this.handleRealtimeEvent(event))
    );
  }

  ngOnDestroy(): void {
    this.realtimeSubscriptions.unsubscribe();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      this.isLoading.set(true);
      this.error.set(null);
      this.room.set(await this.opportunityService.getOpportunityRoom(id));
      this.resetContractState();
      if (this.activeTab() === 'contracts') await this.loadContracts(true);
    } catch (error) {
      this.room.set(null);
      this.error.set(this.toRoomError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: RoomTab): void {
    this.activeTab.set(tab);
    if (tab === 'contracts') {
      void this.loadContracts();
    }
  }

  showAllRecent(): void {
    this.showAllRecentActivity.set(true);
  }

  showRecentSummary(): void {
    this.showAllRecentActivity.set(false);
  }

  opportunityId(): string | number | null {
    return this.overview().id || this.route.snapshot.paramMap.get('id');
  }

  isFounder(): boolean {
    return this.participantContext().isFounder === true || this.roomRole() === 'Founder';
  }

  canReportProject(): boolean {
    return !!this.opportunityId() && !this.isFounder();
  }

  approvedParticipantCount(): number | null {
    return this.numberValue(this.overview().approvedParticipantCount);
  }

  canEditCoreProject(): boolean {
    return this.participantContext().canEditCoreProject === true;
  }

  canAddDocument(): boolean {
    return this.participantContext().canAddDocument === true;
  }

  canAddMilestone(): boolean {
    return this.participantContext().canAddMilestone === true;
  }

  async completeCurrentMilestone(): Promise<void> {
    const opportunityId = this.opportunityId();
    const milestone = this.currentMilestone();
    const milestoneId = milestone?.milestoneId ?? milestone?.id;
    if (!opportunityId || !milestoneId || !this.isFounder() || this.completingMilestoneId() !== null) return;

    try {
      this.completingMilestoneId.set(milestoneId);
      this.actionError.set(null);
      this.actionSuccess.set(null);
      await this.opportunityService.completeMilestone(opportunityId, milestoneId);
      this.actionSuccess.set(this.t('opportunityRoom.toasts.milestoneCompleted'));
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.toasts.milestoneCompleteFailed'));
    } finally {
      this.completingMilestoneId.set(null);
    }
  }

  isCompletingCurrentMilestone(): boolean {
    const milestone = this.currentMilestone();
    return this.completingMilestoneId() === (milestone?.milestoneId ?? milestone?.id);
  }

  coreEditMessage(): string {
    return this.canEditCoreProject()
      ? this.t('opportunityRoom.founderWorkspace.editAvailable')
      : this.t('opportunityRoom.founderWorkspace.lockedMessage');
  }

  openDocumentModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.documentModalOpen.set(true);
  }

  openFundingDeclaration(participation: OpportunityRoomParticipation): void {
    if (!this.isFounder()) return;
    const available = this.availableToDeclare(participation);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.fundingDeclarationForm.set({
      participationId: participation.participationId,
      amount: available,
      receivedDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BankTransfer',
      externalReference: '',
      notes: '',
      proofFile: null
    });
    this.fundingDeclarationModalOpen.set(true);
  }

  closeFundingDeclarationModal(): void {
    if (this.fundingDeclarationSubmitting()) return;
    this.fundingDeclarationModalOpen.set(false);
  }

  setFundingDeclarationField(field: string, value: string | number): void {
    this.fundingDeclarationForm.update(form => ({ ...form, [field]: value }));
  }

  onFundingProofSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fundingDeclarationForm.update(form => ({ ...form, proofFile: input.files?.[0] ?? null }));
  }

  availableToDeclare(participation: OpportunityRoomParticipation): number {
    const declared = (participation.fundingDeclarations ?? []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return Math.max(Number(participation.approvedAmount || 0) - declared, 0);
  }

  declaredReceivedAmount(): number | null {
    return this.numberValue((this.overview() as any).declaredReceivedAmount);
  }

  awaitingConfirmationAmount(): number | null {
    return this.numberValue((this.overview() as any).awaitingConfirmationAmount);
  }

  fundingHistoryDate(declaration: FundingDeclaration): string {
    return this.contractDate(declaration.declaredAt);
  }

  fundingDeclarationStatusClass(status: string): string {
    if (status === 'Confirmed') return 'text-emerald-300';
    if (status === 'Disputed') return 'text-amber-300';
    return 'text-blue-300';
  }

  isTerminalFundingDeclaration(declaration: FundingDeclaration): boolean {
    return declaration.status === 'Confirmed' || declaration.status === 'Disputed';
  }

  openContractSnapshot(): void {
    this.setTab('contracts');
  }

  async submitFundingDeclaration(): Promise<void> {
    const id = this.opportunityId();
    const form = this.fundingDeclarationForm();
    const participation = this.roomParticipations().find(item => item.participationId === form.participationId);
    if (!id || !participation || form.amount <= 0 || !form.receivedDate) {
      this.actionError.set(this.t('fundingDeclaration.validation.required'));
      return;
    }
    if (form.amount > this.availableToDeclare(participation)) {
      this.actionError.set(this.t('fundingDeclaration.validation.exceedsAvailable'));
      return;
    }
    try {
      this.fundingDeclarationSubmitting.set(true);
      this.actionError.set(null);
      this.actionSuccess.set(null);
      await this.opportunityService.createFundingDeclaration(id, form.participationId, {
        amount: Number(form.amount),
        currencyCode: participation.fundingCurrency,
        receivedDate: form.receivedDate,
        paymentMethod: form.paymentMethod,
        externalReference: form.externalReference || undefined,
        notes: form.notes || undefined,
        proofFile: form.proofFile
      });
      this.fundingDeclarationModalOpen.set(false);
      this.actionSuccess.set(this.t('fundingDeclaration.success'));
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(this.fundingDeclarationError(error));
    } finally {
      this.fundingDeclarationSubmitting.set(false);
    }
  }

  async downloadFundingProof(declaration: FundingDeclaration): Promise<void> {
    try {
      const blob = await this.opportunityService.downloadFundingProof(declaration.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = declaration.proofFileName || 'funding-proof';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('fundingDeclaration.validation.proofFailed'));
    }
  }

  private fundingDeclarationError(error: any): string {
    const code = String(error?.backendCode ?? error?.error?.code ?? '');
    if (code === 'FUNDING_PROOF_UPLOAD_UNAVAILABLE')
      return this.t('fundingDeclaration.validation.proofUploadUnavailable');
    const backendMessage = error?.backendMessage ?? error?.error?.message;
    if (backendMessage) return backendMessage;
    if (error?.message) return error.message;
    return this.t('fundingDeclaration.validation.failed');
  }

  canDecideFundingDeclaration(declaration: FundingDeclaration): boolean {
    return !this.isFounder()
      && this.participantContext().isAdmin !== true
      && this.participantContext().isApprovedParticipant === true
      && declaration.status === 'PendingConfirmation';
  }

  openFundingDecision(declaration: FundingDeclaration, type: 'confirm' | 'dispute'): void {
    if (!this.canDecideFundingDeclaration(declaration)) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.fundingDecisionDeclaration.set(declaration);
    this.fundingDecisionType.set(type);
    this.fundingDecisionReason.set('');
    this.fundingDecisionModalOpen.set(true);
  }

  closeFundingDecisionModal(): void {
    if (this.fundingDecisionSubmitting()) return;
    this.fundingDecisionModalOpen.set(false);
    this.fundingDecisionDeclaration.set(null);
    this.fundingDecisionReason.set('');
  }

  setFundingDecisionReason(value: string): void {
    this.fundingDecisionReason.set(value);
  }

  async submitFundingDecision(): Promise<void> {
    const declaration = this.fundingDecisionDeclaration();
    if (!declaration || this.fundingDecisionSubmitting()) return;
    const type = this.fundingDecisionType();
    const reason = this.fundingDecisionReason().trim();
    if (type === 'dispute' && !reason) {
      this.actionError.set(this.t('fundingDeclaration.validation.disputeReasonRequired'));
      return;
    }

    try {
      this.fundingDecisionSubmitting.set(true);
      this.actionError.set(null);
      this.actionSuccess.set(null);
      if (type === 'confirm') {
        await this.opportunityService.confirmFundingDeclaration(declaration.id, reason || undefined);
        this.actionSuccess.set(this.t('fundingDeclaration.confirm.success'));
      } else {
        await this.opportunityService.disputeFundingDeclaration(declaration.id, reason);
        this.actionSuccess.set(this.t('fundingDeclaration.dispute.success'));
      }
      this.fundingDecisionModalOpen.set(false);
      this.fundingDecisionDeclaration.set(null);
      this.fundingDecisionReason.set('');
      await this.refreshRoomData();
    } catch (error: any) {
      const code = String(error?.error?.code ?? '');
      const messages: Record<string, string> = {
        FUNDING_DECLARATION_ALREADY_CONFIRMED: 'fundingDeclaration.validation.alreadyConfirmed',
        FUNDING_DECLARATION_ALREADY_DISPUTED: 'fundingDeclaration.validation.alreadyDisputed',
        FUNDING_DECLARATION_CONCURRENCY: 'fundingDeclaration.validation.conflict',
        FUNDING_DECLARATION_FORBIDDEN: 'fundingDeclaration.validation.forbidden'
      };
      this.actionError.set(messages[code] ? this.t(messages[code]) : this.t('fundingDeclaration.validation.decisionFailed'));
    } finally {
      this.fundingDecisionSubmitting.set(false);
    }
  }

  canDeclareLoanRepayment(leg: ParticipationLeg): boolean {
    return this.participantContext().isAdmin !== true
      && this.isFounder()
      && !!leg.loanObligationId
      && leg.loanObligationStatus === 'Active';
  }

  openLoanRepaymentDeclaration(participation: OpportunityRoomParticipation, leg: ParticipationLeg): void {
    if (!leg.loanObligationId) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.loanRepaymentParticipation.set(participation);
    this.loanRepaymentLeg.set(leg);
    this.loanRepaymentForm.set({ amount: leg.repayment?.nextDueAmount ?? 0, externalPaymentDate: new Date().toISOString().split('T')[0], externalReference: '', proofFile: null });
    this.loanRepaymentModalOpen.set(true);
  }

  closeLoanRepaymentDeclaration(): void {
    if (this.loanRepaymentSubmitting()) return;
    this.loanRepaymentModalOpen.set(false);
    this.loanRepaymentParticipation.set(null);
    this.loanRepaymentLeg.set(null);
  }

  setLoanRepaymentField(field: 'amount' | 'externalPaymentDate' | 'externalReference', value: string | number): void {
    this.loanRepaymentForm.update(form => ({ ...form, [field]: value }));
  }

  setLoanRepaymentProof(file: File | null): void {
    this.loanRepaymentForm.update(form => ({ ...form, proofFile: file }));
  }

  async submitLoanRepaymentDeclaration(): Promise<void> {
    const opportunityId = this.opportunityId();
    const leg = this.loanRepaymentLeg();
    const form = this.loanRepaymentForm();
    if (!opportunityId || !leg?.loanObligationId || !form.amount || !form.externalPaymentDate || this.loanRepaymentSubmitting()) return;
    try {
      this.loanRepaymentSubmitting.set(true);
      this.actionError.set(null);
      await this.opportunityService.createLoanRepaymentDeclaration(opportunityId, leg.loanObligationId, {
        amount: Number(form.amount),
        currency: leg.currency || this.loanRepaymentParticipation()?.fundingCurrency || '',
        externalPaymentDate: form.externalPaymentDate,
        externalReference: form.externalReference || undefined,
        proofFile: form.proofFile
      });
      this.actionSuccess.set(this.t('opportunityRoom.loanRepayment.declared'));
      this.closeLoanRepaymentDeclaration();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.loanRepayment.declareFailed'));
    } finally {
      this.loanRepaymentSubmitting.set(false);
    }
  }

  canDecideLoanRepayment(record: LoanRepaymentRecord): boolean {
    return this.participantContext().isAdmin !== true
      && this.participantContext().isApprovedParticipant === true
      && !this.isFounder()
      && record.status === 'PendingConfirmation';
  }

  openLoanRepaymentDecision(record: LoanRepaymentRecord, type: 'confirm' | 'dispute'): void {
    this.loanRepaymentDecisionRecord.set(record);
    this.loanRepaymentDecisionType.set(type);
    this.loanRepaymentDecisionText.set('');
  }

  closeLoanRepaymentDecision(): void {
    if (this.loanRepaymentDecisionSubmitting()) return;
    this.loanRepaymentDecisionRecord.set(null);
    this.loanRepaymentDecisionText.set('');
  }

  async submitLoanRepaymentDecision(): Promise<void> {
    const record = this.loanRepaymentDecisionRecord();
    const text = this.loanRepaymentDecisionText().trim();
    if (!record || this.loanRepaymentDecisionSubmitting() || (this.loanRepaymentDecisionType() === 'dispute' && !text)) return;
    try {
      this.loanRepaymentDecisionSubmitting.set(true);
      this.actionError.set(null);
      if (this.loanRepaymentDecisionType() === 'confirm') await this.opportunityService.confirmLoanRepayment(record.id, text || undefined);
      else await this.opportunityService.disputeLoanRepayment(record.id, text);
      this.actionSuccess.set(this.t(this.loanRepaymentDecisionType() === 'confirm' ? 'opportunityRoom.loanRepayment.confirmed' : 'opportunityRoom.loanRepayment.disputed'));
      this.closeLoanRepaymentDecision();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.loanRepayment.decisionFailed'));
    } finally {
      this.loanRepaymentDecisionSubmitting.set(false);
    }
  }

  async downloadLoanRepaymentProof(record: LoanRepaymentRecord): Promise<void> {
    try {
      const blob = await this.opportunityService.downloadLoanRepaymentProof(record.id);
      this.saveBlob(blob, record.proofFileName || 'loan-repayment-proof');
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Unable to download repayment proof.');
    }
  }

  canDeclareProfitSharingDistribution(leg: ParticipationLeg, period: ProfitSharingReportingPeriod): boolean {
    const remaining = Number(period.distributionOutstanding ?? period.investorEntitlement ?? 0) - Number(period.pendingConfirmation ?? 0);
    return this.isFounder() && this.participantContext().isAdmin !== true
      && leg.profitSharingObligationStatus === 'Active'
      && !!leg.profitSharingObligationId
      && Number(period.investorEntitlement ?? 0) > 0
      && remaining > 0
      && period.status !== 'Distributed';
  }

  openProfitSharingDistribution(participation: OpportunityRoomParticipation, leg: ParticipationLeg, period: ProfitSharingReportingPeriod): void {
    if (!this.canDeclareProfitSharingDistribution(leg, period)) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.profitSharingDistributionParticipation.set(participation);
    this.profitSharingDistributionLeg.set(leg);
    this.profitSharingDistributionPeriod.set(period);
    this.profitSharingDistributionForm.set({ amount: Math.max(0, Number(period.distributionOutstanding ?? period.investorEntitlement ?? 0) - Number(period.pendingConfirmation ?? 0)), externalReference: '', notes: '', evidenceFile: null });
    this.profitSharingDistributionModalOpen.set(true);
  }

  closeProfitSharingDistribution(): void {
    if (this.profitSharingDistributionSubmitting()) return;
    this.profitSharingDistributionModalOpen.set(false);
    this.profitSharingDistributionParticipation.set(null);
    this.profitSharingDistributionLeg.set(null);
    this.profitSharingDistributionPeriod.set(null);
  }

  setProfitSharingDistributionField(field: 'amount' | 'externalReference' | 'notes', value: string | number): void {
    this.profitSharingDistributionForm.update(form => ({ ...form, [field]: value }));
  }

  setProfitSharingDistributionEvidence(file: File | null): void {
    this.profitSharingDistributionForm.update(form => ({ ...form, evidenceFile: file }));
  }

  async submitProfitSharingDistribution(): Promise<void> {
    const opportunityId = this.opportunityId();
    const leg = this.profitSharingDistributionLeg();
    const period = this.profitSharingDistributionPeriod();
    const form = this.profitSharingDistributionForm();
    if (!opportunityId || !leg?.profitSharingObligationId || !period?.id || !form.amount || this.profitSharingDistributionSubmitting()) return;
    try {
      this.profitSharingDistributionSubmitting.set(true);
      this.actionError.set(null);
      await this.opportunityService.createProfitSharingDistribution(opportunityId, leg.profitSharingObligationId, period.id, {
        declaredAmount: Number(form.amount),
        currency: leg.currency || this.profitSharingDistributionParticipation()?.fundingCurrency || '',
        externalReference: form.externalReference || undefined,
        notes: form.notes || undefined,
        evidenceFile: form.evidenceFile
      });
      this.actionSuccess.set(this.t('opportunityRoom.profitSharing.distributionDeclared'));
      this.closeProfitSharingDistribution();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.profitSharing.distributionFailed'));
    } finally {
      this.profitSharingDistributionSubmitting.set(false);
    }
  }

  canDecideProfitSharingDistribution(declaration: ProfitSharingDistributionDeclaration): boolean {
    return !this.isFounder() && this.participantContext().isAdmin !== true
      && this.participantContext().isApprovedParticipant === true
      && declaration.status === 'PendingConfirmation';
  }

  openProfitSharingDistributionDecision(declaration: ProfitSharingDistributionDeclaration, type: 'confirm' | 'dispute'): void {
    if (!this.canDecideProfitSharingDistribution(declaration)) return;
    this.profitSharingDistributionDecision.set(declaration);
    this.profitSharingDistributionDecisionType.set(type);
    this.profitSharingDistributionDecisionText.set('');
  }

  closeProfitSharingDistributionDecision(): void {
    if (this.profitSharingDistributionDecisionSubmitting()) return;
    this.profitSharingDistributionDecision.set(null);
    this.profitSharingDistributionDecisionText.set('');
  }

  async submitProfitSharingDistributionDecision(): Promise<void> {
    const declaration = this.profitSharingDistributionDecision();
    const text = this.profitSharingDistributionDecisionText().trim();
    if (!declaration || this.profitSharingDistributionDecisionSubmitting() || (this.profitSharingDistributionDecisionType() === 'dispute' && !text)) return;
    try {
      this.profitSharingDistributionDecisionSubmitting.set(true);
      this.actionError.set(null);
      if (this.profitSharingDistributionDecisionType() === 'confirm') await this.opportunityService.confirmProfitSharingDistribution(declaration.id, text || undefined);
      else await this.opportunityService.disputeProfitSharingDistribution(declaration.id, text);
      this.actionSuccess.set(this.t(this.profitSharingDistributionDecisionType() === 'confirm' ? 'opportunityRoom.profitSharing.distributionConfirmed' : 'opportunityRoom.profitSharing.distributionDisputed'));
      this.closeProfitSharingDistributionDecision();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.profitSharing.distributionDecisionFailed'));
    } finally {
      this.profitSharingDistributionDecisionSubmitting.set(false);
    }
  }

  openProjectReport(): void {
    if (!this.canReportProject()) return;
    this.reportReason.set('Spam');
    this.reportDescription.set('');
    this.reportError.set(null);
    this.reportSuccess.set(false);
    this.reportModalOpen.set(true);
  }

  closeReportModal(): void {
    if (this.reportSubmitting()) return;
    this.reportModalOpen.set(false);
    this.reportError.set(null);
    this.reportSuccess.set(false);
  }

  setReportReason(reason: string): void {
    this.reportReason.set(reason as ReportReasonCode);
  }

  setReportDescription(description: string): void {
    this.reportDescription.set(description);
  }

  async loadPayments(): Promise<void> {
    const id = this.opportunityId();
    if (!id || this.paymentsLoading()) return;
    try {
      this.paymentsLoading.set(true);
      this.paymentsError.set(null);
      this.payments.set(await this.opportunityService.getOpportunityPayments(id));
      if (!this.selectedPaymentInvestor() && this.payments().length > 0) {
        await this.openPaymentInvestor(this.payments()[0]);
      }
    } catch (error: any) {
      this.payments.set([]);
      this.paymentsError.set(error?.error?.message || error?.message || 'Failed to load payments.');
    } finally {
      this.paymentsLoading.set(false);
    }
  }

  async openPaymentInvestor(summary: InvestorPaymentSummary): Promise<void> {
    const id = this.opportunityId();
    if (!id || this.selectedPaymentInvestorLoading()) return;
    try {
      this.selectedPaymentInvestorLoading.set(true);
      this.selectedPaymentInvestorError.set(null);
      this.selectedPaymentInvestor.set(await this.opportunityService.getInvestorPaymentDetails(id, summary.investorId));
    } catch (error: any) {
      this.selectedPaymentInvestorError.set(error?.error?.message || error?.message || 'Failed to load investor payment details.');
    } finally {
      this.selectedPaymentInvestorLoading.set(false);
    }
  }

  paymentStatusLabel(status: string): string {
    return this.t(`opportunityRoom.payments.status.${status}`);
  }

  openRecordPaymentModal(): void {
    const detail = this.selectedPaymentInvestor();
    if (!detail || detail.participations.length === 0) return;
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.recordPaymentForm.set({
      participationRequestId: detail.participations[0].participationRequestId,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    });
    this.recordPaymentModalOpen.set(true);
  }

  closeRecordPaymentModal(): void {
    if (this.isSubmittingAction()) return;
    this.recordPaymentModalOpen.set(false);
    this.actionError.set(null);
  }

  setRecordPaymentField(field: string, value: any): void {
    this.recordPaymentForm.update(f => ({ ...f, [field]: value }));
  }

  async submitRecordPayment(): Promise<void> {
    const id = this.opportunityId();
    const form = this.recordPaymentForm();
    if (!id || !form.participationRequestId || form.amount <= 0 || !form.paymentDate) {
      this.actionError.set('Amount and payment date are required.');
      return;
    }
    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      await this.opportunityService.recordPayment(id, {
        participationRequestId: form.participationRequestId,
        amount: form.amount,
        paymentDate: form.paymentDate,
        reference: form.reference || undefined,
        notes: form.notes || undefined
      });
      this.actionSuccess.set(this.t('opportunityRoom.payments.recordSuccess'));
      this.recordPaymentModalOpen.set(false);
      await this.loadPayments();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to record payment.');
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  openReversePaymentModal(txn: PaymentTransactionDetail): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.reversePaymentForm.set({ paymentTransactionId: txn.id, reason: '' });
    this.reversePaymentModalOpen.set(true);
  }

  closeReversePaymentModal(): void {
    if (this.isSubmittingAction()) return;
    this.reversePaymentModalOpen.set(false);
    this.actionError.set(null);
  }

  setReverseReason(value: string): void {
    this.reversePaymentForm.update(f => ({ ...f, reason: value }));
  }

  async submitReversePayment(): Promise<void> {
    const id = this.opportunityId();
    const form = this.reversePaymentForm();
    if (!id || !form.paymentTransactionId || !form.reason.trim()) {
      this.actionError.set('Reversal reason is required.');
      return;
    }
    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      await this.opportunityService.reversePayment(id, {
        paymentTransactionId: form.paymentTransactionId,
        reason: form.reason.trim()
      });
      this.actionSuccess.set(this.t('opportunityRoom.payments.reverseSuccess'));
      this.reversePaymentModalOpen.set(false);
      await this.loadPayments();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to reverse payment.');
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  async openConfirmForInvestor(summary: InvestorPaymentSummary): Promise<void> {
    await this.openPaymentInvestor(summary);
    const detail = this.selectedPaymentInvestor();
    if (!detail || detail.participations.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    let earliestUnpaid: { reqId: number; amount: number; installNo: number; dueDate: string; expectedTotal: number; alreadyPaid: number } | null = null;
    for (const part of detail.participations) {
      for (const pmt of part.payments) {
        if (pmt.status !== 'Paid' && pmt.status !== 'Cancelled' && (pmt.remainingAmount ?? 0) > 0) {
          if (!earliestUnpaid || new Date(pmt.dueDate) < new Date(earliestUnpaid.dueDate)) {
            earliestUnpaid = {
              reqId: part.participationRequestId,
              amount: pmt.remainingAmount ?? pmt.expectedTotal,
              installNo: pmt.dueDate ? parseInt(pmt.dueDate.split('-')[2]?.replace(/^0/, '') ?? '1', 10) || 1 : 1,
              dueDate: pmt.dueDate,
              expectedTotal: pmt.expectedTotal,
              alreadyPaid: pmt.actualPaid ?? 0
            };
          }
        }
      }
    }
    if (!earliestUnpaid) return;
    this.recordPaymentForm.set({
      participationRequestId: earliestUnpaid.reqId,
      amount: earliestUnpaid.amount,
      paymentDate: today,
      reference: '',
      notes: ''
    });
    this.recordPaymentInvestorName.set(summary.displayName);
    this.recordPaymentInstallmentInfo.set(
      `${this.t('opportunityRoom.payments.scheduled')}: ${this.money(earliestUnpaid.expectedTotal)}, ${this.t('opportunityRoom.payments.paid')}: ${this.money(earliestUnpaid.alreadyPaid)}, ${this.t('opportunityRoom.payments.remaining')}: ${this.money(earliestUnpaid.amount)} — ${this.t('opportunityRoom.payments.dueDate')}: ${new Date(earliestUnpaid.dueDate).toLocaleDateString()}`
    );
    this.recordPaymentModalOpen.set(true);
  }

  openRecordPaymentForSelectedInvestor(): void {
    const detail = this.selectedPaymentInvestor();
    if (!detail) return;
    const summary = this.payments().find(p => p.investorId === detail.investorId);
    if (summary) {
      void this.openConfirmForInvestor(summary);
    }
  }

  async openBulkConfirmModal(): Promise<void> {
    const id = this.opportunityId();
    if (!id || this.bulkConfirmPreviewLoading()) return;
    try {
      this.bulkConfirmPreviewLoading.set(true);
      this.bulkConfirmPreview.set(null);
      this.bulkConfirmResult.set(null);
      const preview = await this.opportunityService.getMonthlyUnpaidPreview(id);
      this.bulkConfirmPreview.set(preview);
      this.bulkConfirmModalOpen.set(true);
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to load monthly unpaid preview.');
    } finally {
      this.bulkConfirmPreviewLoading.set(false);
    }
  }

  closeBulkConfirmModal(): void {
    if (this.bulkConfirmSubmitting()) return;
    this.bulkConfirmModalOpen.set(false);
    this.bulkConfirmPreview.set(null);
    this.bulkConfirmResult.set(null);
    this.actionError.set(null);
  }

  async submitBulkConfirm(): Promise<void> {
    const id = this.opportunityId();
    if (!id || this.bulkConfirmSubmitting() || !this.bulkConfirmPreview()) return;
    try {
      this.bulkConfirmSubmitting.set(true);
      this.actionError.set(null);
      const result = await this.opportunityService.bulkConfirmMonthlyPayments(id, {});
      this.bulkConfirmResult.set(result);
      this.actionSuccess.set(this.t('opportunityRoom.payments.bulkConfirmSuccess'));
      this.bulkConfirmModalOpen.set(false);
      await this.loadPayments();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || 'Failed to confirm monthly payments.');
    } finally {
      this.bulkConfirmSubmitting.set(false);
    }
  }

  paymentStatusClass(status: string): string {
    if (status === 'Overdue') return 'investa-badge-danger';
    if (status === 'Outstanding') return 'investa-badge-warning';
    if (status === 'Paid') return 'investa-badge-success';
    if (status === 'NoPaymentSchedule') return 'investa-badge-muted';
    return '';
  }

  reportReasonLabel(reason: ReportReasonCode): string {
    return this.t(`reports.reasons.${reason}`);
  }

  async submitProjectReport(): Promise<void> {
    const opportunityId = this.opportunityId();
    if (!opportunityId || this.reportSubmitting() || !this.canReportProject()) return;

    try {
      this.reportSubmitting.set(true);
      this.reportError.set(null);
      await this.reportService.createReport({
        targetType: 'Opportunity',
        targetId: opportunityId,
        reasonCode: this.reportReason(),
        description: this.reportDescription().trim() || null
      });
      this.reportSuccess.set(true);
    } catch (error: any) {
      this.reportError.set(this.reportErrorMessage(error));
    } finally {
      this.reportSubmitting.set(false);
    }
  }

  async loadContracts(force = false): Promise<void> {
    const opportunityId = this.opportunityId();
    if (!opportunityId || this.contractsLoading() || (this.contractsLoaded() && !force)) return;

    try {
      this.contractsLoading.set(true);
      this.contractsError.set(null);
      const contracts = await this.contractService.getOpportunityContracts(opportunityId);
      this.contracts.set(contracts);
      this.contractsLoaded.set(true);
      if (!this.selectedContract() && contracts.length > 0) {
        await this.openContractDetails(contracts[0]);
      }
    } catch (error: any) {
      this.contracts.set([]);
      this.contractsLoaded.set(true);
      this.contractsError.set(this.contractErrorMessage(error));
    } finally {
      this.contractsLoading.set(false);
    }
  }

  private resetContractState(): void {
    this.contracts.set([]);
    this.contractsLoaded.set(false);
    this.contractsError.set(null);
    this.selectedContract.set(null);
    this.selectedVersion.set(null);
    this.contractDetailsError.set(null);
  }

  async openContractDetails(contract: InvestmentContractSummary): Promise<void> {
    if (this.contractDetailsLoading()) return;
    try {
      this.contractDetailsLoading.set(true);
      this.contractDetailsError.set(null);
      const detail = await this.contractService.getContract(contract.contractId);
      this.selectedContract.set(detail);
      this.selectedVersion.set(detail.currentVersion);
    } catch (error: any) {
      this.contractDetailsError.set(this.contractErrorMessage(error));
    } finally {
      this.contractDetailsLoading.set(false);
    }
  }

  async openContractVersion(version: InvestmentContractVersionSummary): Promise<void> {
    const detail = this.selectedContract();
    if (!detail || this.contractDetailsLoading()) return;
    try {
      this.contractDetailsLoading.set(true);
      this.contractDetailsError.set(null);
      this.selectedVersion.set(await this.contractService.getVersion(detail.contract.contractId, version.versionNumber));
    } catch (error: any) {
      this.contractDetailsError.set(this.contractErrorMessage(error));
    } finally {
      this.contractDetailsLoading.set(false);
    }
  }

  async openContractPreview(version: InvestmentContractVersion | InvestmentContractVersionSummary | null = this.selectedVersion()): Promise<void> {
    const detail = this.selectedContract();
    if (!detail || !version) return;
    this.previewModalOpen.set(true);
    this.previewLoading.set(true);
    this.previewError.set(null);
    this.previewHtml.set(null);
    try {
      const html = await this.contractService.getPreviewHtml(detail.contract.contractId, version.versionNumber);
      this.previewHtml.set(this.sanitizeContractHtml(html));
    } catch (error: any) {
      this.previewError.set(this.contractErrorMessage(error));
    } finally {
      this.previewLoading.set(false);
    }
  }

  closeContractPreview(): void {
    this.previewModalOpen.set(false);
    this.previewHtml.set(null);
    this.previewError.set(null);
  }

  printContractPreview(): void {
    const html = this.previewHtml();
    if (!html) return;
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);
    frame.contentDocument?.open();
    frame.contentDocument?.write(html);
    frame.contentDocument?.close();
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }

  async downloadContractPdf(version: InvestmentContractVersion | InvestmentContractVersionSummary | null = this.selectedVersion()): Promise<void> {
    const detail = this.selectedContract();
    if (!detail || !version) return;
    const key = this.contractVersionKey(detail.contract.contractId, version.versionNumber);
    try {
      this.pdfDownloading.set(key);
      this.previewError.set(null);
      const file = await this.contractService.downloadPdf(detail.contract.contractId, version.versionNumber);
      this.saveBlob(file.blob, file.fileName);
      this.pdfStatusOverrides.update(items => ({ ...items, [key]: 2 }));
    } catch (error: any) {
      this.pdfStatusOverrides.update(items => ({ ...items, [key]: 3 }));
      this.previewError.set(this.contractErrorMessage(error));
    } finally {
      this.pdfDownloading.set(null);
    }
  }

  async emailContract(version: InvestmentContractVersion | InvestmentContractVersionSummary | null = this.selectedVersion()): Promise<void> {
    const detail = this.selectedContract();
    if (!detail || !version) return;
    const key = this.contractVersionKey(detail.contract.contractId, version.versionNumber);
    if (this.contractEmailing() === key) return;
    try {
      this.contractEmailing.set(key);
      this.actionError.set(null);
      this.actionSuccess.set(null);
      await this.contractService.emailContract(
        detail.contract.contractId,
        version.versionNumber,
        this.languageService.language()
      );
      this.actionSuccess.set(this.t('contracts.email.success'));
    } catch (error: any) {
      this.actionError.set(this.contractErrorMessage(error));
    } finally {
      this.contractEmailing.set(null);
    }
  }

  openMilestoneModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.milestoneModalOpen.set(true);
  }

  closeActionModals(): void {
    if (this.isSubmittingAction()) return;
    this.documentModalOpen.set(false);
    this.milestoneModalOpen.set(false);
    this.actionError.set(null);
  }

  setMilestoneTitle(title: string): void {
    this.milestoneForm.update(form => ({ ...form, title }));
  }

  setMilestoneDescription(description: string): void {
    this.milestoneForm.update(form => ({ ...form, description }));
  }

  setMilestoneIsPublic(isPublic: boolean): void {
    this.milestoneForm.update(form => ({ ...form, isPublic }));
  }

  setDocumentTitle(title: string): void {
    this.documentForm.update(form => ({ ...form, title }));
  }

  setDocumentVisibility(visibility: 'Public' | 'Private'): void {
    this.documentForm.update(form => ({ ...form, visibility }));
  }

  setDocumentPurpose(purpose: string): void {
    this.documentForm.update(form => ({ ...form, purpose }));
  }

  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDocumentFile.set(input.files?.[0] ?? null);
  }

  async submitMilestone(): Promise<void> {
    const form = this.milestoneForm();
    if (!form.title.trim()) {
      this.actionError.set(this.t('opportunityRoom.validation.milestoneTitleRequired'));
      return;
    }
    await this.createEvent('Milestone', form.title, form.description, form.isPublic, this.t('opportunityRoom.toasts.milestoneAdded'), () => {
      this.milestoneForm.set({ title: '', description: '', isPublic: true });
      this.milestoneModalOpen.set(false);
      this.activeTab.set('timeline');
    });
  }

  async submitDocument(): Promise<void> {
    const opportunityId = this.opportunityId();
    const file = this.selectedDocumentFile();
    const form = this.documentForm();
    if (!opportunityId || !file) {
      this.actionError.set(this.t('opportunityRoom.validation.documentFileRequired'));
      return;
    }

    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      const category = this.documentCategory(form.purpose, form.visibility);
      const uploaded = await this.fileStore.uploadFile(category, file, {
        purpose: form.purpose,
        visibility: form.visibility,
        isPublic: form.visibility === 'Public',
        projectId: this.projectContext()?.id ?? this.room()?.projectId ?? undefined,
        entityType: 'OpportunityDocument',
        entityId: opportunityId
      });
      await this.opportunityService.createDocument(opportunityId, {
        fileId: uploaded.fileId,
        fileKey: uploaded.fileKey,
        fileUrl: uploaded.url,
        title: form.title || uploaded.originalFileName || uploaded.fileName,
        fileName: uploaded.fileName,
        fileExtension: uploaded.extension || this.extensionFromName(uploaded.fileName),
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        category: uploaded.category,
        documentType: form.purpose,
        previewUrl: uploaded.previewUrl,
        thumbnailUrl: uploaded.thumbnailUrl,
        purpose: this.documentPurposeValue(form.purpose),
        visibility: this.documentVisibilityValue(form.visibility),
        searchTags: form.searchTags
      } as any);
      this.actionSuccess.set(this.t('opportunityRoom.toasts.documentAdded'));
      this.documentForm.set({ title: '', visibility: 'Private', purpose: 'PrivateDocument', category: 'OPPORTUNITYPRIVATEDOCUMENT', searchTags: '' });
      this.selectedDocumentFile.set(null);
      this.documentModalOpen.set(false);
      this.activeTab.set('documents');
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.toasts.documentAddFailed'));
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  title(): string {
    const overview = this.overview();
    return overview.title || overview.name || overview.businessName || this.t('opportunityRoom.title');
  }

  status(): string {
    const key = this.statusKey();
    return key ? this.t(key) : '-';
  }

  stage(): string {
    return this.overview().projectStage || this.overview().stage || '-';
  }

  legTypeLabel(type: string | number | null | undefined): string {
    const normalized = String(type ?? '').toLowerCase().replace(/[\s_-]/g, '');
    if (normalized === '1' || normalized.includes('equity')) return 'Equity';
    if (normalized === '2' || normalized.includes('loan')) return 'Loan';
    if (normalized === '3' || normalized.includes('profit')) return 'Profit Sharing';
    return String(type ?? 'Participation leg');
  }

  projectLogoUrl(): string {
    return this.fileStore.getPublicUrl(this.projectContext()?.logoUrl || '');
  }

  projectInitials(): string {
    const name = this.projectContext()?.displayName || this.room()?.projectDisplayName || '';
    return name.trim().slice(0, 2).toUpperCase() || 'P';
  }

  projectCategory(): string {
    const context = this.projectContext();
    const category = context?.category;
    const categoryId = context?.categoryId ?? category?.id;
    if (categoryId !== null && categoryId !== undefined) {
      const key = `investmentPreview.lookups.categories.${categoryId}`;
      const translated = this.t(key);
      if (translated !== key) return translated;
    }
    return category?.nameEn || category?.nameAr || context?.industry || '-';
  }

  projectStage(): string {
    const value = this.projectContext()?.projectStage;
    if (value === null || value === undefined || value === '') return '-';
    const label = this.stageService.label(value, this.languageService.language() === 'ar' ? 'ar' : 'en');
    return label || String(value);
  }

  projectCompany(): string {
    const context = this.projectContext();
    return context?.legalName || context?.displayName || '-';
  }

  projectDescription(): string {
    return this.projectContext()?.summary || this.projectContext()?.description || '-';
  }

  projectRoute(): Array<string | number> {
    return opportunityRoomProjectRoute(this.projectContext()?.id ?? this.room()?.projectId, this.isFounder());
  }

  paymentLegSummary(detail: InvestorPaymentDetail | null): string {
    if (!detail) return '-';
    const labels = (detail.participations ?? []).flatMap(item => (item.legs ?? []).map(leg => this.legTypeLabel(leg.legType)));
    return Array.from(new Set(labels)).join(' · ') || '-';
  }

  statusKey(): string {
    const status = String(this.overview().status ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    const keys: Record<string, string> = {
      '1': 'draft', draft: 'draft',
      '2': 'underReview', underreview: 'underReview',
      '3': 'rejected', rejected: 'rejected',
      '4': 'approved', approved: 'approved',
      '5': 'published', published: 'published',
      '6': 'funding', funding: 'funding',
      '7': 'fullyFunded', fullyfunded: 'fullyFunded',
      '8': 'inProgress', inprogress: 'inProgress',
      '9': 'completed', completed: 'completed',
      '10': 'archived', archived: 'archived'
    };
    const key = keys[status];
    return key ? `opportunityRoom.statuses.${key}` : '';
  }

  stageKey(): string {
    const stage = this.overview().projectStage || this.overview().stage || '';
    return stage ? `opportunity.stage.${stage.toLowerCase()}` : '';
  }

  fundingTarget(): number | null {
    return this.numberValue(this.overview().fundingTarget);
  }

  committedAmount(): number | null {
    return this.numberValue((this.overview() as any).committedAmount);
  }

  confirmedReceivedAmount(): number | null {
    return this.numberValue((this.overview() as any).confirmedReceivedAmount);
  }

  outstandingAmount(): number | null {
    return this.numberValue((this.overview() as any).outstandingAmount);
  }

  disputedAmount(): number | null {
    return this.numberValue((this.overview() as any).disputedAmount);
  }

  fundedAmount(): number | null {
    return this.numberValue(this.overview().fundedAmount);
  }

  remainingFundingAmount(): number | null {
    return this.numberValue(this.overview().remainingFundingAmount);
  }

  fundingProgress(): number | null {
    return calculateConfirmedFundingProgress(this.fundingTarget(), this.confirmedReceivedAmount());
  }

  fundingProgressBarWidth(): number {
    const progress = this.fundingProgress();
    if (progress === null) return 0;
    return Math.max(0, Math.min(100, progress));
  }

  founderSummary(): string {
    const overview = this.overview();
    const founder = overview.founder;
    if (overview.founderSummary) return overview.founderSummary;
    if (founder?.summary) return founder.summary;
    if (founder?.displayName || founder?.fullName || founder?.name) return founder.displayName || founder.fullName || founder.name || '';
    return '-';
  }

  founderProfileId(): string {
    const overview = this.overview();
    const id = overview.founderId ?? overview.founder?.userId ?? overview.founder?.id;
    const value = String(id ?? '').trim();
    return value === 'undefined' || value === 'null' ? '' : value;
  }

  roomRole(): string {
    const context = this.participantContext();
    if (context.isFounder) return this.t('opportunityRoom.role.founder');
    if (context.isApprovedParticipant) return this.t('opportunityRoom.role.approvedInvestor');
    const role = context.role || context.userRole || context.roomRole;
    if (!role) return '-';
    return role === 'ApprovedInvestor' ? this.t('opportunityRoom.role.approvedInvestor') : String(role);
  }

  roomRoleKey(): string {
    const context = this.participantContext();
    if (context.isFounder) return 'opportunityRoom.role.founder';
    if (context.isApprovedParticipant) return 'opportunityRoom.role.approvedInvestor';
    const role = context.role || context.userRole || context.roomRole;
    if (!role) return '';
    return role === 'ApprovedInvestor' ? 'opportunityRoom.role.approvedInvestor' : '';
  }

  permissionLabel(value: boolean | null | undefined): string {
    return value ? this.t('opportunityRoom.fallback.allowed') : this.t('opportunityRoom.fallback.notAllowed');
  }

  money(value: number | null | undefined, currency?: string | null): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    return this.currencyService.format(value, currency ?? this.overview()?.currency);
  }

  fileSize(bytes: number | null | undefined): string {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileTitle(item: OpportunityDocument | OpportunityMedia): string {
    const file = item as OpportunityDocument & OpportunityMedia;
    return file.title || file.name || file.originalFileName || file.fileName || this.t('opportunityRoom.fallback.file');
  }

  extension(item: OpportunityDocument | OpportunityMedia): string {
    return (item.fileExtension || this.extensionFromName(item.fileName) || 'FILE').replace('.', '').toUpperCase();
  }

  visibility(item: OpportunityDocument | OpportunityMedia): string {
    if ('visibility' in item && item.visibility) {
      const vis = String(item.visibility);
      if (vis === 'Public') return this.t('opportunityRoom.badges.public');
      if (vis === 'Private') return this.t('opportunityRoom.badges.private');
      return vis;
    }
    if (item.isPublic === true) return this.t('opportunityRoom.badges.public');
    if (item.isPublic === false) return this.t('opportunityRoom.badges.private');
    return '-';
  }

  uploadedDate(item: any): string {
    const raw = item.uploadedAt || item.createdAt || item.date;
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  previewUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.previewUrl) return this.fileStore.getPublicUrl(item.previewUrl);
    if (item.fileUrl) return this.fileStore.getPublicUrl(item.fileUrl);
    return item.category && item.fileName ? this.fileStore.getPreviewUrl(item.category, item.fileName) : '';
  }

  downloadUrl(item: OpportunityMedia | OpportunityDocument): string {
    if (item.category && item.fileName) return this.fileStore.getDownloadUrl(item.category, item.fileName);
    return item.fileUrl || '';
  }

  contractListSubtitle(): string {
    return this.isFounder() ? this.t('contracts.room.founderListHelper') : this.t('contracts.room.investorListHelper');
  }

  contractStatusLabel(status: unknown): string {
    return this.contractEnumLabel('contracts.status', status);
  }

  versionTypeLabel(type: unknown): string {
    return this.contractEnumLabel('contracts.versionTypes', type);
  }

  versionStatusLabel(status: unknown): string {
    return this.contractEnumLabel('contracts.versionStatus', status);
  }

  pdfStatusLabel(status: unknown): string {
    return this.contractEnumLabel('contracts.pdfStatus', status);
  }

  currentPdfStatus(version: InvestmentContractVersion | InvestmentContractVersionSummary | null): PdfGenerationStatus {
    const detail = this.selectedContract();
    if (!detail || !version) return 0;
    const key = this.contractVersionKey(detail.contract.contractId, version.versionNumber);
    return this.pdfStatusOverrides()[key] ?? ('pdfStatus' in version ? version.pdfStatus : 0);
  }

  contractVersionKey(contractId: number | string, versionNumber: number | string): string {
    return `${contractId}:${versionNumber}`;
  }

  versionBadgeLabel(version: InvestmentContractVersionSummary): string {
    return version.versionNumber === this.selectedContract()?.contract.currentVersionNumber
      ? this.t('contracts.badges.current')
      : this.t('contracts.badges.previous');
  }

  contractDate(raw: string | null | undefined): string {
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  selectedTermsSummary(): Array<{ label: string; value: string }> {
    return this.termsSummary(this.selectedVersion()?.termsSnapshotJson);
  }

  selectedChangesSummary(): string {
    const changes = this.parseJsonRecord(this.selectedVersion()?.changesSnapshotJson);
    if (!changes) return this.t('contracts.empty.noChangesSummary');
    const lines = Object.entries(changes)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${this.humanizeKey(key)}: ${this.displayJsonValue(value)}`);
    return lines.length ? lines.join('\n') : this.t('contracts.empty.noChangesSummary');
  }

  sourceParticipationReference(): string {
    const direct = this.selectedContract()?.contract.participationRequestId;
    if (direct !== null && direct !== undefined) return String(direct);
    return this.readTermsValue(['sourceParticipationRequestId', 'SourceParticipationRequestId', 'participationRequestId', 'ParticipationRequestId']);
  }

  acceptedOfferReference(): string {
    const contract = this.selectedContract()?.contract;
    if (contract?.acceptedOfferId !== null && contract?.acceptedOfferId !== undefined) {
      return contract.acceptedOfferVersionNumber ? `${contract.acceptedOfferId} · V${contract.acceptedOfferVersionNumber}` : String(contract.acceptedOfferId);
    }
    return this.readTermsValue(['acceptedOfferId', 'AcceptedOfferId', 'acceptedOfferReference', 'AcceptedOfferReference']);
  }

  effectiveDate(): string {
    return this.contractDate(this.selectedVersion()?.activatedAt || this.selectedVersion()?.createdAt);
  }

  isPdfDownloading(version: InvestmentContractVersion | InvestmentContractVersionSummary | null): boolean {
    const detail = this.selectedContract();
    return !!detail && !!version && this.pdfDownloading() === this.contractVersionKey(detail.contract.contractId, version.versionNumber);
  }

  isContractEmailing(version: InvestmentContractVersion | InvestmentContractVersionSummary | null): boolean {
    const detail = this.selectedContract();
    return !!detail && !!version && this.contractEmailing() === this.contractVersionKey(detail.contract.contractId, version.versionNumber);
  }

  mediaUrl(item: OpportunityMedia): string {
    return this.fileStore.getPublicUrl(item.thumbnailUrl || item.previewUrl || item.fileUrl || '');
  }

  isImage(item: OpportunityMedia): boolean {
    return (item.mimeType || '').toLowerCase().startsWith('image') || /\.(png|jpe?g|webp|gif)$/i.test(item.fileName || item.fileUrl || '');
  }

  isVideo(item: OpportunityMedia): boolean {
    return (item.mimeType || '').toLowerCase().startsWith('video') || /\.(mp4|mov|webm)$/i.test(item.fileName || item.fileUrl || '');
  }

  eventTitle(item: OpportunityEvent): string {
    return this.timelineText(item.titleKey || item.title, item.metadata)
      || this.eventType(item)
      || this.t('opportunityRoom.fallback.projectUpdate');
  }

  eventDescription(item: OpportunityEvent): string {
    return this.timelineText(item.descriptionKey || item.description, item.metadata) || '-';
  }

  eventActor(item: OpportunityEvent): string {
    return this.t(`projectActivity.actor.${item.actorType || 'System'}`);
  }

  eventType(item: OpportunityEvent): string {
    return item.eventType || item.type || this.t('opportunityRoom.fallback.update');
  }

  eventDate(item: OpportunityEvent): string {
    const raw = item.occurredAt || item.eventDate || item.date || item.createdAt;
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  milestoneTitle(item: OpportunityMilestone): string {
    return item.title || this.t('opportunityRoom.milestones.untitled');
  }

  milestoneDescription(item: OpportunityMilestone): string {
    return item.description || this.t('opportunityRoom.milestones.noDescription');
  }

  milestoneDate(item: OpportunityMilestone): string {
    const raw = item.completedAt || item.targetDate || item.createdAt;
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString();
  }

  activityKindLabel(kind: ActivityFeedItem['kind']): string {
    if (kind === 'milestone') return this.t('opportunityRoom.fallback.milestoneUpdate');
    if (kind === 'document') return this.t('opportunityRoom.fallback.publicDocument');
    return this.t('opportunityRoom.fallback.publicMedia');
  }

  activityKindClass(kind: ActivityFeedItem['kind']): string {
    if (kind === 'milestone') return 'investa-badge-accent';
    if (kind === 'document') return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-200';
    return '';
  }

  participationAccessText(): string {
    const context = this.participantContext();
    if (context.isApprovedParticipant || context.canAccessProjectRoom) {
      return this.t('opportunityRoom.participationSummary.activeAccess');
    }
    return this.t('opportunityRoom.participationSummary.limitedAccess');
  }

  investmentTermsSummary(): string {
    const overview = this.overview();
    if (overview.publicInvestmentTermsSummary) return overview.publicInvestmentTermsSummary;
    if (overview.expectedReturnSummary) return overview.expectedReturnSummary;
    return this.t('opportunityRoom.investmentTerms.fallback');
  }

  latestPublicUpdateSummary(): string {
    const overview = this.overview();
    return overview.latestPublicUpdate || this.t('opportunityRoom.publicUpdate.empty');
  }

  private flattenLibrary<T>(library: T[] | Record<string, T[]> | null | undefined): T[] {
    if (!library) return [];
    if (Array.isArray(library)) {
      return library.flatMap((item: any) => Array.isArray(item?.items) ? item.items : [item]).filter(Boolean);
    }
    return Object.values(library).flat().filter(Boolean);
  }

  private sortEventsByDateDesc(items: OpportunityEvent[]): OpportunityEvent[] {
    return [...items].sort((a, b) => this.dateValueFromRaw(b.occurredAt || b.eventDate || b.date || b.createdAt) - this.dateValueFromRaw(a.occurredAt || a.eventDate || a.date || a.createdAt));
  }

  private sortMilestonesByDateDesc(items: OpportunityMilestone[]): OpportunityMilestone[] {
    return [...items].sort((a, b) => this.milestoneDateValue(b) - this.milestoneDateValue(a));
  }

  private sortByDateDesc<T>(items: T[], getRawDate: (item: T) => unknown): T[] {
    return [...items].sort((a, b) => this.dateValueFromRaw(getRawDate(b)) - this.dateValueFromRaw(getRawDate(a)));
  }

  private activityFeed(): ActivityFeedItem[] {
    const milestones: ActivityFeedItem[] = this.timeline().map((item, index) => ({
      trackKey: `milestone:${item.id ?? item.occurredAt ?? item.createdAt ?? 'na'}:${index}`,
      kind: 'milestone',
      title: this.eventTitle(item),
      detail: this.eventDescription(item),
      dateText: this.eventDate(item),
      dateValue: this.dateValueFromRaw(item.occurredAt || item.eventDate || item.date || item.createdAt)
    }));

    const documents: ActivityFeedItem[] = this.documents().map((item, index) => ({
      trackKey: `document:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
      kind: 'document',
      title: this.fileTitle(item),
      detail: `${this.visibility(item)} document`,
      dateText: this.uploadedDate(item),
      dateValue: this.dateValueFromRaw(this.documentRawDate(item))
    }));

    const media: ActivityFeedItem[] = this.media().map((item, index) => ({
      trackKey: `media:${item.id ?? item.fileId ?? item.fileKey ?? item.fileName ?? 'na'}:${index}`,
      kind: 'media',
      title: this.fileTitle(item),
      detail: `${this.visibility(item)} media`,
      dateText: this.uploadedDate(item),
      dateValue: this.dateValueFromRaw(this.mediaRawDate(item))
    }));

    return [...milestones, ...documents, ...media].filter(item => item.dateValue > 0);
  }

  private milestoneToEvent(milestone: OpportunityMilestone): OpportunityEvent {
    return {
      id: milestone.milestoneId ?? milestone.id,
      title: milestone.title,
      description: milestone.description,
      eventDate: milestone.completedAt ?? milestone.targetDate ?? milestone.createdAt,
      createdAt: milestone.createdAt,
      eventType: 'Milestone',
      type: milestone.status ?? 'Milestone',
      isPublic: true
    };
  }

  private milestoneDateValue(milestone: OpportunityMilestone): number {
    return this.dateValueFromRaw(milestone.completedAt || milestone.targetDate || milestone.createdAt);
  }

  private dateValueFromRaw(raw: unknown): number {
    if (!raw) return 0;
    const date = new Date(String(raw));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  private documentRawDate(item: OpportunityDocument): unknown {
    const source = item as OpportunityDocument & { uploadedAt?: unknown; createdAt?: unknown; date?: unknown };
    return source.uploadedAt || source.createdAt || source.date;
  }

  private mediaRawDate(item: OpportunityMedia): unknown {
    const source = item as OpportunityMedia & { uploadedAt?: unknown; createdAt?: unknown; date?: unknown };
    return source.uploadedAt || source.createdAt || source.date;
  }

  private async createEvent(eventType: string, title: string, description: string, isPublic: boolean, successMessage: string, onSuccess: () => void): Promise<void> {
    const opportunityId = this.opportunityId();
    if (!opportunityId) return;
    try {
      this.isSubmittingAction.set(true);
      this.actionError.set(null);
      await this.opportunityService.createEvent(opportunityId, {
        eventType,
        title: title.trim(),
        description: description?.trim() || null,
        isPublic
      });
      this.actionSuccess.set(successMessage);
      onSuccess();
      await this.refreshRoomData();
    } catch (error: any) {
      this.actionError.set(error?.error?.message || error?.message || this.t('opportunityRoom.toasts.saveFailed'));
    } finally {
      this.isSubmittingAction.set(false);
    }
  }

  private documentCategory(purpose: string, visibility: 'Public' | 'Private'): string {
    if (purpose === 'PublicDocument' || visibility === 'Public') return 'OPPORTUNITYPUBLICDOCUMENT';
    if (purpose === 'FinancialReport') return 'FINANCIALREPORT';
    if (purpose === 'Contract') return 'CONTRACT';
    if (purpose === 'Legal') return 'LEGAL';
    return 'OPPORTUNITYPRIVATEDOCUMENT';
  }

  private documentPurposeValue(purpose: string): number {
    const values: Record<string, number> = {
      Cover: 1,
      Gallery: 2,
      PitchVideo: 3,
      PublicDocument: 4,
      PrivateDocument: 5,
      FinancialReport: 6,
      Contract: 7,
      Legal: 8,
      InternalFile: 9,
      ProjectUpdateMedia: 10,
      General: 11
    };
    return values[purpose] ?? values.PrivateDocument;
  }

  private documentVisibilityValue(visibility: 'Public' | 'Private'): number {
    return visibility === 'Public' ? 1 : 2;
  }

  private async refreshRoomData(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.room.set(await this.opportunityService.getOpportunityRoom(id));
  }

  private handleRealtimeEvent(event: RealtimeEvent): void {
    if (event.type !== 'OpportunityRoomChanged' && event.type !== 'NotificationCreated') return;
    const currentOpportunityId = String(this.opportunityId() ?? '');
    const eventOpportunityId = String(event.data?.['opportunityId'] ?? '');
    if (!currentOpportunityId || currentOpportunityId !== eventOpportunityId) return;
    void this.queueRoomRefresh();
  }

  private async queueRoomRefresh(): Promise<void> {
    if (this.roomRefreshInFlight) {
      this.roomRefreshQueued = true;
      return;
    }

    this.roomRefreshInFlight = this.refreshRoomData();
    try {
      await this.roomRefreshInFlight;
    } finally {
      this.roomRefreshInFlight = null;
      if (this.roomRefreshQueued) {
        this.roomRefreshQueued = false;
        await this.queueRoomRefresh();
      }
    }
  }

  private groupDocuments(documents: OpportunityDocument[]): Array<{ label: string; items: OpportunityDocument[] }> {
    const groups = [
      { label: 'Public Documents', keys: ['PublicDocument', 'OpportunityPublicDocument', '4'] },
      { label: 'Private Documents', keys: ['PrivateDocument', 'OpportunityPrivateDocument', '5'] },
      { label: 'Financial Reports', keys: ['FinancialReport', '6'] },
      { label: 'Contracts', keys: ['Contract', '7'] },
      { label: 'Legal', keys: ['Legal', '8'] },
      { label: 'Internal Files', keys: ['InternalFile', '9'] },
      { label: 'General', keys: ['General', '11'] }
    ];
    return groups
      .map(group => ({ label: group.label, items: documents.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
      .filter(group => group.items.length > 0);
  }

  private groupMedia(media: OpportunityMedia[]): Array<{ label: string; items: OpportunityMedia[] }> {
    const groups = [
      { label: 'Cover', keys: ['Cover', '1'] },
      { label: 'Gallery', keys: ['Gallery', '2'] },
      { label: 'Pitch Video', keys: ['PitchVideo', '3'] },
      { label: 'Project Update Media', keys: ['ProjectUpdateMedia', '10'] },
      { label: 'General', keys: ['General', '11'] }
    ];
    return groups
      .map(group => ({ label: group.label, items: media.filter(item => group.keys.includes(String(item.purpose || item.category || ''))) }))
      .filter(group => group.items.length > 0);
  }

  private numberValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private extensionFromName(name: string | null | undefined): string {
    if (!name || !name.includes('.')) return '';
    return name.split('.').pop() || '';
  }

  private reportErrorMessage(error: any): string {
    const raw = error?.error?.message || error?.message || '';
    const status = error?.status;
    const normalized = String(raw).toLowerCase();
    if (status === 409 || normalized.includes('duplicate') || normalized.includes('pending report')) {
      return this.t('reports.errors.duplicate');
    }
    if (status === 400 && (normalized.includes('self') || normalized.includes('own'))) {
      return this.t('reports.errors.selfReport');
    }
    if (status === 404 || normalized.includes('invalid target')) {
      return this.t('reports.errors.invalidTarget');
    }
    return this.t('reports.errors.generic');
  }

  private contractErrorMessage(error: any): string {
    const status = error?.status;
    const raw = error?.error?.message || error?.message || '';
    const normalized = String(raw).toLowerCase();
    if (status === 403 || normalized.includes('access denied')) return this.t('contracts.errors.accessDenied');
    if (status === 404 || normalized.includes('not found')) return this.t('contracts.errors.notFound');
    if (status === 409 || normalized.includes('generating')) return this.t('contracts.errors.pdfGenerating');
    if (normalized.includes('verify your email') || normalized.includes('توثيق بريدك')) return this.t('contracts.errors.emailNotVerified');
    if (raw) return String(raw);
    return this.t('contracts.errors.generic');
  }

  private sanitizeContractHtml(html: string): string {
    const withoutScripts = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '');
    return withoutScripts;
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private termsSummary(raw: string | null | undefined): Array<{ label: string; value: string }> {
    const terms = this.parseJsonRecord(raw);
    if (!terms) return [];
    const preferredKeys = [
      'contractNumber',
      'requestedAmount',
      'numberOfShares',
      'sharePrice',
      'proposedSharePercentage',
      'profitSharePercentage',
      'returnRate',
      'termMonths',
      'repaymentModel',
      'contractStartDate',
      'contractEndDate',
      'acceptedOfferId',
      'sourceParticipationRequestId'
    ];
    const entries = preferredKeys
      .filter(key => terms[key] !== null && terms[key] !== undefined && terms[key] !== '')
      .map(key => ({ label: this.humanizeKey(key), value: this.displayJsonValue(terms[key]) }));
    if (entries.length > 0) return entries;
    return Object.entries(terms)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .slice(0, 8)
      .map(([key, value]) => ({ label: this.humanizeKey(key), value: this.displayJsonValue(value) }));
  }

  private readTermsValue(keys: string[]): string {
    const terms = this.parseJsonRecord(this.selectedVersion()?.termsSnapshotJson);
    if (!terms) return '-';
    for (const key of keys) {
      const value = terms[key];
      if (value !== null && value !== undefined && value !== '') return this.displayJsonValue(value);
    }
    return '-';
  }

  private parseJsonRecord(raw: string | null | undefined): Record<string, any> | null {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private displayJsonValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
    if (typeof value === 'boolean') return value ? this.t('common.yes') : this.t('common.no');
    if (Array.isArray(value)) return value.map(item => this.displayJsonValue(item)).join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    const text = String(value);
    const date = /^\d{4}-\d{2}-\d{2}/.test(text) ? new Date(text) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : text;
  }

  private humanizeKey(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private contractEnumLabel(prefix: string, value: unknown): string {
    const normalized = String(value ?? '').trim();
    const key = normalized === '' ? 'unknown' : normalized;
    const translated = this.t(`${prefix}.${key}`);
    return translated === `${prefix}.${key}` ? key : translated;
  }

  repaymentModelLabel(value: string | null | undefined): string {
    const key = repaymentModelLabelKey(value);
    return key ? this.t(key) : String(value ?? '');
  }

  private t(path: string): string {
    return this.languageService.translate(path);
  }

  private timelineText(key: string | null | undefined, metadata: Record<string, string | null> | null | undefined): string {
    if (!key) return '';
    const translated = this.t(key);
    return Object.entries(metadata || {}).reduce(
      (text, [name, value]) => text.replaceAll(`{${name}}`, value ?? ''),
      translated
    );
  }

  private toRoomError(error: unknown): RoomError {
    const status = error instanceof HttpErrorResponse ? error.status : (error as any)?.status;
    if (status === 403) {
      return {
        status,
        title: this.t('opportunityRoom.errors.approvalRequired'),
        message: this.t('opportunityRoom.errors.approvalRequiredMessage')
      };
    }
    if (status === 404) {
      return {
        status,
        title: this.t('opportunityRoom.errors.notFound'),
        message: this.t('opportunityRoom.errors.notFoundMessage')
      };
    }
    return {
      status,
      title: this.t('opportunityRoom.errors.genericTitle'),
      message: (error as any)?.error?.message || (error as any)?.message || this.t('opportunityRoom.errors.genericMessage')
    };
  }
}
