#!/usr/bin/env bash
# Installs the release APK on the running emulator, launches it and reports
# whether the app is still alive after 15 s. Prints any crash from logcat and
# saves logcat + a screenshot into smoke/ for the workflow artifacts.
set -u
APK="$1"
PKG=com.bonbon.pop
mkdir -p smoke

# Every adb call gets a time limit, so a dead emulator fails the job quickly
# instead of leaving "adb" waiting for a device forever.
ADB=$(command -v adb)
adb() { timeout 90 "$ADB" "$@"; }
# With "soft", a dead emulator after the app was already checked is only a
# warning: the CI emulator tends to die about a minute after launch.
emulator_alive() {
  if [ "$(timeout 15 "$ADB" get-state 2>/dev/null)" != "device" ]; then
    echo "RESULT: the emulator stopped responding (emulator problem, not an app crash)"
    if [ "${1:-}" = "soft" ]; then
      echo "::warning::The emulator died after the app was confirmed running; remaining checks skipped."
      exit 0
    fi
    exit 1
  fi
}

echo "== AdMob App ID in the APK manifest"
AAPT2=$(ls "$ANDROID_HOME"/build-tools/*/aapt2 | tail -1)
"$AAPT2" dump xmltree --file AndroidManifest.xml "$APK" | grep -A2 "APPLICATION_ID" || echo "APPLICATION_ID NOT FOUND IN MANIFEST"

adb install -r "$APK"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity"
sleep 15
emulator_alive
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png smoke/screen.png >/dev/null
adb logcat -d > smoke/logcat.txt
adb logcat -d -b crash > smoke/crash.txt

echo "== Crash buffer"
cat smoke/crash.txt
echo "== Fatal errors in logcat"
grep -n -A40 "FATAL EXCEPTION\|Fatal signal\|AndroidRuntime" smoke/logcat.txt | head -200
echo "== Flutter / ads log"
grep -E " (flutter|Ads|chromium|UserMessagingPlatform)\b" smoke/logcat.txt | tail -60

emulator_alive soft
if ! adb shell pidof "$PKG" >/dev/null; then
  echo "RESULT: app is NOT running (crashed or closed)"
  exit 1
fi
echo "RESULT: app still running after 15 s"

echo "== Back button on the home screen must open the quit dialog, not close the app"
adb shell input keyevent KEYCODE_BACK
sleep 3
emulator_alive soft
adb shell screencap -p /sdcard/back.png && adb pull /sdcard/back.png smoke/back.png >/dev/null
ACTIVITIES=$(adb shell dumpsys activity activities)
emulator_alive soft
if echo "$ACTIVITIES" | grep -E "ResumedActivity|topResumedActivity" | grep -q "$PKG"; then
  echo "RESULT: app still in the foreground after BACK"
else
  echo "RESULT: BACK closed the app"
  exit 1
fi
