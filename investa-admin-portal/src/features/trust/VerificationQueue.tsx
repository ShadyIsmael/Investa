import React, { useState, useEffect, useCallback } from 'react';
import { trustApi } from '../../api/trust';
import type { UserVerificationDto } from '../../types/trust';
import { VerificationType, VerificationStatus, VERIFICATION_TYPE_LABELS } from '../../types/trust';

/**
 * Admin component to review pending user verifications.
 * Allows approve/reject with optional notes.
 */
const VerificationQueue: React.FC = () => {
  const [items, setItems] = useState<UserVerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trustApi.getPendingVerifications();
      setItems(data);
    } catch {
      setError('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleReview = async (id: number, isApproved: boolean) => {
    setProcessing(prev => ({ ...prev, [id]: true }));
    try {
      await trustApi.reviewVerification({
        verificationId: id,
        isApproved,
        notes: notes[id] ?? ''
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch {
      alert(`Failed to ${isApproved ? 'approve' : 'reject'} verification`);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading verifications...</div>;
  if (error)   return <div className="p-4 text-red-500">{error}</div>;
  if (!items.length) return <div className="p-4 text-green-600">No pending verifications ✓</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending Verifications ({items.length})</h2>
        <button
          onClick={loadPending}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">User ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Submitted</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Document</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Notes</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                {item.userId.slice(0, 8)}…
              </td>
              <td className="px-4 py-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                  {VERIFICATION_TYPE_LABELS[item.verificationType as VerificationType]}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(item.submittedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {item.documentUrl ? (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  placeholder="Admin notes…"
                  className="border rounded px-2 py-1 text-xs w-40"
                  value={notes[item.id] ?? ''}
                  onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                />
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  disabled={processing[item.id]}
                  onClick={() => handleReview(item.id, true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={processing[item.id]}
                  onClick={() => handleReview(item.id, false)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationQueue;
