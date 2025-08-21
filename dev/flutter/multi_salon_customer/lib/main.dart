import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:country_code_picker/country_code_picker.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:ui' as ui;
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/routes/app_pages.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';
import 'localization/locale_constant.dart';

FirebaseMessaging? messaging;
FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
String? fcmToken;
LocationPermission? permission;
Position? position;
double? latitude;
double? longitude;
String? country;
String? countryCode;
String? city;
String? dialCode;

String? currency;
String? currencyName;
String? privacyPolicyLink;
String? tnc;
String? razorPayId;
String? flutterWaveKey;
String? stripePublishableKey;
String? stripeSecretKey;
bool? isStripePay;
bool? isRazorPay;
bool? isFlutterWave;

num? adminCommissionCharges;
num? cancelOrderCharges;
num? walletAmount;
int? cartItemCount;

// SSL Certificate Bypass for HTTPS requests
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

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
  log('Got a message!');
  log('Message data :: ${message.data}');

  if (message.notification != null) {
    log('Message Contained a Notification :: ${message.notification?.body}');
  }

  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  flutterLocalNotificationsPlugin?.initialize(
    const InitializationSettings(android: initializationSettingsAndroid),
  );

  var androidPlatformChannelSpecifics = const AndroidNotificationDetails(
    '0',
    'Multi Salon Customer',
    channelDescription: 'hello',
    importance: Importance.max,
    icon: '@mipmap/ic_launcher',
    priority: Priority.high,
  );

  var platformChannelSpecifics = NotificationDetails(
    android: androidPlatformChannelSpecifics,
  );

  if (message.notification != null && !kIsWeb) {
    if (Constant.storage.read("notification") == true) {
      await flutterLocalNotificationsPlugin?.show(
        message.hashCode,
        message.notification!.title.toString(),
        message.notification!.body.toString(),
        platformChannelSpecifics,
        payload: 'Custom_Sound',
      );
    } else {
      log("Notification Permission not allowed");
    }
  } else {
    log('Handling background notification :: ${message.data}');
  }
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

    // Get city name using reverse geocoding
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        city = placemarks.first.locality ??
            placemarks.first.subAdministrativeArea ??
            "Unknown City";
        country = placemarks.first.country;
        countryCode = placemarks.first.isoCountryCode;
        log("City :: $city");
        log("Country :: $country");
        log("Country Code :: $countryCode");
      } else {
        city = "Unknown City";
        log("City :: $city (no placemarks found)");
      }
    } catch (e) {
      log("Error getting city from coordinates: $e");
      city = "Unknown City";
    }

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
  // Set global HTTP overrides to bypass SSL certificate verification
  HttpOverrides.global = MyHttpOverrides();

  RenderErrorBox.backgroundColor = Colors.transparent;
  RenderErrorBox.textStyle = ui.TextStyle(color: Colors.transparent);

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Container();
  };

  try {
    WidgetsFlutterBinding.ensureInitialized();

    // Initialize Firebase with error handling
    try {
      await Firebase.initializeApp();
      log("Firebase initialized successfully");
    } catch (e) {
      log("Error initializing Firebase: $e");
      // Continue without Firebase if it fails
    }

    await GetStorage.init();

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

    // Initialize location with error handling
    try {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        log('Location permissions are denied');
      }

      position = await getDeviceLocation();
    } catch (e) {
      log("Error initializing location: $e");
      // Continue without location if it fails
    }

    // Get dial code with error handling
    try {
      getDialCode();
    } catch (e) {
      log("Error getting dial code: $e");
      dialCode = "+91"; // Default fallback
    }

    /// For Cover Safe Area
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light
        .copyWith(statusBarColor: Colors.transparent));

    /// Preference
    await Preference().instance();
    runApp(const MyApp());
  } catch (e) {
    log("Error in main initialization: $e");
    // Still run the app even if some initialization fails
    WidgetsFlutterBinding.ensureInitialized();
    await GetStorage.init();
    runApp(const MyApp());
  }
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
