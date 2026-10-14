import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OpportunityObligationCompletion, OpportunityService } from '../../../services/opportunity.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language.service';

@Component({
  standalone:true, selector:'app-opportunity-obligations', imports:[CommonModule,FormsModule,TranslatePipe],
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`
  <section class="mx-auto max-w-5xl p-6">
    <h1 class="text-2xl font-bold">{{ 'opportunityObligations.title' | translate }}</h1>
    <p class="mt-2 text-sm text-gray-400">{{ 'opportunityObligations.helper' | translate }}</p>
    @if(error()){<p class="mt-4 rounded bg-red-500/15 p-3 text-red-300">{{error()}}</p>}
    @if(summary();as s){
      <div class="mt-5 rounded-xl border border-slate-700 p-4"><strong>{{s.status}}</strong>
        <span class="ms-3 text-sm text-gray-400">{{s.completedParticipationCount}} / {{s.requiredParticipationCount}} {{ 'opportunityObligations.participationsComplete' | translate }}</span>
        @if(s.status==='NotStarted'||s.status===0){<button class="ms-4 rounded bg-blue-600 px-4 py-2" (click)="initiate()">{{ 'opportunityObligations.startConfirmations' | translate }}</button>}
      </div>
      @for(p of s.participations;track p.participationRequestId){
        <article class="mt-4 rounded-xl border border-slate-700 p-4"><h2 class="font-semibold">{{ 'opportunityObligations.participation' | translate }} #{{p.participationSequence||p.participationRequestId}}</h2>
          @for(c of p.confirmations;track c.id){
            <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3"><span>{{c.partyRole}}</span><strong>{{c.status}}</strong>
              @if(c.status==='Pending'||c.status===0){
                <input class="min-w-64 rounded bg-slate-800 px-3 py-2" [(ngModel)]="statements[c.id]" [placeholder]="'opportunityObligations.declarationPlaceholder' | translate">
                <button class="rounded bg-emerald-600 px-4 py-2" (click)="confirm(p.participationRequestId,c.id)">{{ 'opportunityObligations.confirm' | translate }}</button>
              } @else {<time class="text-sm text-gray-400">{{c.confirmedAt|date:'medium'}}</time>}
            </div>
          }
        </article>
      }
    }
  </section>`
})
export class OpportunityObligationsComponent implements OnInit{
  readonly summary=signal<OpportunityObligationCompletion|null>(null);readonly error=signal('');readonly statements:Record<number,string>={};private id='';
  private language = inject(LanguageService);
  constructor(private route:ActivatedRoute,private opportunities:OpportunityService){}
  ngOnInit(){this.id=this.route.snapshot.paramMap.get('id')||'';void this.load();}
  async load(){try{this.summary.set(await this.opportunities.getObligationCompletion(this.id));}catch(e:any){this.error.set(e?.message||this.t('opportunityObligations.errors.load'));}}
  async initiate(){try{this.summary.set(await this.opportunities.initiateObligationCompletion(this.id));}catch(e:any){this.error.set(e?.message||this.t('opportunityObligations.errors.start'));}}
  async confirm(participationId:number,confirmationId:number){const statement=this.statements[confirmationId]?.trim();if(!statement){this.error.set(this.t('opportunityObligations.errors.declaration'));return;}
    try{this.summary.set(await this.opportunities.confirmObligationCompletion(this.id,participationId,statement,crypto.randomUUID()));this.error.set('');}catch(e:any){this.error.set(e?.message||this.t('opportunityObligations.errors.confirm'));}}
  private t(path:string): string { return this.language.translate(path); }
}
