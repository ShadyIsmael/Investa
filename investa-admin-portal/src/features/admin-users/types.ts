export type PendingAdminChangeAction =
  | 'Activate' | 'Deactivate' | 'Lock' | 'Unlock'
  | 'ResetPassword' | 'AssignRole' | 'RemoveRole';

export type PendingAdminChangeStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface PendingAdminChange {
  id: number;
  targetUserId: string;
  targetUserName: string | null;
  makerId: string;
  makerName: string | null;
  checkerId: string | null;
  checkerName: string | null;
  action: PendingAdminChangeAction;
  status: PendingAdminChangeStatus;
  beforeSnapshot: string | null;
  afterSnapshot: string | null;
  description: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewDecision: string | null;
  reviewReason: string | null;
  isApplied: boolean;
  appliedAt: string | null;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
}
