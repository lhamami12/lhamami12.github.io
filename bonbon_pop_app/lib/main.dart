import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'ads_manager.dart';

const _background = Color(0xFF3A1478);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const BonbonPopApp());
}

class BonbonPopApp extends StatelessWidget {
  const BonbonPopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bonbon Pop',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: const Color(0xFF6A22C9), useMaterial3: true),
      home: const GamePage(),
    );
  }
}

/// Hosts the HTML game (assets/game/index.html) in a WebView and bridges its
/// ad requests to the Google Mobile Ads SDK.
///
/// The page sends `{"type": "interstitial" | "rewarded" | "privacy", "id": ...}`
/// through the `AdBridge` JavaScript channel and receives the result through
/// `window.__adResult(id, ok)`.
class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  final _ads = AdsManager();
  late final WebViewController _web;

  @override
  void initState() {
    super.initState();
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(_background)
      ..addJavaScriptChannel('AdBridge', onMessageReceived: _onAdMessage)
      ..setNavigationDelegate(NavigationDelegate(onNavigationRequest: _onNavigation))
      ..loadFlutterAsset('assets/game/index.html');
    final platform = _web.platform;
    if (platform is AndroidWebViewController) {
      platform.setMediaPlaybackRequiresUserGesture(false);
    }
    _ads.init();
  }

  /// Keeps the game inside the WebView and opens web links (e.g. the privacy
  /// policy) in the user's browser.
  NavigationDecision _onNavigation(NavigationRequest request) {
    final uri = Uri.tryParse(request.url);
    if (uri != null && (uri.scheme == 'http' || uri.scheme == 'https')) {
      launchUrl(uri, mode: LaunchMode.externalApplication);
      return NavigationDecision.prevent;
    }
    return NavigationDecision.navigate;
  }

  Future<void> _onAdMessage(JavaScriptMessage message) async {
    String? id;
    var ok = false;
    try {
      final data = jsonDecode(message.message) as Map<String, dynamic>;
      id = data['id'] as String?;
      switch (data['type']) {
        case 'interstitial':
          ok = await _ads.showInterstitial();
        case 'rewarded':
          ok = await _ads.showRewarded();
        case 'privacy':
          ok = await _ads.showPrivacyOptions();
      }
    } catch (e) {
      debugPrint('AdBridge error: $e');
    }
    if (id != null) {
      await _web.runJavaScript('window.__adResult(${jsonEncode(id)}, $ok)');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _background,
      body: SafeArea(child: WebViewWidget(controller: _web)),
    );
  }
}
