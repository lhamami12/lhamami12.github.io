/// AdMob ad unit IDs.
///
/// These are Google's official **test** IDs: they always serve test ads and
/// never generate revenue. Before publishing for real, replace them with the
/// ad unit IDs from your AdMob account, and replace the App ID in
/// `android/app/build.gradle.kts` (`admobAppId`).
///
/// https://developers.google.com/admob/android/test-ads
class AdConfig {
  static const interstitialUnitId = 'ca-app-pub-3940256099942544/1033173712';
  static const rewardedUnitId = 'ca-app-pub-3940256099942544/5224354917';
}
