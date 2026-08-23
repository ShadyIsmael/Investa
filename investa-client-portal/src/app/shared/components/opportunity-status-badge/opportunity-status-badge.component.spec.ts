import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityStatusBadgeComponent } from './opportunity-status-badge.component';

describe('OpportunityStatusBadgeComponent lifecycle', () => {
  let fixture: ComponentFixture<OpportunityStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OpportunityStatusBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(OpportunityStatusBadgeComponent);
  });

  it('prefers the authoritative funding status over the legacy status', () => {
    fixture.componentInstance.status = 'Published';
    fixture.componentInstance.fundingStatus = 'Closed';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Closed');
  });

  it('shows paused funding as an ineligible warning state', () => {
    fixture.componentInstance.fundingStatus = 'Paused';
    expect(fixture.componentInstance.tone).toContain('amber');
  });
});
