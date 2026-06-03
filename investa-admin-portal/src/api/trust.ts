import { api } from '../services/api';
import type {
  TrustProfileDto,
  UserVerificationDto,
  ReviewVerificationRequest
} from '../types/trust';

const TRUST_BASE = '/api/v1/trust';

export const trustApi = {
  /** Get trust profile for any user (admin) */
  getUserTrustProfile: (userId: string): Promise<TrustProfileDto> =>
    api.get<{ data: TrustProfileDto }>(`${TRUST_BASE}/admin/users/${userId}`)
      .then(res => res.data),

  /** Get all pending verification requests */
  getPendingVerifications: (): Promise<UserVerificationDto[]> =>
    api.get<{ data: UserVerificationDto[] }>(`${TRUST_BASE}/admin/verifications/pending`)
      .then(res => res.data ?? []),

  /** Approve or reject a verification */
  reviewVerification: (request: ReviewVerificationRequest): Promise<UserVerificationDto> =>
    api.post<{ data: UserVerificationDto }>(`${TRUST_BASE}/admin/verifications/review`, request)
      .then(res => res.data),

  /** Adjust user reputation score */
  adjustReputation: (userId: string, delta: number, reason: string): Promise<void> =>
    api.post(`${TRUST_BASE}/admin/users/${userId}/reputation`, { delta, reason }).then(() => {}),

  /** Add risk flag */
  addRiskFlag: (userId: string, flag: string): Promise<void> =>
    api.post(`${TRUST_BASE}/admin/users/${userId}/risk-flags`, { flag }).then(() => {}),

  /** Remove risk flag */
  removeRiskFlag: (userId: string, flag: string): Promise<void> =>
    api.delete(`${TRUST_BASE}/admin/users/${userId}/risk-flags/${flag}`).then(() => {})
};
