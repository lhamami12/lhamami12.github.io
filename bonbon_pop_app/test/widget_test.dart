import 'package:flutter_test/flutter_test.dart';

import 'package:bonbon_pop/ad_config.dart';

void main() {
  test('ad unit ids are AdMob ids', () {
    expect(AdConfig.interstitialUnitId, startsWith('ca-app-pub-'));
    expect(AdConfig.rewardedUnitId, startsWith('ca-app-pub-'));
  });
}
