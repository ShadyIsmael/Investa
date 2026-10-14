/*
   Equity Phase 3 P1 UAT correction.

   Scope is limited to disposable UAT data:
   - provision a legacy-login credential for the existing Position 2 investor;
   - mark stale, unapplied transfer attempts as Rejected with an audit note;
   - backfill deterministic initial snapshots for transfer-created positions;
   - repair the corresponding closure snapshot fields from those snapshots.

   No Applied transfer, ownership ledger entry, capitalization event, contract,
   payment, or wallet row is changed by this script.
*/
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @OriginalInvestor uniqueidentifier = 'B8AF29C8-1575-4ABF-8490-17A9A7C7E0BF';
DECLARE @KnownUatInvestor uniqueidentifier = 'F9280C55-3DFD-4709-A595-F04AEAA94C42';

/* The known UAT investor password is P@ss0rd. Reusing its PasswordHasher
   output keeps the repair inside the existing legacy login path. */
UPDATE target
SET target.PasswordHash = source.PasswordHash,
    target.FirebaseUid = '+201099999999',
    target.IsPhoneVerified = 1
FROM AuthUsers target
JOIN AuthUsers source ON source.Id = @KnownUatInvestor
WHERE target.Id = @OriginalInvestor
  AND LEN(ISNULL(target.PasswordHash, '')) = 0;

/* Transfers 1 and 4 were created from obsolete 1,000/2,000-share baselines.
   They have no AppliedAt, destination position, or ledger correlation. */
UPDATE EquityTransfers
SET Status = 'Rejected',
    Notes = CONCAT(
        COALESCE(NULLIF(Notes, '' ) + CHAR(10), ''),
        'UAT P1 cleanup: stale baseline; no Applied ownership effect; rejected without mutation.')
WHERE Id IN (1, 4)
  AND Status = 'PendingApproval'
  AND SourceSharesAfter IS NULL
  AND AppliedAt IS NULL
  AND DestinationPositionId IS NULL
  AND NOT EXISTS
      (SELECT 1 FROM EquityHoldingLedgerEntries l
       WHERE l.CorrelationId = CONCAT('equity-transfer:', EquityTransfers.Id));

/* Reconstruct only when the authoritative TransferIn ledger and position terms
   provide a complete deterministic state. The unique position index makes the
   NOT EXISTS guard idempotent. */
INSERT INTO EquityHoldingSnapshots
(
    EquityPositionId, OwnershipModel, EffectiveDate,
    ContractualOwnershipPercentage, InvestorShareCount, TotalIssuedShares,
    DerivedOwnershipPercentage, ShareClass, PricePerShare,
    PreMoneyValuation, PostMoneyValuation,
    ContractId, ContractVersionId, AcceptedOfferId, OfferLegId, CreatedAt
)
SELECT
    p.Id, 'ShareBased', l.EffectiveDate,
    NULL, l.ResultingInvestorShares, l.ResultingTotalIssuedShares,
    l.ResultingOwnershipPercentage, p.ShareClass, p.PricePerShare,
    p.PreMoneyValuation, p.PostMoneyValuation,
    p.ContractId, p.ContractVersionId, p.AcceptedOfferId, p.OfferLegId,
    SYSUTCDATETIME()
FROM EquityPositions p
JOIN EquityHoldingLedgerEntries l
  ON l.EquityPositionId = p.Id
 AND l.EventType = 'TransferIn'
 AND l.ResultingInvestorShares > 0
WHERE p.Id IN (5, 6)
  AND NOT EXISTS
      (SELECT 1 FROM EquityHoldingSnapshots s WHERE s.EquityPositionId = p.Id);

/* Closure snapshots 1 and 3 were produced before the destination snapshot fix.
   Their initial state is now filled from the newly persisted immutable snapshot. */
UPDATE c
SET c.InitialOwnershipPercentage = s.DerivedOwnershipPercentage,
    c.InitialInvestorShares = s.InvestorShareCount
FROM EquityClosureSnapshots c
JOIN EquityHoldingSnapshots s ON s.EquityPositionId = c.EquityPositionId
WHERE c.EquityPositionId IN (5, 6)
  AND c.InitialInvestorShares IS NULL
  AND c.InitialOwnershipPercentage IS NULL;

COMMIT TRANSACTION;
