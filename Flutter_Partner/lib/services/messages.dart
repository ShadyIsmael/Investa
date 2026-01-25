class AppMessages {
  // Labels
  static const String cancel = 'Cancel';
  static const String confirm = 'Confirm';

  // Profile
  static const String signedOut = 'You have been signed out.';
  static const String profileUpdated = 'Profile updated.';

  // Sharing / favorites
  static const String addedToFavorites = 'Added to favorites.';
  static const String removedFromFavorites = 'Removed from favorites.';
  static const String copiedShareText = 'Copied details to clipboard.';

  // Engage
  static const String engageConfirmTitle = 'Confirm Engage';
  static String engageConfirmContent(int credits) =>
      'Engaging will consume $credits credits. Do you want to continue?';
  static const String engageRequestSent =
      'Request sent — please wait for the founder to accept.';

  // Investment (shared between equity/funding)
  static String investRequestSent(String name) =>
      'Your investment request for $name was submitted. We will notify you once it is accepted.';
  static const String shareInfoUnavailable =
      'Share details are not available for this opportunity right now.';
  static const String shareMinError = 'Shares must be at least 1.';
  static String shareMaxError(int available) =>
      'Maximum $available shares available.';
  static const String sharePriceLabel = 'Share Price';
  static const String sharesAvailableLabel = 'Available';
  static const String numberOfSharesLabel = 'Number of Shares';
  static const String totalInvestmentLabel = 'Total Investment';
  static const String expectedRoiLabel = 'Expected ROI';
  static const String confirmInvestment = 'Confirm Investment';
  static const String processing = 'Processing...';
  static String investIn(String name) => 'Invest in $name';

  // Generic
  static String openFounder(String name) => 'Opening founder: $name';
  static const String noReviews = 'No reviews';

  // New investment
  static const String notAuthenticated = 'Not authenticated — please sign in.';
  static const String investmentSaved = 'Investment saved.';
  static const String failedToSaveInvestment = 'Failed to save investment.';

  // Forgot password
  static const String enterPhone = 'Enter your phone number.';
  static const String passwordResetSent = 'Password reset code sent.';

  // Auth
  static String loginFailed([String? msg]) => msg ?? 'Login failed.';
  static const String invalidCredentials = 'Invalid phone number or password.';
  static const String networkError =
      'Network error — please check your connection.';
  static const String serverError = 'Server error — please try again later.';
}
