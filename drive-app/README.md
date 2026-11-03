# City Driver 3D — تطبيق أندرويد

لعبة قيادة في زحمة المدينة: 20 مهمة (سباق مع الوقت، تجاوز، احترام القانون والإشارات، وصول وركن، توفير الوقود)، نهار وغروب وليل، 7 سيارات، بالعربية والإنجليزية والفرنسية.

هذا المجلد يحوّل لعبة `../drive` إلى تطبيق أندرويد باستخدام **Capacitor 8**، مع إعلانات **AdMob**.
اللعبة نفسها توجد في `../drive/index.html`؛ أي تعديل تفعله هناك يظهر في الويب وفي التطبيق بعد `npm run sync`.

## 📱 بدون حاسوب: البناء على GitHub (مُستحسن)

كل تعديل يُرفع إلى المستودع في `drive/` أو `drive-app/` يبني التطبيق تلقائيًا على GitHub Actions (مجانًا).

**تجربة التطبيق على هاتفك:**
1. افتح <https://github.com/lhamami12/lhamami12.github.io/actions> (في المتصفح، مسجّل الدخول).
2. افتح آخر تشغيل باسم **City Driver 3D build** فيه علامة ✅.
3. في الأسفل، قسم **Artifacts**، حمّل `city-driver-3d-test-apk` (ملف zip).
4. افتح الـzip واضغط على `app-debug.apk` لتثبيته (اسمح بـ«تثبيت تطبيقات من مصادر غير معروفة»).

**ملف النشر الموقّع (AAB) لـ Google Play:**
السرّ `KEYSTORE_PASSWORD` نفسه المستعمل لتطبيق Arrow Escape يكفي (إن كان موجودًا في
**Settings ← Secrets and variables ← Actions**). في أول بناء موقّع يُنشأ مفتاح رفع خاص بهذا التطبيق
ويُحفظ **مشفّرًا** في `drive-app/signing/upload-keystore.jks.enc`، ثم حمّل `city-driver-3d-release`:
فيه `app-release.aab` (ارفعه إلى Google Play) و`app-release.apk`.

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
4. في `../drive/index.html` ابحث عن `ADS_LIVE`:
   - ضع رقمي الوحدتين (يحتويان على `/`) في `AD_LIVE`
   - غيّر `const ADS_LIVE = false;` إلى `const ADS_LIVE = true;`

ثم ارفع التعديل، وسيبني GitHub نسخة جديدة.

> إذا نسيت تعبئة `AD_LIVE` يبقى التطبيق على إعلانات الاختبار بدل أن يتعطل.
> ⚠️ لا تضغط أبدًا على إعلاناتك الحقيقية بنفسك، فهذا قد يوقف حساب AdMob. أضف هاتفك كـ **Test device** في إعدادات AdMob.

## أين تظهر الإعلانات

| النوع | متى |
|---|---|
| **بين المهام** (Interstitial) | عند مغادرة شاشة النتيجة فقط، أبدًا أثناء القيادة. ليس في المهمتين الأوليين، ومرة كل 3 نتائج ودقيقتين ونصف على الأقل. |
| **بمكافأة** (Rewarded، باختيار اللاعب) | «ضاعف العملات» بعد الفوز، «أكمل المهمة» بعد الخسارة (مرة واحدة: يصلح السيارة، أو +25 ثانية، أو وقود، أو يمحو المخالفات)، و«+100 🪙 مجانًا» في المرآب. |
| **موافقة أوروبا** | نموذج UMP من Google عند أول تشغيل، وزر «خيارات الخصوصية للإعلانات» في الإعدادات عند الحاجة. |

على الويب (GitHub Pages) لا تظهر أي إعلانات ولا أزرار إعلانات.
لتجربة مسارات الإعلانات في المتصفح بدون هاتف: افتح `../drive/index.html?ads=test` (إعلان وهمي بعدّاد 3 ثوانٍ).

## في Google Play Console

- **اسم الحزمة** هو `com.citydriver3d.jeux`. لا يمكن تغييره بعد أول رفع. إن أردت اسمًا آخر غيّره في `capacitor.config.json` و`android/app/build.gradle` (و`MainActivity.java`) قبل أول رفع.
- **سياسة الخصوصية**: `https://lhamami12.github.io/drive/privacy.html`
- **Ads**: نعم، التطبيق يحتوي على إعلانات.
- **Target audience**: 13 سنة فما فوق (لا تختر الأطفال).
- **Data safety**: البيانات تُجمع عن طريق AdMob: *Device or other IDs* و *App interactions* و *Diagnostics*، لأغراض الإعلانات والتحليلات، مشفّرة أثناء النقل. لا تسجيل دخول.
- **Website** في صفحة المتجر: `https://lhamami12.github.io` (لأن ملف `app-ads.txt` موجود هناك).

## على الحاسوب (اختياري)

يحتاج **Node.js 20+** و **Android Studio**.

```bash
cd lhamami12.github.io/drive-app
npm install
npm run sync      # ينسخ اللعبة إلى التطبيق (بعد أي تعديل في ../drive)
npm run open      # يفتح المشروع في Android Studio ثم ▶️ Run
```

- الأيقونة وشاشة البداية وصورة المتجر: `node scripts/make-art.cjs` يرسمها من اللعبة نفسها (يحتاج Playwright وخادمًا محليًا: `python3 -m http.server 8765` من جذر المستودع)، ثم `npm run assets` يولّد كل المقاسات.
- صور المتجر: `node store/make-screenshots.cjs` (عربي، إنجليزي، فرنسي).
