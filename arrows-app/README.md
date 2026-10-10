# Arrow Escape — تطبيق أندرويد

هذا المجلد يحوّل لعبة `../arrows` إلى تطبيق أندرويد باستخدام **Capacitor 8**، مع إعلانات **AdMob** وتقييم داخل التطبيق.
اللعبة نفسها توجد في `../arrows/index.html`؛ أي تعديل تفعله هناك يظهر في الويب وفي التطبيق بعد `npm run sync`.

## ما الذي تحتاجه على حاسوبك

- **Node.js** الإصدار 20 أو أحدث: <https://nodejs.org>
- **Android Studio** (أحدث إصدار): <https://developer.android.com/studio>
- هاتف أندرويد مع تفعيل **خيارات المطوّر ← تصحيح USB**، أو محاكي من Android Studio.

## 1) أول تشغيل

```bash
git clone https://github.com/lhamami12/lhamami12.github.io.git
cd lhamami12.github.io/arrows-app
npm install
npm run sync     # ينسخ اللعبة إلى التطبيق ويحدّث الإضافات
npm run open     # يفتح المشروع في Android Studio
```

في Android Studio انتظر حتى ينتهي **Gradle Sync**، ثم اختر هاتفك واضغط ▶️ **Run**.

## 2) إعلانات AdMob: تجريبية أولًا، ثم حقيقية

التطبيق يعرض حاليًا **إعلانات الاختبار من Google** (عليها علامة "Test Ad" ولا تربح منها شيئًا).
اتركها كذلك طوال **الاختبار المغلق**: لا خطر على حسابك إذا ضغط المختبرون عليها، وكل مسارات الإعلانات تعمل كما في النسخة النهائية.

**عند الانتقال إلى النشر للجميع (Production):**

1. في <https://admob.google.com>: **Apps ← Add app ← Android**، واربطه بالتطبيق في Google Play.
2. أنشئ وحدتين إعلانيتين: **Rewarded** و **Interstitial**.
3. ضع **App ID** (يحتوي على `~`) في
   `android/app/src/main/res/values/strings.xml` ← `admob_app_id`
4. في `../arrows/index.html` ابحث عن `ADS_LIVE`:
   - ضع رقمي الوحدتين (يحتويان على `/`) في `AD_LIVE`
   - غيّر `const ADS_LIVE=false;` إلى `const ADS_LIVE=true;`
5. نفّذ `npm run sync`، زِد `versionCode`، وابنِ ملف AAB جديدًا.

> إذا نسيت تعبئة `AD_LIVE` يبقى التطبيق على إعلانات الاختبار بدل أن يتعطل.
> ⚠️ لا تضغط أبدًا على إعلاناتك الحقيقية بنفسك، فهذا قد يوقف حساب AdMob. أضف هاتفك كـ **Test device** في إعدادات AdMob.

## 3) بناء ملف النشر (AAB)

1. في `android/app/build.gradle` زِد `versionCode` بواحد عند كل رفع جديد، وغيّر `versionName` (مثل `"1.1"`).
2. في Android Studio: **Build ← Generate Signed App Bundle / APK ← Android App Bundle**.
3. أول مرة اختر **Create new…** لإنشاء مفتاح التوقيع (keystore).
   **احتفظ بملف المفتاح وكلمة السر في مكان آمن** (نسخة على Google Drive مثلًا). بدونه لا يمكنك تحديث التطبيق أبدًا.
4. اختر **release** ← **Create**. الملف يظهر في `android/app/release/app-release.aab`.

## 4) في Google Play Console

- **اسم الحزمة** هو `com.arrowescape.game`. لا يمكن تغييره بعد أول رفع. إن أردت اسمًا آخر غيّره في `capacitor.config.json` و`android/app/build.gradle` قبل أول رفع.
- **سياسة الخصوصية**: `https://lhamami12.github.io/arrows/privacy.html`
- **Ads**: نعم، التطبيق يحتوي على إعلانات.
- **Target audience**: 13 سنة فما فوق (لا تختر الأطفال).
- **Data safety**: البيانات تُجمع عن طريق AdMob:
  - *Device or other IDs* (معرّف الإعلانات): لأغراض الإعلانات والتحليلات، غير اختيارية، مشفّرة أثناء النقل.
  - *App interactions* و *Diagnostics*: لنفس الأغراض.
  - لا تُشارَك أي بيانات أخرى، ولا يوجد تسجيل دخول.
- **Website** في صفحة المتجر: `https://lhamami12.github.io` (لأن ملف `app-ads.txt` موجود هناك، وAdMob يتحقق منه).
- الحسابات الشخصية الجديدة تحتاج **اختبارًا مغلقًا مع 12 مختبرًا لمدة 14 يومًا** قبل النشر للجميع.

## ما الموجود في التطبيق

| الميزة | التفاصيل |
|---|---|
| الإعلانات | إعلانات بمكافأة (تلميح، برق، قلب إضافي، مضاعفة العملات، +15 ثانية، مضاعفة المكافأة اليومية) وإعلان بين المستويات (ليس قبل المستوى 7، ومرة كل 3 لوحات ودقيقتين ونصف على الأقل). |
| موافقة أوروبا | نموذج UMP من Google عند أول تشغيل، وزر «خيارات خصوصية الإعلانات» في الإعدادات. |
| الحفظ | localStorage + Capacitor Preferences (لا يضيع التقدم إذا مسح أندرويد ذاكرة WebView). |
| زر الرجوع | يغلق النافذة المفتوحة ← يرجع للرئيسية ← يخرج من التطبيق. |
| الإيقاف المؤقت | الصوت ومؤقت سباق الوقت يتوقفان عند الخروج من التطبيق أو أثناء الإعلان. |
| التقييم | نافذة تقييم Google Play الرسمية بعد المستويات 12 و40 و100 (مرة واحدة لكل منها). |
| بدون إنترنت | الخط مضمّن؛ اللعبة تعمل كاملة بدون اتصال (الإعلانات فقط تحتاج الإنترنت). |

## أوامر مفيدة

```bash
npm run sync      # بعد أي تعديل في ../arrows
npm run open      # فتح Android Studio
npm run assets    # إعادة توليد الأيقونة وشاشة البداية من مجلد assets/
```

لتجربة الإعلانات في المتصفح بدون هاتف: افتح `../arrows/index.html?ads=test`.
