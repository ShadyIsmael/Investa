/* Read-only post-migration report. Unmatched legacy values are intentionally preserved. */
WITH ValuesToReview AS
(
    SELECT 'UserProfiles.Country' AS SourceField, [Country] AS LegacyValue FROM [UserProfiles] WHERE NULLIF(LTRIM(RTRIM([Country])), '') IS NOT NULL
    UNION ALL
    SELECT 'UserProfiles.Nationality', [Nationality] FROM [UserProfiles] WHERE NULLIF(LTRIM(RTRIM([Nationality])), '') IS NOT NULL
    UNION ALL
    SELECT 'Clients.Country', [Country] FROM [Clients] WHERE NULLIF(LTRIM(RTRIM([Country])), '') IS NOT NULL
)
SELECT SourceField, LegacyValue, COUNT(*) AS RecordCount
FROM ValuesToReview v
WHERE NOT EXISTS (SELECT 1 FROM [Countries] c WHERE c.[IsoAlpha2] = UPPER(LTRIM(RTRIM(v.LegacyValue))))
GROUP BY SourceField, LegacyValue
ORDER BY SourceField, LegacyValue;
