import 'dart:async';
import 'dart:developer';

import 'package:country_code_picker/country_code_picker.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:ui' as ui;
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/routes/app_pages.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';

// import 'package:salon_2/ui/payment/in_app_purchase/in_app_purchase_helper.dart';
// import 'package:in_app_purchase_android/src/in_app_purchase_android_platform_addition.dart';
// import 'package:in_app_purchase_storekit/src/store_kit_wrappers/sk_payment_queue_wrapper.dart';
// import 'package:in_app_purchase_storekit/src/store_kit_wrappers/sk_payment_transaction_wrappers.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';
import 'localization/locale_constant.dart';

FirebaseMessaging? messaging;
FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
String? fcmToken;
String? currency;
LocationPermission? permission;
Position? position;
double? latitude;
double? longitude;
final SplashController splashController = Get.put(SplashController());
String? country;
String? countryCode;
String? dialCode;

getDialCode() {
  CountryCode getCountryDialCode(String countryCode) {
    return CountryCode.fromCountryCode(countryCode);
  }

  CountryCode country = getCountryDialCode(countryCode ?? "IN");
  log("country.Dial code :: ${country.dialCode}");

  dialCode = country.dialCode;
  log("Dial code :: $dialCode");
}

Future<void> backgroundNotification(RemoteMessage message) async {
  FirebaseMessaging messaging = FirebaseMessaging.instance;
  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    announcement: false,
    badge: true,
    carPlay: false,
    criticalAlert: false,
    provisional: false,
    sound: true,
  );

  log("Setting :: $settings");
  log('Got a message whilst in the foreground!');
  log('Message data: ${message.data}');

  if (message.notification != null) {
    log('Message also contained a notification: ${message.notification}');
  }
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  flutterLocalNotificationsPlugin?.initialize(
      const InitializationSettings(android: initializationSettingsAndroid),
      onDidReceiveBackgroundNotificationResponse: (message) {});
  var androidPlatformChannelSpecifics = const AndroidNotificationDetails(
    '0',
    'Salon',
    channelDescription: 'hello',
    importance: Importance.max,
    icon: '@mipmap/ic_launcher',
    priority: Priority.high,
  );

  var platformChannelSpecifics = NotificationDetails(
    android: androidPlatformChannelSpecifics,
  );
  await flutterLocalNotificationsPlugin?.show(
    message.hashCode,
    message.notification!.title.toString(),
    message.notification!.body.toString(),
    platformChannelSpecifics,
    payload: 'Custom_Sound',
  );
}

/// for Get Location
Future<Position> getDeviceLocation() async {
  try {
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    latitude = position.latitude;
    longitude = position.longitude;
    log("Latitude :: $latitude");
    log("Longitude :: $longitude");

    return position;
  } catch (e) {
    log("Error getting location: $e");

    return Position(
      latitude: 0.0,
      longitude: 0.0,
      timestamp: DateTime.now(),
      accuracy: 0.0,
      altitude: 0.0,
      altitudeAccuracy: 0.0,
      heading: 0.0,
      headingAccuracy: 0.0,
      speed: 0.0,
      speedAccuracy: 0.0,
    );
  }
}

Future<void> main() async {
  RenderErrorBox.backgroundColor = Colors.transparent;
  RenderErrorBox.textStyle = ui.TextStyle(color: Colors.transparent);

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Container();
  };

  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await GetStorage.init();

  FlutterError.onError = (errorDetails) {
    FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  };

  /// Currency
  await splashController.onSettingApiCall();
  currency =
      splashController.settingCategory?.setting?.currencySymbol.toString();

  ///************** FCM token ************************\\\
  try {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.getToken().then((value) {
      fcmToken = value ?? '';
      log("Fcm Token :: $fcmToken");
    });
  } catch (e) {
    log("Error FCM token: $e");
  }

  log("FCM Token :: $fcmToken");
  FirebaseMessaging.onBackgroundMessage(backgroundNotification);

  permission = await Geolocator.requestPermission();
  if (permission == LocationPermission.denied) {
    log('Location permissions are denied');
  }

  position = await getDeviceLocation();

  /// For Cover Safe Area
  SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent));

  /// Preference
  await Preference().instance();

  // InAppPurchaseAndroidPlatformAddition.enablePendingPurchases();

  // if (Platform.isIOS) {
  //   final transactions = await SKPaymentQueueWrapper().transactions();
  //
  //   for (SKPaymentTransactionWrapper element in transactions) {
  //     await SKPaymentQueueWrapper().finishTransaction(element);
  //     await SKPaymentQueueWrapper().finishTransaction(element.originalTransaction!);
  //   }
  // }
  // InAppPurchaseHelper().initStoreInfo();
  runApp(
    const MyApp(),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  static final StreamController purchaseStreamController =
      StreamController<PurchaseDetails>.broadcast();

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void didChangeDependencies() {
    getLocale().then((locale) {
      setState(() {
        log("didChangeDependencies Preference Revoked ${locale.languageCode}");
        log("didChangeDependencies GET LOCALE Revoked ${Get.locale!.languageCode}");
        Get.updateLocale(locale);
      });
    });
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScopeNode currentFocus = FocusScope.of(context);
        if (!currentFocus.hasPrimaryFocus &&
            currentFocus.focusedChild != null) {
          currentFocus.focusedChild?.unfocus();
        }
      },
      child: GetMaterialApp(
        debugShowCheckedModeBanner: false,
        locale: const Locale("en"),
        translations: AppLanguages(),
        initialRoute: AppRoutes.initial,
        getPages: AppPages.list,
        title: "Salon",
        defaultTransition: Transition.fade,
        fallbackLocale:
            const Locale(Constant.languageEn, Constant.countryCodeEn),
        transitionDuration: const Duration(milliseconds: 200),
      ),
    );
  }
}
