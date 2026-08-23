import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OpportunityObligationCompletion, OpportunityService } from '../../../services/opportunity.service';

@Component({
  standalone:true, selector:'app-opportunity-obligations', imports:[CommonModule,FormsModule],
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`
  <section class="mx-auto max-w-5xl p-6">
    <h1 class="text-2xl font-bold">Opportunity obligation completion</h1>
    <p class="mt-2 text-sm text-gray-400">Confirmations record each party's declaration only. They do not create, move, settle, or prove payment.</p>
    @if(error()){<p class="mt-4 rounded bg-red-500/15 p-3 text-red-300">{{error()}}</p>}
    @if(summary();as s){
      <div class="mt-5 rounded-xl border border-slate-700 p-4"><strong>{{s.status}}</strong>
        <span class="ms-3 text-sm text-gray-400">{{s.completedParticipationCount}} / {{s.requiredParticipationCount}} Participations complete</span>
        @if(s.status==='NotStarted'||s.status===0){<button class="ms-4 rounded bg-blue-600 px-4 py-2" (click)="initiate()">Start confirmations</button>}
      </div>
      @for(p of s.participations;track p.participationRequestId){
        <article class="mt-4 rounded-xl border border-slate-700 p-4"><h2 class="font-semibold">Participation #{{p.participationSequence||p.participationRequestId}}</h2>
          @for(c of p.confirmations;track c.id){
            <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3"><span>{{c.partyRole}}</span><strong>{{c.status}}</strong>
              @if(c.status==='Pending'||c.status===0){
                <input class="min-w-64 rounded bg-slate-800 px-3 py-2" [(ngModel)]="statements[c.id]" placeholder="Your completion declaration">
                <button class="rounded bg-emerald-600 px-4 py-2" (click)="confirm(p.participationRequestId,c.id)">Confirm my side</button>
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
  constructor(private route:ActivatedRoute,private opportunities:OpportunityService){}
  ngOnInit(){this.id=this.route.snapshot.paramMap.get('id')||'';void this.load();}
  async load(){try{this.summary.set(await this.opportunities.getObligationCompletion(this.id));}catch(e:any){this.error.set(e?.message||'Unable to load completion status.');}}
  async initiate(){try{this.summary.set(await this.opportunities.initiateObligationCompletion(this.id));}catch(e:any){this.error.set(e?.message||'Unable to start confirmations.');}}
  async confirm(participationId:number,confirmationId:number){const statement=this.statements[confirmationId]?.trim();if(!statement){this.error.set('Enter your completion declaration.');return;}
    try{this.summary.set(await this.opportunities.confirmObligationCompletion(this.id,participationId,statement,crypto.randomUUID()));this.error.set('');}catch(e:any){this.error.set(e?.message||'Unable to confirm.');}}
}
