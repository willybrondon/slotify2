# Prevent R8 from failing on missing annotations used by Razorpay
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers

# Flutter
-keep class io.flutter.** { *; }
-dontwarn io.flutter.embedding.**

# Kotlin
-keep class kotlin.Metadata { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Stripe
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# Branch SDK
-keep class io.branch.** { *; }
-dontwarn io.branch.**

# React Native (in case used via packages)
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
