import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ApiResponse } from '../models/api-response.model';

export interface Project {
  id: number; displayName: string; legalName?: string; summary: string; description: string;
  categoryId?: number | null; category?: { id: number | string; name?: string | null; description?: string | null } | null;
  businessStage: number; industry?: string; geography?: string; foundedOn?: string;
  websiteUrl?: string; logoUrl?: string; teamDescription?: string; businessModel?: string;
  riskDisclosure?: string; status: number | string; opportunityCount: number; canCreateOpportunity: boolean;
  defaultCurrency: string;
  defaultCurrencyInfo?: { isoCode: string; symbol: string; englishName: string; arabicName: string; decimalDigits: number; isActive: boolean } | null;
  totalFundingTargetInDefaultCurrency: number;
  opportunities: ProjectOpportunity[];
}
export interface ProjectOpportunity { id:number; sequenceNumber:number; title:string; purpose:string; type:string; projectStage:number|string; projectStageCustomName?:string|null; status:number|string; moderationStatus:number|string; fundingStatus:number|string; fundingOpensAt?:string; fundingClosesAt?:string; closureReason?:number|string; fundingTarget:number; fundingCurrency:string; createdAt:string; }
export type ProjectUpsert = Omit<Project, 'id'|'status'|'opportunityCount'|'canCreateOpportunity'|'defaultCurrencyInfo'|'totalFundingTargetInDefaultCurrency'>;
export interface ProjectRoomEntry { id:number; entryType:number|string; title:string; description?:string; dueAt?:string; completedAt?:string; createdAt:string; }
export interface ProjectRoomDocument { id:number; fileKey:string; fileName:string; documentType:string; visibility:number|string; createdAt:string; }
export interface ProjectRoomOpportunity {
  opportunityId:number; sequenceNumber:number; title:string; fundingStatus:number|string; obligationCompletionStatus:number|string;
  hasOriginatingOpportunityAccess:boolean; visibleParticipationCount:number; visibleContractCount:number;
  documents:Array<{id:number;fileName:string}>; media:Array<{id:number;title?:string;fileName?:string}>;
  opportunityRoomUrl:string; cashFlowUrl:string; obligationCompletionUrl:string;
}
export interface ProjectRoom {
  projectId:number; displayName:string; summary:string; isFounder:boolean; hasProjectAccess:boolean;
  updates:ProjectRoomEntry[]; milestones:ProjectRoomEntry[]; timeline:ProjectRoomEntry[];
  documents:ProjectRoomDocument[]; opportunities:ProjectRoomOpportunity[];
}

@Injectable({providedIn:'root'})
export class ProjectService {
  constructor(private http:HttpClient,@Inject(API_BASE) private base:string){}
  list(){return this.get<Project[]>('/api/v1/projects');}
  getOne(id:string|number){return this.get<Project>(`/api/v1/projects/${id}`);}
  create(v:ProjectUpsert){return this.send<Project>('post','/api/v1/projects',v);}
  update(id:string|number,v:ProjectUpsert){return this.send<Project>('put',`/api/v1/projects/${id}`,v);}
  transitionStatus(id:string|number,targetStatus:'Draft'|'Active'|'Paused'|'Completed'|'Archived',reason?:string){return this.send<Project>('post',`/api/v1/projects/${id}/status`,{targetStatus,reason});}
  getRoom(id:string|number){return this.get<ProjectRoom>(`/api/v1/projects/${id}/room`);}
  addRoomEntry(id:string|number,value:{entryType:number;title:string;description?:string;dueAt?:string;isInvestorVisible:boolean}){return this.send<ProjectRoomEntry>('post',`/api/v1/projects/${id}/room/entries`,value);}
  completeMilestone(projectId:string|number,entryId:number){return this.send<ProjectRoomEntry>('post',`/api/v1/projects/${projectId}/room/milestones/${entryId}/complete`,{});}
  addRoomDocument(id:string|number,value:{fileKey:string;fileName:string;documentType:string;visibility:number}){return this.send<ProjectRoomDocument>('post',`/api/v1/projects/${id}/room/documents`,value);}
  private headers(){const t=localStorage.getItem('accessToken');return new HttpHeaders(t?{Authorization:`Bearer ${t}`}:{})}
  private async get<T>(path:string){return this.unwrap<T>(await firstValueFrom(this.http.get(`${this.base}${path}`,{headers:this.headers()})))}
  private async send<T>(method:'post'|'put',path:string,v:any){const call=method==='post'?this.http.post:this.http.put;return this.unwrap<T>(await firstValueFrom(call.call(this.http,`${this.base}${path}`,v,{headers:this.headers()})))}
  private unwrap<T>(raw:any):T{const r=raw as ApiResponse<T>;if(r?.data!==undefined)return r.data;return raw as T}
}
