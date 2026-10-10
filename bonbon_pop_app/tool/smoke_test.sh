#!/usr/bin/env bash
# Installs the release APK on the running emulator, launches it and reports
# whether the app is still alive after 30 s. Prints any crash from logcat and
# saves logcat + a screenshot into smoke/ for the workflow artifacts.
set -u
APK="$1"
PKG=io.github.lhamami12.bonbon_pop
mkdir -p smoke

echo "== AdMob App ID in the APK manifest"
AAPT2=$(ls "$ANDROID_HOME"/build-tools/*/aapt2 | tail -1)
"$AAPT2" dump xmltree --file AndroidManifest.xml "$APK" | grep -A2 "APPLICATION_ID" || echo "APPLICATION_ID NOT FOUND IN MANIFEST"

adb install -r "$APK"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity"
sleep 30
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png smoke/screen.png >/dev/null
adb logcat -d > smoke/logcat.txt
adb logcat -d -b crash > smoke/crash.txt

echo "== Crash buffer"
cat smoke/crash.txt
echo "== Fatal errors in logcat"
grep -n -A40 "FATAL EXCEPTION\|Fatal signal\|AndroidRuntime" smoke/logcat.txt | head -200
echo "== Flutter / ads log"
grep -E " (flutter|Ads|chromium|UserMessagingPlatform)\b" smoke/logcat.txt | tail -60

if adb shell pidof "$PKG" >/dev/null; then
  echo "RESULT: app still running after 30 s"
else
  echo "RESULT: app is NOT running (crashed or closed)"
  exit 1
fi
