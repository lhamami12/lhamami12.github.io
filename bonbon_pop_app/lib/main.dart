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
/// `window.__adResult(id, ok)`. It sends "exit" through `AppBridge` to close
/// the app. The Android back button calls `window.__onBack()`, and app
/// lifecycle changes call `window.__onAppState(visible)`.
class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> with WidgetsBindingObserver {
  final _ads = AdsManager();
  late final WebViewController _web;

  @override
  void initState() {
    super.initState();
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(_background)
      ..addJavaScriptChannel('AdBridge', onMessageReceived: _onAdMessage)
      ..addJavaScriptChannel('AppBridge', onMessageReceived: _onAppMessage)
      ..setNavigationDelegate(NavigationDelegate(onNavigationRequest: _onNavigation))
      ..loadFlutterAsset('assets/game/index.html');
    final platform = _web.platform;
    if (platform is AndroidWebViewController) {
      platform.setMediaPlaybackRequiresUserGesture(false);
    }
    WidgetsBinding.instance.addObserver(this);
    _ads.init();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Pauses music and the game when the app goes to the background.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final visible = state == AppLifecycleState.resumed;
    if (visible || state == AppLifecycleState.paused) {
      _web.runJavaScript('window.__onAppState && window.__onAppState($visible)');
    }
  }

  void _onAppMessage(JavaScriptMessage message) {
    if (message.message == 'exit') SystemNavigator.pop();
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
    // The back button is handled by the game: it closes the open window,
    // pauses the level, or asks before leaving.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _web.runJavaScript('window.__onBack && window.__onBack()');
      },
      child: Scaffold(
        backgroundColor: _background,
        body: SafeArea(child: WebViewWidget(controller: _web)),
      ),
    );
  }
}
