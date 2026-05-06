export type RequestType = 'join' | 'invitation' | 'investment';
export type RequestDirection = 'incoming' | 'outgoing';
export type RequestStatus = 'Pending' | 'Negotiating' | 'Partner' | 'Rejected' | 'Accepted' | 'Declined';

/**
 * Investment Request Model
 * Represents a request for investment, partnership, or collaboration
 */
export interface InvestmentRequest {
  id: number;
  type: RequestType;
  direction: RequestDirection;
  projectName: string;
  projectImageUrl: string;
  counterpartName: string; // sender or receiver name
  senderName?: string; // sender display name (investor)
  receiverName?: string; // receiver display name (founder)
  businessName?: string; // business name from investment
  shortDescription?: string; // one-line description of investment
  status: RequestStatus;
  createdAt: Date;
  investmentAmount?: number; // For investment requests (amount in credits)
  shares?: number; // For equity investments
  investmentId?: number; // Reference to the investment/project
  investorId?: number; // Reference to the investor
  founderId?: number; // Reference to the founder
}

/**
 * Credit Transaction Model
 * Represents a credit debit/credit transaction with audit trail
 */
export interface CreditTransaction {
  id: number;
  userId: number;
  amount: number; // Positive for credit, negative for debit
  type: 'debit' | 'credit';
  reason: string; // English justification
  reasonAr?: string; // Arabic justification (for bilingual audit trail)
  investmentId?: number;
  createdAt: Date;
  adminId?: string; // Admin who processed the transaction (for admin-initiated transactions)
}
