# Quick Reference: Flutter Partner Investment Flow

## Files Modified

### 1. RequestsService Enhancement
**Path:** `lib/services/requests_service.dart`
- Added `createInvestmentRequest()` method
- Added `refreshUserProfile()` helper method
- Integrated with `/api/investment-requests` endpoint

### 2. Engagement Dialog Component
**Path:** `lib/widgets/engagement_confirmation_dialog.dart` (NEW)
- Reusable confirmation dialog
- Shows credit balance and cost
- Professional gradient design

### 3. Investments Screen
**Path:** `lib/screens/investments_screen.dart`
- Updated `_handleEngage()` method
- Added profile refresh before engagement
- Integrated new confirmation dialog

### 4. Investment Info Screen
**Path:** `lib/screens/investment_info_screen.dart`
- Updated `_handleInvest()` method for funding type
- Same pattern as investments_screen.dart

## Usage Example

```dart
// Show engagement confirmation dialog
final confirmed = await showEngagementConfirmationDialog(
  context: context,
  investment: investmentData,
  onConfirm: () async {
    await RequestsService().createInvestmentRequest(
      investment: investmentData,
      amount: 5.0,
      shares: 0,
    );
  },
);

if (confirmed == true) {
  // Show success message
}
```

## Testing Quick Commands

### 1. Run Flutter Analyzer
```bash
cd Flutter_Partner
flutter analyze
```

### 2. Run the App
```bash
flutter run
```

### 3. Check for Formatting Issues
```bash
flutter format lib/
```

### 4. Test Investment Flow
1. Navigate to Investments screen
2. Find a Funding-type investment
3. Click "Invest Now" or engagement button
4. Verify dialog shows current credits
5. Click "Confirm and Proceed"
6. Verify API call and success message

## Key Points

✅ **Profile Refresh:** Happens before showing dialog (ensures fresh credit balance)
✅ **Credit Validation:** Client-side and server-side
✅ **Error Handling:** User-friendly messages with red SnackBar
✅ **Loading States:** Spinner shown during API call
✅ **Design Consistency:** Matches Angular client portal

## Common Issues & Solutions

### Issue: Credits show as 0
**Solution:** Profile refresh fetches from `/api/Profile/me` - check auth token

### Issue: Dialog doesn't show
**Solution:** Ensure `AppState.instance.profile` is not null

### Issue: API call fails
**Solution:** Check `EndpointResolver.instance.selectedApiBaseUrl` and network connectivity

### Issue: Button stays disabled
**Solution:** Verify `Env.engageCreditCost` value and current wallet balance

## Next Steps After Testing

1. Add analytics tracking for engagement events
2. Implement localization (Arabic translation)
3. Add unit tests for `RequestsService.createInvestmentRequest()`
4. Add widget tests for engagement dialog
5. Monitor error rates in production logs
