import 'dart:developer';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:ui' as ui;
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:salon_2/localization/locale_constant.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_screen_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';
import 'routes/app_pages.dart';

FirebaseMessaging? messaging;
FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
String? fcmToken;
String? currency;
String? currentEarning;

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
  log('Message data: ${message.data}');

  if (message.notification != null) {
    log('Message also contained a notification: ${message.notification}');
  }

  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  flutterLocalNotificationsPlugin?.initialize(
    const InitializationSettings(android: initializationSettingsAndroid),
  );

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

  if (message.notification != null && !kIsWeb) {
    await flutterLocalNotificationsPlugin?.show(
      message.hashCode,
      message.notification!.title.toString(),
      message.notification!.body.toString(),
      platformChannelSpecifics,
      payload: 'Custom_Sound',
    );
  } else {
    log('Handling background notification: ${message.data}');
  }
}

Future<void> main() async {
  RenderErrorBox.backgroundColor = Colors.transparent;
  RenderErrorBox.textStyle = ui.TextStyle(color: Colors.transparent);

  SplashScreenController splashScreenController =
      Get.put(SplashScreenController());

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Container();
  };

  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  FlutterError.onError = (errorDetails) {
    FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  };

  /// Currency
  await splashScreenController.onSettingApiCall();
  currency = splashScreenController.settingCategory?.setting?.currencySymbol.toString();

  ///************** FCM token ************************\\\
  try {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.getToken().then((value) {
      fcmToken = value??'';
      log("Fcm Token :: $fcmToken");
    });
  } catch (e) {
    log("Error FCM token: $e");
  }
  log("FCM Token :: $fcmToken");
  FirebaseMessaging.onBackgroundMessage(backgroundNotification);

  /// For Cover Safe Area
  SystemChrome.setSystemUIOverlayStyle(
    SystemUiOverlayStyle.light.copyWith(statusBarColor: AppColors.primaryAppColor),
  );

  /// Preference
  await Preference().instance();

  WidgetsFlutterBinding.ensureInitialized();
  await GetStorage.init();
  runApp(
    const MyApp(),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

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
        defaultTransition: Transition.fade,
        fallbackLocale:
            const Locale(Constant.languageEn, Constant.countryCodeEn),
        transitionDuration: const Duration(milliseconds: 200),
        initialRoute: AppRoutes.initial,
        getPages: AppPages.list,
        title: "Salon",
      ),
    );
  }
}