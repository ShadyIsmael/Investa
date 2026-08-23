import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { OpportunityObligationsComponent } from './opportunity-obligations.component';

describe('OpportunityObligationsComponent',()=>{
  it('requires a declaration before confirming',async()=>{
    const service={getObligationCompletion:()=>Promise.resolve({opportunityId:1,status:'AwaitingConfirmations',requiredParticipationCount:1,completedParticipationCount:0,participations:[]})};
    await TestBed.configureTestingModule({imports:[OpportunityObligationsComponent],providers:[
      {provide:ActivatedRoute,useValue:{snapshot:{paramMap:{get:()=> '1'}}}},{provide:OpportunityService,useValue:service}
    ]}).compileComponents();
    const fixture=TestBed.createComponent(OpportunityObligationsComponent);fixture.detectChanges();
    await fixture.componentInstance.confirm(1,10);
    expect(fixture.componentInstance.error()).toContain('declaration');
  });
});
