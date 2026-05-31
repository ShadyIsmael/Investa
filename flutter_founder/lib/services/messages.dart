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
