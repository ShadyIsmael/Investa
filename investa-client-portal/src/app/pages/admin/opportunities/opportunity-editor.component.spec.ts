import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityEditorComponent } from './opportunity-editor.component';
import { OpportunityService } from '../../../services/opportunity.service';
import { ProjectService } from '../../../services/project.service';
import { NotificationService } from '../../../services/notification.service';
import { FileStoreService } from '../../../services/file-store.service';
import { WalletService } from '../../../services/wallet.service';
import { LanguageService } from '../../../services/language.service';
import { CurrencyService } from '../../../services/currency.service';
import { FundingGoalService } from '../../../services/funding-goal.service';
import { OpportunityTagService } from '../../../services/opportunity-tag.service';
import { ProjectStageService } from '../../../services/project-stage.service';

describe('OpportunityEditorComponent project-stage milestones', () => {
  let fixture: ComponentFixture<OpportunityEditorComponent>;
  let component: OpportunityEditorComponent;

  beforeEach(async () => {
    const language = { direction: signal<'ltr' | 'rtl'>('ltr'), language: signal<'en' | 'ar'>('en'), dictionary: signal({}), translate: (key: string) => key };
    const opportunity = {
      getCategories: async () => [], getTags: async () => [], label: () => '',
      createOpportunity: async () => ({ id: 1 }), updateOpportunity: async () => ({ id: 1 })
    };
    const project = {
      list: async () => [{
        id: 9, displayName: 'Lifecycle project', canCreateOpportunity: true, opportunities: [
          { id: 11, sequenceNumber: 1, title: 'MVP', type: 'Opportunity', projectStage: 2, fundingTarget: 1, fundingCurrency: 'EGP', createdAt: '2026-01-01' },
          { id: 12, sequenceNumber: 2, title: 'Regional', type: 'Opportunity', projectStage: 6, projectStageCustomName: 'Regional Expansion', fundingTarget: 1, fundingCurrency: 'EGP', createdAt: '2026-02-01' }
        ]
      }]
    };

    await TestBed.configureTestingModule({
      imports: [OpportunityEditorComponent],
      providers: [
        { provide: OpportunityService, useValue: opportunity },
        { provide: ProjectService, useValue: project },
        { provide: LanguageService, useValue: language },
        { provide: CurrencyService, useValue: { ensureLoaded: async () => undefined, master: () => [{ isoCode: 'EGP', englishName: 'Egyptian Pound', arabicName: 'الجنيه المصري', symbol: 'E£', decimalDigits: 2, isActive: true, supportsFunding: true, supportsSettlement: true, supportsWallet: true }] } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: async () => true } },
        { provide: NotificationService, useValue: { showToast: () => undefined } },
        { provide: FileStoreService, useValue: { getFileCategories: async () => [] } },
        { provide: WalletService, useValue: {} },
        { provide: OpportunityTagService, useValue: { ensureLoaded: async () => undefined, active: () => [], label: () => '' } },
        { provide: ProjectStageService, useValue: {
          ensureLoaded: async () => undefined,
          all: () => [
            { code: 'Idea', value: 1, nameEn: 'Idea', nameAr: 'فكرة', sortOrder: 10, isActive: true, allowsCustomName: false },
            { code: 'MVP', value: 2, nameEn: 'MVP', nameAr: 'المنتج الأولي', sortOrder: 20, isActive: true, allowsCustomName: false },
            { code: 'Other', value: 6, nameEn: 'Other', nameAr: 'أخرى', sortOrder: 60, isActive: true, allowsCustomName: true }
          ],
          find: (value: unknown) => value === 6 || value === 'Other'
            ? { code: 'Other', value: 6, nameEn: 'Other', nameAr: 'أخرى', sortOrder: 60, isActive: true, allowsCustomName: true }
            : undefined,
          label: (value: unknown) => value === 6 || value === 'Other' ? 'Other' : String(value ?? '')
        } },
        { provide: FundingGoalService, useValue: { ensureLoaded: async () => undefined, active: () => [], label: () => '' } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(OpportunityEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('marks sibling standard stages unavailable while leaving Other available', () => {
    component.form.patchValue({ projectId: 9 });
    expect(component.isProjectStageUnavailable(2)).toBeTrue();
    expect(component.isProjectStageUnavailable(1)).toBeFalse();
    expect(component.isProjectStageUnavailable(6)).toBeFalse();
  });

  it('requires a non-whitespace custom name when Other is selected', () => {
    component.form.patchValue({ projectStage: 6, projectStageCustomName: '   ' });
    expect(component.form.get('projectStageCustomName')?.invalid).toBeTrue();
    component.form.patchValue({ projectStageCustomName: ' Regional Expansion ' });
    expect(component.form.get('projectStageCustomName')?.valid).toBeTrue();
  });

  it('keeps Use of Funds as one editable control and one payload field', () => {
    expect(component.form.contains('useOfFunds')).toBeTrue();
    expect(Object.keys(component.form.controls).filter(name => name === 'useOfFunds')).toHaveSize(1);

    component.form.patchValue({ useOfFunds: 'Fund the initial production and distribution rollout.' });
    const payload = (component as any).buildPayload();

    expect(payload.useOfFunds).toBe('Fund the initial production and distribution rollout.');
    expect(Object.prototype.hasOwnProperty.call(payload, 'purpose')).toBeFalse();
  });
});
