# R8 rules for release builds (picked up automatically by the Flutter Gradle plugin).

# Room instantiates the generated database classes (e.g. WorkManager's
# androidx.work.impl.WorkDatabase_Impl, used by the Google Mobile Ads SDK)
# through reflection. Without this rule R8 strips them and the app crashes at
# launch with "Failed to create an instance of androidx.work.impl.WorkDatabase".
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class androidx.work.** { *; }
-keep class androidx.room.** { *; }
