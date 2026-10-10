#!/usr/bin/env bash
# Installs the release APK on the running emulator, launches it and reports
# whether the app is still alive after 30 s. Prints any crash from logcat and
# saves logcat + a screenshot into smoke/ for the workflow artifacts.
set -u
APK="$1"
PKG=io.github.lhamami12.bonbon_pop
mkdir -p smoke

# Every adb call gets a time limit, so a dead emulator fails the job quickly
# instead of leaving "adb" waiting for a device forever.
adb() { timeout 90 command adb "$@"; }
emulator_alive() {
  if ! timeout 15 command adb get-state >/dev/null 2>&1; then
    echo "RESULT: the emulator stopped responding (emulator problem, not an app crash)"
    exit 1
  fi
}

echo "== AdMob App ID in the APK manifest"
AAPT2=$(ls "$ANDROID_HOME"/build-tools/*/aapt2 | tail -1)
"$AAPT2" dump xmltree --file AndroidManifest.xml "$APK" | grep -A2 "APPLICATION_ID" || echo "APPLICATION_ID NOT FOUND IN MANIFEST"

adb install -r "$APK"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity"
sleep 30
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

if ! adb shell pidof "$PKG" >/dev/null; then
  echo "RESULT: app is NOT running (crashed or closed)"
  exit 1
fi
echo "RESULT: app still running after 30 s"

echo "== Back button on the home screen must open the quit dialog, not close the app"
adb shell input keyevent KEYCODE_BACK
sleep 3
emulator_alive
adb shell screencap -p /sdcard/back.png && adb pull /sdcard/back.png smoke/back.png >/dev/null
if adb shell dumpsys activity activities | grep -E "ResumedActivity|topResumedActivity" | grep -q "$PKG"; then
  echo "RESULT: app still in the foreground after BACK"
else
  echo "RESULT: BACK closed the app"
  exit 1
fi
