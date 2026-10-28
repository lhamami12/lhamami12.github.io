import 'package:flutter/foundation.dart';

/// AdMob ad unit IDs.
///
/// Release builds (the ones uploaded to Google Play) use the real Bonbon Pop
/// ad units. Debug builds use Google's official test units, so development
/// never shows (or clicks) real ads.
/// https://developers.google.com/admob/android/test-ads
///
/// The AdMob App ID is set in `android/app/build.gradle.kts` (`admobAppId`).
class AdConfig {
  static const _realInterstitial = 'ca-app-pub-3524601599534787/5858561754';
  static const _realRewarded = 'ca-app-pub-3524601599534787/6367943620';
  static const _testInterstitial = 'ca-app-pub-3940256099942544/1033173712';
  static const _testRewarded = 'ca-app-pub-3940256099942544/5224354917';

  static const interstitialUnitId = kReleaseMode ? _realInterstitial : _testInterstitial;
  static const rewardedUnitId = kReleaseMode ? _realRewarded : _testRewarded;
}
