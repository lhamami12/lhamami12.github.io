import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'ad_config.dart';

/// Gathers UMP consent, initializes the Mobile Ads SDK and keeps one
/// interstitial and one rewarded ad preloaded.
class AdsManager {
  InterstitialAd? _interstitial;
  RewardedAd? _rewarded;
  bool _initialized = false;
  bool _showing = false;

  /// Requests consent information (and shows the consent form when the user
  /// is in a region that requires it), then starts the SDK if ads may be
  /// requested.
  Future<void> init() async {
    final done = Completer<void>();
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(),
      () async {
        await ConsentForm.loadAndShowConsentFormIfRequired((FormError? error) {
          if (error != null) debugPrint('Consent form error: ${error.message}');
        });
        if (!done.isCompleted) done.complete();
      },
      (FormError error) {
        debugPrint('Consent info update failed: ${error.message}');
        if (!done.isCompleted) done.complete();
      },
    );
    await done.future;
    await _startIfAllowed();
  }

  Future<void> _startIfAllowed() async {
    if (_initialized || !await ConsentInformation.instance.canRequestAds()) return;
    _initialized = true;
    await MobileAds.instance.initialize();
    _loadInterstitial();
    _loadRewarded();
  }

  void _loadInterstitial() {
    InterstitialAd.load(
      adUnitId: AdConfig.interstitialUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) => _interstitial = ad,
        onAdFailedToLoad: (error) {
          debugPrint('Interstitial failed to load: $error');
          _interstitial = null;
          Future.delayed(const Duration(seconds: 30), _loadInterstitial);
        },
      ),
    );
  }

  void _loadRewarded() {
    RewardedAd.load(
      adUnitId: AdConfig.rewardedUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) => _rewarded = ad,
        onAdFailedToLoad: (error) {
          debugPrint('Rewarded failed to load: $error');
          _rewarded = null;
          Future.delayed(const Duration(seconds: 30), _loadRewarded);
        },
      ),
    );
  }

  /// Shows the preloaded interstitial. Completes with true once it has been
  /// dismissed, or false if no ad was ready.
  Future<bool> showInterstitial() {
    final ad = _interstitial;
    if (ad == null || _showing) return Future.value(false);
    _interstitial = null;
    _showing = true;
    final result = Completer<bool>();
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _showing = false;
        _loadInterstitial();
        result.complete(true);
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _showing = false;
        _loadInterstitial();
        result.complete(false);
      },
    );
    ad.show();
    return result.future;
  }

  /// Shows the preloaded rewarded ad. Completes with true only if the user
  /// earned the reward.
  Future<bool> showRewarded() {
    final ad = _rewarded;
    if (ad == null || _showing) return Future.value(false);
    _rewarded = null;
    _showing = true;
    var earned = false;
    final result = Completer<bool>();
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _showing = false;
        _loadRewarded();
        result.complete(earned);
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _showing = false;
        _loadRewarded();
        result.complete(false);
      },
    );
    ad.show(onUserEarnedReward: (_, _) => earned = true);
    return result.future;
  }

  /// Shows the UMP privacy options form when the user's region requires one.
  /// Completes with false when no form is required.
  Future<bool> showPrivacyOptions() async {
    final status = await ConsentInformation.instance.getPrivacyOptionsRequirementStatus();
    if (status != PrivacyOptionsRequirementStatus.required) return false;
    final done = Completer<bool>();
    await ConsentForm.showPrivacyOptionsForm((FormError? error) {
      done.complete(error == null);
    });
    final ok = await done.future;
    await _startIfAllowed();
    return ok;
  }
}
