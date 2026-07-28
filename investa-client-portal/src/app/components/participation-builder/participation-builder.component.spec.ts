import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { OpportunityService } from '../../services/opportunity.service';
import { WalletService } from '../../services/wallet.service';
import { ParticipationBuilderComponent } from './participation-builder.component';

describe('ParticipationBuilderComponent', () => {
  let component: ParticipationBuilderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: OpportunityService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: WalletService, useValue: {} },
        { provide: LanguageService, useValue: { translate: (key: string) => key, language: () => 'en' } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new ParticipationBuilderComponent());
  });

  it('recognizes the API EquityInvestment model and submits selected shares', () => {
    component.form.set({ investmentModel: 'EquityInvestment' } as any);
    component.selectedShares.set(7);

    expect(component.isEquity()).toBeTrue();
    expect((component as any).submitPayload()).toEqual({ requestType: 2, numberOfShares: 7 });
  });

  it('recognizes the API LoanInvestment model and submits a contribution', () => {
    component.form.set({ investmentModel: 'LoanInvestment' } as any);
    component.contributionAmount.set(2500);

    expect(component.isLoan()).toBeTrue();
    expect((component as any).submitPayload()).toEqual({ requestType: 2, requestedAmount: 2500 });
  });

  it('recognizes the API ProfitSharingInvestment model and submits a contribution', () => {
    component.form.set({ investmentModel: 'ProfitSharingInvestment' } as any);
    component.contributionAmount.set(3000);

    expect(component.isProfitSharing()).toBeTrue();
    expect((component as any).submitPayload()).toEqual({ requestType: 2, requestedAmount: 3000 });
  });
});
