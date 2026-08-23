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

describe('OpportunityEditorComponent project-stage milestones', () => {
  let fixture: ComponentFixture<OpportunityEditorComponent>;
  let component: OpportunityEditorComponent;

  beforeEach(async () => {
    const language = { direction: signal<'ltr' | 'rtl'>('ltr'), language: signal<'en' | 'ar'>('en'), dictionary: signal({}), translate: (key: string) => key };
    const opportunity = {
      getCategories: async () => [], getTags: async () => [], getFundingGoals: async () => [],
      getCurrencies: async () => [{ isoCode: 'EGP' }], label: () => '',
      createOpportunity: async () => ({ id: 1 }), updateOpportunity: async () => ({ id: 1 })
    };
    const project = {
      list: async () => [{
        id: 9, displayName: 'Lifecycle project', canCreateOpportunity: true, opportunities: [
          { id: 11, sequenceNumber: 1, title: 'MVP', purpose: 'Build', type: 'Opportunity', projectStage: 2, fundingTarget: 1, fundingCurrency: 'EGP', createdAt: '2026-01-01' },
          { id: 12, sequenceNumber: 2, title: 'Regional', purpose: 'Expand', type: 'Opportunity', projectStage: 6, projectStageCustomName: 'Regional Expansion', fundingTarget: 1, fundingCurrency: 'EGP', createdAt: '2026-02-01' }
        ]
      }]
    };

    await TestBed.configureTestingModule({
      imports: [OpportunityEditorComponent],
      providers: [
        { provide: OpportunityService, useValue: opportunity },
        { provide: ProjectService, useValue: project },
        { provide: LanguageService, useValue: language },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: async () => true } },
        { provide: NotificationService, useValue: { showToast: () => undefined } },
        { provide: FileStoreService, useValue: { getCategories: async () => [] } },
        { provide: WalletService, useValue: {} }
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
});
