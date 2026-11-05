# Parking 3D — تطبيق أندرويد

هذا المجلد يحوّل لعبة `../parking` إلى تطبيق أندرويد باستخدام **Capacitor 8**، مع إعلانات **AdMob**.
اللعبة نفسها توجد في `../parking/index.html`؛ أي تعديل تفعله هناك يظهر في الويب وفي التطبيق بعد `npm run sync`.

## 📱 بدون حاسوب: البناء على GitHub (مُستحسن)

كل تعديل يُرفع إلى المستودع في `parking/` أو `parking-app/` يبني التطبيق تلقائيًا على GitHub Actions (مجانًا).

**تجربة التطبيق على هاتفك:**
1. افتح <https://github.com/lhamami12/lhamami12.github.io/actions> (في المتصفح، مسجّل الدخول).
2. افتح آخر تشغيل باسم **Parking 3D build** فيه علامة ✅.
3. في الأسفل، قسم **Artifacts**، حمّل `parking-3d-test-apk` (ملف zip).
4. افتح الـzip واضغط على `app-debug.apk` لتثبيته (اسمح بـ«تثبيت تطبيقات من مصادر غير معروفة»).

**ملف النشر الموقّع (AAB) لـ Google Play:**
يُوقَّع تلقائيًا بنفس مفتاح الرفع الذي يستعمله Bonbon Pop وArrow Escape، أي الأسرار الأربعة الموجودة في
**Settings ← Secrets and variables ← Actions**: `ANDROID_KEYSTORE_BASE64` و`ANDROID_KEYSTORE_PASSWORD`
و`ANDROID_KEY_ALIAS` و`ANDROID_KEY_PASSWORD`. حمّل `parking-3d-release` من صفحة البناء:
فيه `app-release.aab` (ارفعه إلى Google Play) و`app-release.apk`.
لإعطاء هذا التطبيق مفتاحًا خاصًا به، أضف نفس الأسرار الأربعة مع البادئة `PARKING_` (مثل `PARKING_KEYSTORE_BASE64`).

> عند رفع أول AAB في Play Console فعّل **Play App Signing** (يكون مفعّلًا افتراضيًا).
> رقم النسخة (`versionCode`) يزيد تلقائيًا مع كل بناء.

## 💰 إعلانات AdMob: تجريبية الآن، حقيقية لاحقًا

التطبيق يعرض حاليًا **إعلانات الاختبار من Google** (عليها علامة "Test Ad" ولا تربح منها شيئًا).
اتركها كذلك طوال **الاختبار المغلق**: لا خطر على حسابك إذا ضغط المختبرون عليها، وكل مسارات الإعلانات تعمل كما في النسخة النهائية.

**عند الانتقال إلى النشر للجميع (Production)، 4 خطوات فقط:**

1. في <https://admob.google.com>: **Apps ← Add app ← Android**، واربطه بالتطبيق في Google Play.
2. أنشئ وحدتين إعلانيتين: **Interstitial** و **Rewarded**.
3. ضع **App ID** (يحتوي على `~`) في
   `android/app/src/main/res/values/strings.xml` ← `admob_app_id`
4. في `../parking/index.html` ابحث عن `ADS_LIVE`:
   - ضع رقمي الوحدتين (يحتويان على `/`) في `AD_LIVE`
   - غيّر `const ADS_LIVE = false;` إلى `const ADS_LIVE = true;`

ثم ارفع التعديل، وسيبني GitHub نسخة جديدة.

> إذا نسيت تعبئة `AD_LIVE` يبقى التطبيق على إعلانات الاختبار بدل أن يتعطل.
> ⚠️ لا تضغط أبدًا على إعلاناتك الحقيقية بنفسك، فهذا قد يوقف حساب AdMob. أضف هاتفك كـ **Test device** في إعدادات AdMob.

## أين تظهر الإعلانات

| النوع | متى |
|---|---|
| **بين المستويات** (Interstitial) | عند مغادرة شاشة النتيجة فقط، أبدًا أثناء القيادة. ليس في المستويين الأولين، ومرة كل 3 نتائج ودقيقتين ونصف على الأقل. |
| **بمكافأة** (Rewarded، باختيار اللاعب) | «ضاعف العملات» بعد الفوز، «أكمل المستوى» بعد الخسارة (مرة واحدة، يرجع الضرر إلى 3)، و«+100 🪙 مجانًا» في المرآب. |
| **موافقة أوروبا** | نموذج UMP من Google عند أول تشغيل، وزر «خيارات الخصوصية للإعلانات» في الإعدادات عند الحاجة. |

على الويب (GitHub Pages) لا تظهر أي إعلانات ولا أزرار إعلانات.
لتجربة مسارات الإعلانات في المتصفح بدون هاتف: افتح `../parking/index.html?ads=test` (إعلان وهمي بعدّاد 3 ثوانٍ).

## في Google Play Console

- **اسم الحزمة** هو `com.parking3d.jeux`. لا يمكن تغييره بعد أول رفع. إن أردت اسمًا آخر غيّره في `capacitor.config.json` و`android/app/build.gradle` (و`MainActivity.java`) قبل أول رفع.
- **سياسة الخصوصية**: `https://lhamami12.github.io/parking/privacy.html`
- **Ads**: نعم، التطبيق يحتوي على إعلانات.
- **Target audience**: 13 سنة فما فوق (لا تختر الأطفال).
- **Data safety**: البيانات تُجمع عن طريق AdMob: *Device or other IDs* و *App interactions* و *Diagnostics*، لأغراض الإعلانات والتحليلات، مشفّرة أثناء النقل. لا تسجيل دخول.
- **Website** في صفحة المتجر: `https://lhamami12.github.io` (لأن ملف `app-ads.txt` موجود هناك).

## على الحاسوب (اختياري)

يحتاج **Node.js 20+** و **Android Studio**.

```bash
cd lhamami12.github.io/parking-app
npm install
npm run sync      # ينسخ اللعبة إلى التطبيق (بعد أي تعديل في ../parking)
npm run open      # يفتح المشروع في Android Studio ثم ▶️ Run
```

- الأيقونة وشاشة البداية: `node scripts/make-icons.cjs` يرسمهما في `assets/` (يحتاج Playwright)، ثم `npm run assets` يولّد كل المقاسات.
