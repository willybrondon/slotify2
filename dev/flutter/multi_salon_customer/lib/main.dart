import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:app_links/app_links.dart';
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
import 'package:salon_2/services/share_capture_service.dart';
import 'package:salon_2/utils/app_colors.dart';
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

      // Request permission for notifications
      NotificationSettings settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      log("Notification Settings :: $settings");

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        await messaging.getToken().then((value) {
          fcmToken = value ?? '';
          log("Fcm Token :: $fcmToken");
        });
      } else {
        log("Notification permission denied, using empty FCM token");
        fcmToken = '';
      }
    } catch (e) {
      log("Error FCM token: $e");
      fcmToken = '';
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

    // Initialize deep link handling
    _initializeDeepLinks();

    // Share sheet: Instagram, TikTok, Facebook → Skedisy
    ShareCaptureService.init();

    runApp(const MyApp());
  } catch (e) {
    log("Error in main initialization: $e");
    WidgetsFlutterBinding.ensureInitialized();
    await GetStorage.init();
    ShareCaptureService.init();
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

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      ShareCaptureService.onAppResumed();
    }
  }

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
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.brandBlack,
            primary: AppColors.brandBlack,
            onPrimary: AppColors.brandWhite,
            surface: AppColors.brandWhite,
            onSurface: AppColors.brandBlack,
          ),
          scaffoldBackgroundColor: AppColors.brandWhite,
          iconTheme: const IconThemeData(color: AppColors.brandTerracotta),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandBlack,
              foregroundColor: AppColors.brandWhite,
            ),
          ),
        ),
        locale: const Locale(Constant.languageDefault, Constant.countryCodeDefault),
        translations: AppLanguages(),
        initialRoute: AppRoutes.initial,
        getPages: AppPages.list,
        title: "Salon",
        defaultTransition: Transition.fade,
        fallbackLocale:
            const Locale(Constant.languageDefault, Constant.countryCodeDefault),
        transitionDuration: const Duration(milliseconds: 200),
      ),
    );
  }
}

// Global flag to track if deep link / share capture navigation occurred
bool _deepLinkNavigated = false;

void markCaptureNavigated() {
  _deepLinkNavigated = true;
}

// Handle incoming deep links
void _initializeDeepLinks() {
  try {
    final appLinks = AppLinks();

    // Listen for incoming links when app is running
    appLinks.uriLinkStream.listen((uri) {
      log("Deep Link received (app running): $uri");
      _handleIncomingLink(uri);
    }, onError: (err) {
      log("Error handling deep link: $err");
    });

    // Handle link when app is opened from closed state
    appLinks.getInitialLink().then((uri) {
      if (uri != null) {
        log("Deep Link received (app closed): $uri");
        _handleIncomingLink(uri);
      }
    }).catchError((err) {
      log("Error getting initial deep link: $err");
    });
  } catch (e) {
    log("Error initializing deep links: $e");
  }
}

// Getter to check if deep link navigation occurred
bool get deepLinkNavigated => _deepLinkNavigated;

/// Map web/app query ?venue=salon|home|at_salon|at_home → booking screen labels
String? _mapVenueQuery(String? v) {
  if (v == null || v.isEmpty) return null;
  final s = v.toLowerCase().trim();
  if (s == 'salon' || s == 'at_salon' || s == 'atsalon') return 'At Salon';
  if (s == 'home' || s == 'at_home' || s == 'athome') return 'At Home';
  return null;
}

void _handleIncomingLink(Uri uri) {
  try {
    log("Handling incoming link: $uri");

    // skedisy://capture?url=... or slotify://capture — visual booking entry
    if ((uri.scheme == 'skedisy' || uri.scheme == 'slotify') &&
        uri.host == 'capture') {
      final sharedUrl = uri.queryParameters['url'];
      log("Capture deep link: url=$sharedUrl");
      _deepLinkNavigated = true;
      Future.delayed(const Duration(milliseconds: 1000), () {
        ShareCaptureService.openFromDeepLink(url: sharedUrl);
      });
      return;
    }

    // Handle custom scheme: slotify://salon/{salonId}?serviceId=...&venue=salon|home
    if (uri.scheme == 'slotify' && uri.host == 'salon') {
      final salonId = uri.pathSegments.isNotEmpty ? uri.pathSegments[0] : null;
      if (salonId != null && salonId.isNotEmpty) {
        final serviceId = uri.queryParameters['serviceId'];
        final venuePref = _mapVenueQuery(uri.queryParameters['venue']);
        log("Navigating to salon detail: $salonId serviceId=$serviceId venue=$venuePref");
        _deepLinkNavigated = true; // Mark that deep link navigation occurred
        // Wait for app to be ready, then navigate
        Future.delayed(const Duration(milliseconds: 1000), () {
          Get.toNamed(AppRoutes.branchDetail, arguments: [
            salonId,
            null,
            null,
            null,
            serviceId,
            venuePref,
          ]);
        });
        return;
      }
    }

    // Handle App Links/Universal Links
    // New format: https://skedisy.com/salon/{slug-shortId} (e.g., /salon/coiffure-beaute-brasil-6885e2)
    if (uri.scheme == 'https' && uri.host.contains('skedisy.com')) {
      log("App Link detected: $uri");

      // New format: /salon/{slug-shortId} (e.g., /salon/coiffure-beaute-brasil-6885e2)
      if (uri.pathSegments.length >= 2 && uri.pathSegments[0] == 'salon') {
        final slugWithId = uri.pathSegments[1];
        if (slugWithId.isNotEmpty) {
          final parts = slugWithId.split('-');
          if (parts.isNotEmpty) {
            final shortId = parts.last;
            // Short ID should be 6 hex characters
            if (shortId.length == 6 &&
                RegExp(r'^[0-9a-fA-F]{6}$').hasMatch(shortId)) {
              final serviceId = uri.queryParameters['serviceId'];
              final venuePref = _mapVenueQuery(uri.queryParameters['venue']);
              log("Navigating to salon detail from App Link: $slugWithId (shortId: $shortId) serviceId=$serviceId venue=$venuePref");
              _deepLinkNavigated =
                  true; // Mark that deep link navigation occurred
              // Pass the slug to the backend, which will resolve it to full salon ID
              // The backend will handle the lookup by short ID
              Future.delayed(const Duration(milliseconds: 1000), () {
                Get.toNamed(AppRoutes.branchDetail, arguments: [
                  slugWithId,
                  null,
                  null,
                  null,
                  serviceId,
                  venuePref,
                ]);
              });
              return;
            }
          }
        }
      }
    }

    log("No valid salon deep link found in: $uri");
  } catch (e) {
    log("Error handling incoming link: $e");
  }
}
