# Profile Data Mapping & Database Audit

## Data Flow Overview

### 1. Profile Load Flow
```
Backend DB → ProfileService.loadMyProfile() → profile signal → syncProfileToForms() → Form Controls
```

### 2. Profile Save Flow
```
Form Controls → buildProfileUpdatePayload() → ProfileService.updateMyProfile() → Backend DB
```

---

## Data Mapping Matrix

### Profile Form Fields
| Form Field | Backend Mapping | Service Method | Notes |
|---|---|---|---|
| **firstName** | basicInfo.firstName | updateMyProfile | Sent as-is |
| **lastName** | basicInfo.lastName | updateMyProfile | Sent as-is |
| **businessRole** | coreMetrics.clientType OR role | updateMyProfile | Sets both fields |
| **nationalId** | identityCompliance.documentNumber | updateMyProfile | Sent as-is |
| **bio** | basicInfo.bio | updateMyProfile | Sent as-is |
| **linkedinUrl** | basicInfo.linkedInUrl | updateMyProfile | Sent as-is |
| **facebookUrl** | basicInfo.facebookUrl | updateMyProfile | Sent as-is |

### Communication Form Fields
| Form Field | Backend Mapping | Service Method | Notes |
|---|---|---|---|
| **email** | contactInfo.email | updateMyProfile | Editable; has verified badge |
| **mobile** | contactInfo.phone1 | NOT SENT | Disabled (auth-managed); read-only |
| **address** | contactInfo.address | updateMyProfile | Sent as-is |
| **city** | contactInfo.workAddress | updateMyProfile | Mapped from workAddress |
| **state** | contactInfo.phone2 | updateMyProfile | Mapped from phone2 |
| **businessAddress** | contactInfo.workAddress | updateMyProfile | Mapped to workAddress |

---

## API Endpoints

### GET /api/profile/me
**Purpose:** Load user profile data
**Returns:** UserProfile object with all nested properties
**Called by:** `ProfileService.loadMyProfile()`
**When:** Component init, after KYC start, after profile save

### PUT /api/profile/me
**Purpose:** Update profile data
**Payload Structure:**
```typescript
{
  coreMetrics: {
    clientType: string,
    role: string,
    credibilityScore: number,
    currentCredibilityScore: number,
    walletBalance: number,
    email: string
  },
  basicInfo: {
    fullName: string,
    firstName: string,
    lastName: string,
    bio: string,
    avatarUrl: string,
    linkedInUrl: string,
    facebookUrl: string
  },
  contactInfo: {
    email: string,
    phone1: string,
    phone2: string,
    workAddress: string,
    address: string,
    linkedInUrl: string,
    facebookUrl: string
  },
  identityCompliance: {
    documentNumber: string,
    documentExpiryDate: string,
    verificationStatus: string,
    documentFrontImageUrl: string,
    documentBackImageUrl: string
  }
}
```

### POST /api/profile/me/kyc/start
**Purpose:** Initiate KYC process
**Payload:** Empty object
**Returns:** Updated UserProfile with KYC status
**Side Effect:** Awards +10 credibility points

### GET /api/profile/me/credits
**Purpose:** Fetch credibility transaction history
**Returns:** CreditTransaction[]
**Called by:** After profile load, after KYC start

---

## Data Refresh Strategy

### After Profile Save
1. `updateMyProfile()` sends PUT request
2. `loadMyProfile()` reloads fresh data from server
3. `initializeSnapshots()` reinitializes change detection snapshots
4. Forms are marked pristine (save button disables)
5. Success toast is shown

### After Communication Save
1. `updateMyProfile()` sends PUT request
2. `loadMyProfile()` reloads fresh data from server
3. `initializeSnapshots()` reinitializes both profile and communication snapshots
4. Communication form is marked pristine
5. Success toast is shown

### After KYC Start
1. `startKyc()` starts KYC process
2. `loadMyProfile()` reloads profile with new KYC status
3. `getCreditHistory()` fetches updated credibility history
4. Trust score is recalculated (backend credibilityScore updated)
5. Success toast with +10 credibility points message

---

## Known Issues & Fixes Applied

### Issue 1: Forms continuously resetting
**Root Cause:** Effect running on every profile signal change
**Fix:** Condition check `if (!p || this.profileSnapshot())` to sync only once on initial load

### Issue 2: Save button permanently disabled
**Root Cause:** Form values not reactive; change detection computed using .value property directly
**Fix:** Convert form valueChanges to signals using `toSignal()`

### Issue 3: Mobile phone not properly handled
**Root Cause:** Attempted to send disabled field value to backend
**Fix:** Mobile field stays disabled; `buildProfileUpdatePayload()` skips updating phone1

### Issue 4: Save button not detecting changes
**Root Cause:** Snapshots not initialized; computed signals depend on non-reactive data
**Fix:** Initialize snapshots in effect after loading profile data

---

## Current Implementation Status

✅ **COMPLETED:**
- Form field mapping to backend data
- Change detection for save button enable/disable
- Profile data refresh after save
- Communication data refresh after save
- KYC flow with profile reload and credit history update
- Email now editable with verified badge
- Business role and national ID now fully editable
- Mobile phone remains read-only and non-editable

⚠️ **PENDING (For Backend Team):**
- Verify PUT /api/profile/me handles all fields correctly
- Ensure GET /api/profile/me returns complete UserProfile
- Confirm credibility score updates after KYC
- Test workAddress vs phone2 mapping on backend

---

## Testing Checklist

- [ ] Load profile page - all data displays correctly
- [ ] Edit firstName - save button enables
- [ ] Edit businessRole - changes persist after save and reload
- [ ] Edit nationalId - changes persist after save and reload
- [ ] Edit email - changes persist with verified badge showing
- [ ] Edit address/city/state/businessAddress - changes persist after save
- [ ] Start KYC - profile reloads, credit history updates, +10 credibility added
- [ ] Check that mobile field remains disabled and read-only
- [ ] Verify all form values sync from backend on page load
- [ ] Trust score updates correctly after changes

