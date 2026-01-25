export type RequestType = 'join' | 'invitation';
export type RequestDirection = 'incoming' | 'outgoing';
export type RequestStatus = 'Pending' | 'Negotiating' | 'Partner' | 'Rejected' | 'Accepted' | 'Declined';

export interface InvestmentRequest {
  id: number;
  type: RequestType;
  direction: RequestDirection;
  projectName: string;
  projectImageUrl: string;
  counterpartName: string; // sender or receiver name
  status: RequestStatus;
  createdAt: Date;
}
