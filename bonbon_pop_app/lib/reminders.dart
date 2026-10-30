import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

/// Local "your daily gift is waiting" reminders.
///
/// The game sends fresh texts at every launch, and the reminders are
/// rescheduled for the coming days at 19:00. A player who opens the game every
/// day therefore never sees one; a player who stops gets a few, then none.
class Reminders {
  static const _hour = 19;
  static const _days = [1, 2, 4, 7];

  final _plugin = FlutterLocalNotificationsPlugin();
  Future<void>? _ready;

  Future<void> _init() => _ready ??= () async {
        tzdata.initializeTimeZones();
        try {
          final info = await FlutterTimezone.getLocalTimezone();
          tz.setLocalLocation(tz.getLocation(info.identifier));
        } catch (e) {
          debugPrint('Time zone unavailable, using UTC: $e');
        }
        await _plugin.initialize(
          settings: const InitializationSettings(
            android: AndroidInitializationSettings('ic_stat_notify'),
          ),
        );
      }();

  /// Shows the Android 13+ notification permission prompt (no-op before).
  Future<void> requestPermission() async {
    await _init();
    await _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  /// Replaces the scheduled reminders. [items] holds {title, body} maps;
  /// an empty list just cancels them.
  Future<void> schedule(String channel, List<Map<String, dynamic>> items) async {
    await _init();
    await _plugin.cancelAll();
    if (items.isEmpty) return;
    final now = tz.TZDateTime.now(tz.local);
    final today = tz.TZDateTime(tz.local, now.year, now.month, now.day, _hour);
    final details = NotificationDetails(
      android: AndroidNotificationDetails('daily', channel, icon: 'ic_stat_notify'),
    );
    for (var i = 0; i < _days.length; i++) {
      final item = items[i % items.length];
      await _plugin.zonedSchedule(
        id: i,
        scheduledDate: today.add(Duration(days: _days[i])),
        notificationDetails: details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        title: item['title'] as String?,
        body: item['body'] as String?,
      );
    }
  }
}
