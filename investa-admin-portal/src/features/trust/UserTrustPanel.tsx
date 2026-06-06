import React, { useState, useEffect } from 'react';
import { trustApi } from '../../api/trust';
import type { TrustProfileDto } from '../../types/trust';
import { TrustLevel, TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS, VERIFICATION_TYPE_LABELS, VerificationType, VerificationStatus } from '../../types/trust';

interface UserTrustPanelProps {
  userId: string;
}

/**
 * Displays the trust profile of a user in the admin detail view.
 * Shows trust level, reputation, verification status, and allows reputation adjustments.
 */
const UserTrustPanel: React.FC<UserTrustPanelProps> = ({ userId }) => {
  const [profile, setProfile] = useState<TrustProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reputationDelta, setReputationDelta] = useState('');
  const [reputationReason, setReputationReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    setLoading(true);
    trustApi.getUserTrustProfile(userId)
      .then(setProfile)
      .catch(() => setError('Failed to load trust profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleReputationAdjust = async () => {
    const delta = parseInt(reputationDelta, 10);
    if (isNaN(delta) || !reputationReason.trim()) return;

    setAdjusting(true);
    try {
      await trustApi.adjustReputation(userId, delta, reputationReason);
      const updated = await trustApi.getUserTrustProfile(userId);
      setProfile(updated);
      setReputationDelta('');
      setReputationReason('');
    } catch {
      alert('Failed to adjust reputation');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) return <div className="p-3 text-gray-400 text-sm">Loading trust data…</div>;
  if (error || !profile) return <div className="p-3 text-red-400 text-sm">{error ?? 'No data'}</div>;

  const levelColor: Record<string, string> = {
    default: '#9ca3af', primary: '#3b82f6', warning: '#f59e0b', success: '#10b981'
  };
  const colorKey = TRUST_LEVEL_COLORS[profile.trustLevel as TrustLevel];

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold"
          style={{ background: levelColor[colorKey] ?? '#6b7280' }}
        >
          {TRUST_LEVEL_LABELS[profile.trustLevel as TrustLevel]}
        </span>
        <span className="text-gray-500 text-sm">
          Reputation: <strong>{profile.reputationLevel || 'Rising Member'}</strong>
        </span>
        <span className="text-gray-500 text-sm">
          Activity: <strong>{profile.activityScore ?? 0}</strong>/10000
        </span>
        <span className="text-gray-500 text-sm">
          Profile: <strong>{profile.profileCompletionPercentage}%</strong>
        </span>
      </div>

      {/* Verification checkmarks */}
      <div className="flex gap-4 text-sm">
        <span className={profile.isEmailVerified ? 'text-green-600' : 'text-gray-400'}>
          {profile.isEmailVerified ? '✓' : '✗'} Email
        </span>
        <span className={profile.isPhoneVerified ? 'text-green-600' : 'text-gray-400'}>
          {profile.isPhoneVerified ? '✓' : '✗'} Phone
        </span>
        <span className={profile.isIdentityVerified ? 'text-green-600' : 'text-gray-400'}>
          {profile.isIdentityVerified ? '✓' : '✗'} Identity
        </span>
      </div>

      {/* Submitted verifications */}
      {profile.verifications.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Verifications</p>
          <ul className="space-y-1">
            {profile.verifications.map(v => (
              <li key={v.id} className="flex items-center gap-2 text-xs">
                <span className={
                  v.status === VerificationStatus.Verified ? 'text-green-600' :
                  v.status === VerificationStatus.Pending  ? 'text-yellow-600' : 'text-gray-400'
                }>
                  {v.status === VerificationStatus.Verified ? '✓' :
                   v.status === VerificationStatus.Pending  ? '⏳' : '—'}
                </span>
                <span>{VERIFICATION_TYPE_LABELS[v.verificationType as VerificationType]}</span>
                <span className="text-gray-400">{new Date(v.submittedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reputation adjustment */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500 font-medium mb-2">Adjust Reputation</p>
        <div className="flex gap-2 items-end">
          <input
            type="number"
            placeholder="Delta (e.g. +50 or -20)"
            className="border rounded px-2 py-1 text-xs w-32"
            value={reputationDelta}
            onChange={e => setReputationDelta(e.target.value)}
          />
          <input
            type="text"
            placeholder="Reason"
            className="border rounded px-2 py-1 text-xs flex-1"
            value={reputationReason}
            onChange={e => setReputationReason(e.target.value)}
          />
          <button
            disabled={adjusting}
            onClick={handleReputationAdjust}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTrustPanel;
