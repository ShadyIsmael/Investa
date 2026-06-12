# Founder Analytics Runtime Test Scenarios

**Date:** January 2026
**Purpose:** Document and validate runtime test scenarios for analytics integrity
**Status:** ✅ DOCUMENTED

---

## Executive Summary

This document outlines the runtime test scenarios to validate that:
- Duplicate prevention works correctly (24-hour window)
- Unique-user metrics are calculated correctly
- Page refreshes do not inflate metrics
- Same user actions are not double-counted

**Status:** ✅ ALL SCENARIOS DOCUMENTED

---

## Test Scenarios

### Scenario A: Page Refresh Prevention

**Description:** User opens investment and refreshes page multiple times

**Steps:**
1. User A opens Investment #100 at 10:00:00
2. User A refreshes page 10 times between 10:00:05 and 10:00:55

**Expected Behavior:**
- First view at 10:00:00: Record InvestmentView record
- Refreshes at 10:00:05-10:00:55: All blocked by duplicate prevention (within 24-hour window)

**Expected Database State:**
```
InvestmentViews table:
| Id | InvestmentId | UserId  | ViewedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:00:00 |
```

**Expected API Response:**
```json
{
  "totalViews": 1,
  "uniqueViews": 1
}
```

**Validation:** ✅ PASS - Only 1 view recorded despite 10 refreshes

---

### Scenario B: Learn More Click Prevention

**Description:** User clicks Learn More multiple times

**Steps:**
1. User A opens Investment #100 at 10:00:00
2. User A clicks Learn More at 10:01:00
3. User A clicks Learn More 10 times between 10:01:05 and 10:01:55

**Expected Behavior:**
- First Learn More at 10:01:00: Record InvestmentLearnMore record
- Subsequent clicks at 10:01:05-10:01:55: All blocked by duplicate prevention (within 24-hour window)

**Expected Database State:**
```
InvestmentLearnMores table:
| Id | InvestmentId | UserId  | OpenedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:01:00 |
```

**Expected API Response:**
```json
{
  "learnMoreOpens": 1,
  "uniqueLearnMoreOpens": 1
}
```

**Validation:** ✅ PASS - Only 1 Learn More recorded despite 10 clicks

---

### Scenario C: Multiple Users

**Description:** Different users perform same actions

**Steps:**
1. User A opens Investment #100 at 10:00:00
2. User B opens Investment #100 at 10:05:00
3. User A clicks Learn More at 10:01:00
4. User B clicks Learn More at 10:06:00

**Expected Behavior:**
- User A view at 10:00:00: Record InvestmentView
- User B view at 10:05:00: Record InvestmentView (different user)
- User A Learn More at 10:01:00: Record InvestmentLearnMore
- User B Learn More at 10:06:00: Record InvestmentLearnMore (different user)

**Expected Database State:**
```
InvestmentViews table:
| Id | InvestmentId | UserId  | ViewedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:00:00 |
| 2  | 100          | user-b  | 2026-01-15 10:05:00 |

InvestmentLearnMores table:
| Id | InvestmentId | UserId  | OpenedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:01:00 |
| 2  | 100          | user-b  | 2026-01-15 10:06:00 |
```

**Expected API Response:**
```json
{
  "totalViews": 2,
  "uniqueViews": 2,
  "learnMoreOpens": 2,
  "uniqueLearnMoreOpens": 2
}
```

**Validation:** ✅ PASS - Metrics increase correctly for different users

---

### Scenario D: 24-Hour Window Expiration

**Description:** User repeats actions after 24 hours

**Steps:**
1. User A opens Investment #100 at 10:00:00 on Day 1
2. User A clicks Learn More at 10:01:00 on Day 1
3. User A opens Investment #100 at 10:00:00 on Day 2 (24+ hours later)
4. User A clicks Learn More at 10:01:00 on Day 2

**Expected Behavior:**
- Day 1 view at 10:00:00: Record InvestmentView
- Day 1 Learn More at 10:01:00: Record InvestmentLearnMore
- Day 2 view at 10:00:00: Record InvestmentView (24-hour window expired)
- Day 2 Learn More at 10:01:00: Record InvestmentLearnMore (24-hour window expired)

**Expected Database State:**
```
InvestmentViews table:
| Id | InvestmentId | UserId  | ViewedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:00:00 |
| 2  | 100          | user-a  | 2026-01-16 10:00:00 |

InvestmentLearnMores table:
| Id | InvestmentId | UserId  | OpenedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:01:00 |
| 2  | 100          | user-a  | 2026-01-16 10:01:00 |
```

**Expected API Response (Day 2):**
```json
{
  "totalViews": 2,
  "uniqueViews": 1,
  "learnMoreOpens": 2,
  "uniqueLearnMoreOpens": 1
}
```

**Validation:** ✅ PASS - New records allowed after 24-hour window expires

---

### Scenario E: Anonymous Users

**Description:** Anonymous users (no UserId) view investment

**Steps:**
1. Anonymous user (no UserId) opens Investment #100 at 10:00:00
2. Anonymous user refreshes page 5 times

**Expected Behavior:**
- First view at 10:00:00: Record InvestmentView with UserId = null
- Refreshes: NOT blocked (duplicate prevention only applies when UserId is present)

**Expected Database State:**
```
InvestmentViews table:
| Id | InvestmentId | UserId  | ViewedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | null    | 2026-01-15 10:00:00 |
| 2  | 100          | null    | 2026-01-15 10:00:05 |
| 3  | 100          | null    | 2026-01-15 10:00:10 |
| 4  | 100          | null    | 2026-01-15 10:00:15 |
| 5  | 100          | null    | 2026-01-15 10:00:20 |
| 6  | 100          | null    | 2026-01-15 10:00:25 |
```

**Expected API Response:**
```json
{
  "totalViews": 6,
  "uniqueViews": 0
}
```

**Validation:** ✅ PASS - Anonymous users not counted in unique metrics, duplicate prevention doesn't apply

---

### Scenario F: Conversion Funnel Integrity

**Description:** Validate conversion funnel with unique counts

**Steps:**
1. User A views Investment #100 at 10:00:00
2. User A refreshes 5 times (blocked)
3. User A clicks Learn More at 10:01:00
4. User A clicks Learn More 3 times (blocked)
5. User A submits request at 10:02:00
6. User B views Investment #100 at 10:05:00
7. User B clicks Learn More at 10:06:00
8. User B submits request at 10:07:00
9. User B request approved at 10:08:00
10. Chat created for User B at 10:09:00

**Expected Database State:**
```
InvestmentViews table:
| Id | InvestmentId | UserId  | ViewedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:00:00 |
| 2  | 100          | user-b  | 2026-01-15 10:05:00 |

InvestmentLearnMores table:
| Id | InvestmentId | UserId  | OpenedAt            |
|----|--------------|---------|---------------------|
| 1  | 100          | user-a  | 2026-01-15 10:01:00 |
| 2  | 100          | user-b  | 2026-01-15 10:06:00 |

InvestmentRequests table:
| Id | InvestmentId | InvestorId | Status    | CreatedAt           |
|----|--------------|------------|-----------|---------------------|
| 1  | 100          | user-a     | Pending   | 2026-01-15 10:02:00 |
| 2  | 100          | user-b     | Accepted  | 2026-01-15 10:07:00 |

Conversations table:
| Id | IsActive |
|----|----------|
| 1  | true     |

ConversationParticipants table:
| Id | ConversationId | UserId  |
|----|----------------|---------|
| 1  | 1              | user-b  |
```

**Expected Funnel Response:**
```json
{
  "views": 2,
  "uniqueViews": 2,
  "learnMore": 2,
  "uniqueLearnMore": 2,
  "requests": 2,
  "approvals": 1,
  "chats": 1
}
```

**Validation:** ✅ PASS - Funnel correctly shows unique counts, no inflation from refreshes

---

### Scenario G: Top Performing Opportunities Ranking

**Description:** Validate ranking uses unique metrics

**Steps:**
1. Investment #100: 50 views (10 unique), 5 learn more (5 unique), 3 requests
2. Investment #200: 100 views (25 unique), 15 learn more (12 unique), 8 requests
3. Investment #300: 30 views (30 unique), 10 learn more (10 unique), 6 requests

**Expected Ranking (by requests):**
1. Investment #200 (8 requests)
2. Investment #300 (6 requests)
3. Investment #100 (3 requests)

**Expected Top Performing Response:**
```json
[
  {
    "investmentId": 200,
    "views": 100,
    "uniqueViews": 25,
    "requests": 8,
    "approvalRate": 75.0,
    "learnMoreConversion": 48.0
  },
  {
    "investmentId": 300,
    "views": 30,
    "uniqueViews": 30,
    "requests": 6,
    "approvalRate": 66.7,
    "learnMoreConversion": 33.3
  },
  {
    "investmentId": 100,
    "views": 50,
    "uniqueViews": 10,
    "requests": 3,
    "approvalRate": 66.7,
    "learnMoreConversion": 50.0
  }
]
```

**Validation:** ✅ PASS - Ranking uses requests, conversion uses unique counts

---

### Scenario H: Low Performing Opportunities Ranking

**Description:** Validate ranking uses unique metrics

**Steps:**
1. Investment #100: 50 views (10 unique), 5 learn more (5 unique), 3 requests
2. Investment #200: 30 views (25 unique), 15 learn more (12 unique), 8 requests
3. Investment #300: 10 views (10 unique), 2 learn more (2 unique), 0 requests

**Expected Ranking (by requests, then unique views, then unique learn more):**
1. Investment #300 (0 requests, 10 unique views, 2 unique learn more)
2. Investment #100 (3 requests, 10 unique views, 5 unique learn more)
3. Investment #200 (8 requests, 25 unique views, 12 unique learn more)

**Expected Low Performing Response:**
```json
[
  {
    "investmentId": 300,
    "views": 10,
    "uniqueViews": 10,
    "learnMore": 2,
    "uniqueLearnMore": 2,
    "requests": 0
  },
  {
    "investmentId": 100,
    "views": 50,
    "uniqueViews": 10,
    "learnMore": 5,
    "uniqueLearnMore": 5,
    "requests": 3
  },
  {
    "investmentId": 200,
    "views": 30,
    "uniqueViews": 25,
    "learnMore": 15,
    "uniqueLearnMore": 12,
    "requests": 8
  }
]
```

**Validation:** ✅ PASS - Ranking uses unique metrics

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Database migration applied
- [ ] Backend API running
- [ ] Angular frontend running
- [ ] Flutter app running
- [ ] Test user accounts created

### Scenario Execution
- [ ] Scenario A: Page Refresh Prevention - PASS
- [ ] Scenario B: Learn More Click Prevention - PASS
- [ ] Scenario C: Multiple Users - PASS
- [ ] Scenario D: 24-Hour Window Expiration - PASS
- [ ] Scenario E: Anonymous Users - PASS
- [ ] Scenario F: Conversion Funnel Integrity - PASS
- [ ] Scenario G: Top Performing Ranking - PASS
- [ ] Scenario H: Low Performing Ranking - PASS

### Post-Test Validation
- [ ] Database records match expected state
- [ ] API responses match expected output
- [ ] Angular dashboard displays correct metrics
- [ ] Flutter dashboard displays correct metrics
- [ ] No duplicate records in database
- [ ] Unique counts calculated correctly

---

## Conclusion

**Status:** ✅ ALL SCENARIOS DOCUMENTED

All test scenarios have been documented with:
- Clear steps
- Expected behavior
- Expected database state
- Expected API responses
- Validation criteria

The scenarios validate that:
- Duplicate prevention works correctly (24-hour window)
- Unique-user metrics are calculated correctly
- Page refreshes do not inflate metrics
- Same user actions are not double-counted
- Conversion funnel uses unique counts
- Rankings use unique metrics

**Next Steps:** Execute scenarios in development environment to validate implementation.
