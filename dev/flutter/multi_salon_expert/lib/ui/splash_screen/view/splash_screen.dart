import 'dart:developer';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/app_active_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();
  final SplashScreenController splashScreenController =
      Get.find<SplashScreenController>();
  FirebaseMessaging? messaging;
  FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
  bool notificationVisit = false;

  bool _hasNavigated = false;

  bool _isSessionAuthError(String message, {int? statusCode}) {
    if (statusCode == 401 || statusCode == 403) return true;
    final m = message.toLowerCase();
    return m.contains('unauthorized') ||
        m.contains('session expired') ||
        m.contains('token expired') ||
        m.contains('jwt expired') ||
        m.contains('forbidden') ||
        m.contains('not authorized');
  }

  void _navigateFromSplash({required bool toLogin, String? toast}) {
    if (_hasNavigated) return;
    _hasNavigated = true;
    if (toast != null && toast.isNotEmpty) {
      Utils.showToast(Get.context!, toast);
    }
    Get.offAllNamed(toLogin ? AppRoutes.login : AppRoutes.bottom);
  }

  @override
  void initState() {
    super.initState();

    // Fallback si le splash reste bloqué (réseau lent) — ne pas déconnecter.
    Future.delayed(const Duration(seconds: 20), () {
      if (_hasNavigated) return;
      log("Splash screen timeout — fallback navigation");
      final loggedIn = Constant.storage.read<bool>('isLogIn') == true;
      _navigateFromSplash(toLogin: !loggedIn);
    });

    Future.delayed(const Duration(seconds: 3), () async {
      log("Is login check 1 :: ${Constant.storage.read("isLogIn")}");

      try {
        log("Starting setting API call...");
        await splashScreenController.onSettingApiCall();
        log("Setting API call completed. Status: ${splashScreenController.settingCategory?.status}");

        initFirebase();

        if (splashScreenController.settingCategory?.status == true) {
          if (splashScreenController
                  .settingCategory?.setting?.maintenanceMode ==
              true) {
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                  backgroundColor: AppColors.transparent,
                  shadowColor: Colors.transparent,
                  surfaceTintColor: Colors.transparent,
                  elevation: 0,
                  child: const AppActiveDialog()),
            );
          } else {
            if (Constant.storage.read<bool>('isLogIn') == true) {
              log("User is logged in, getting expert data...");
              await loginScreenController.onGetExpertApiCall(
                  expertId:
                      Constant.storage.read<String>("expertId").toString());

              if (loginScreenController.getExpertCategory?.status == true) {
                earning = loginScreenController.getExpertCategory?.data?.earning
                    ?.toStringAsFixed(2);

                Constant.storage.write(
                    'fName',
                    loginScreenController.getExpertCategory?.data?.fname
                        .toString());
                Constant.storage.write(
                    'lName',
                    loginScreenController.getExpertCategory?.data?.lname
                        .toString());
                Constant.storage.write(
                    'hostImage',
                    loginScreenController.getExpertCategory?.data?.image
                        .toString());
                Constant.storage.write(
                    'uniqueID',
                    loginScreenController.getExpertCategory?.data?.uniqueId
                        .toString());
                Constant.storage.write(
                    "salonId",
                    loginScreenController.getExpertCategory?.data?.salonId?.id
                        .toString());

                log("salon Id :: ${Constant.storage.read<String>("salonId")}");
                log("Unique ID :: ${Constant.storage.read<String>("uniqueID")}");
                log("salon Id df:: ${loginScreenController.getExpertCategory?.data?.salonId.toString()}");

                log("Navigating to bottom bar...");
                _navigateFromSplash(toLogin: false);
              } else {
                log("Expert API failed: ${loginScreenController.getExpertCategory?.message}");
                final errorMessage =
                    loginScreenController.getExpertCategory?.message ?? "";
                if (_isSessionAuthError(errorMessage)) {
                  log("Authentication error detected, logging out user");
                  Constant.storage.write('isLogIn', false);
                  _navigateFromSplash(
                    toLogin: true,
                    toast: "Session expired. Please login again.",
                  );
                } else {
                  log("Network or temporary error, keeping user logged in");
                  _navigateFromSplash(toLogin: false);
                }
              }
            } else {
              log("User not logged in, navigating to login...");
              _navigateFromSplash(toLogin: true);
            }
          }
        } else {
          log("Setting API failed: ${splashScreenController.settingCategory?.message}");
          final loggedIn = Constant.storage.read<bool>('isLogIn') == true;
          if (loggedIn) {
            log("Settings API failed but session kept — opening app");
            _navigateFromSplash(toLogin: false);
          } else {
            Utils.showToast(
                Get.context!,
                splashScreenController.settingCategory?.message ??
                    "Failed to load settings");
            _navigateFromSplash(toLogin: true);
          }
        }
      } catch (e) {
        log("Error in splash screen initialization: $e");
        final loggedIn = Constant.storage.read<bool>('isLogIn') == true;
        if (loggedIn) {
          log("Splash error but session kept — opening app");
          _navigateFromSplash(toLogin: false);
        } else {
          _navigateFromSplash(toLogin: true);
        }
      }
    });
  }

  initFirebase() async {
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
    await messaging.getToken().then((value) {
      log("This is FCM token :: $value");
    });

    RemoteMessage? initialMessage =
        await FirebaseMessaging.instance.getInitialMessage();

    if (initialMessage != null) {
      log("NotificationVisit with start :: $notificationVisit");
      notificationVisit = !notificationVisit;
      log("NotificationVisit with SetState :: $notificationVisit");

      if (Constant.storage.read("notification") == true) {
        handleMessage(initialMessage);
      } else {
        log("Notification Permission not allowed");
      }
    }

    FirebaseMessaging.onMessageOpenedApp.listen((event) {
      log("This is event log :: $event");
      if (Constant.storage.read("notification") == true) {
        handleMessage(event);
      } else {
        log("Notification Permission not allowed");
      }
    });

    FirebaseMessaging.onMessage.listen(
      (RemoteMessage message) {
        log('Got a message whilst in the foreground!');
        log('Message data :: ${message.data}');

        if (message.notification != null) {
          log('Message also contained a notification :: ${message.notification}');
        }
        const AndroidInitializationSettings initializationSettingsAndroid =
            AndroidInitializationSettings('@drawable/ic_launcher');
        flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
        flutterLocalNotificationsPlugin?.initialize(
            const InitializationSettings(
                android: initializationSettingsAndroid),
            onDidReceiveNotificationResponse: (payload) {
          log("payload is:- $payload");

          if (Constant.storage.read("notification") == true) {
            handleMessage(message);
          } else {
            log("Notification Permission not allowed");
          }
        });

        if (Constant.storage.read("notification") == true) {
          showNotificationWithSound(message);
        } else {
          log("Notification Permission not allowed");
        }
      },
    );
  }

  Future<void> handleMessage(RemoteMessage message) async {
    if (message.data.isEmpty) {
      // Get.toNamed(AppRoutes.notification);
    }
  }

  Future showNotificationWithSound(RemoteMessage message) async {
    log("Enter showNotificationWithSound");

    log("message.notification?.title :: ${message.notification?.title}");
    log("message.notification?.body :: ${message.notification?.body}");

    var androidPlatformChannelSpecifics = const AndroidNotificationDetails(
      '0',
      "Multi Salon Expert",
      channelDescription: 'hello',
      icon: 'drawable/ic_launcher',
      importance: Importance.max,
      priority: Priority.high,
    );

    var platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );
    await flutterLocalNotificationsPlugin?.show(
      message.hashCode,
      message.notification?.title.toString(),
      message.notification?.body.toString(),
      platformChannelSpecifics,
      payload: 'Custom_Sound',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      body: Container(
        height: Get.height,
        width: Get.width,
        color: AppColors.backGround,
        child: Image.asset(
          AppAsset.icSplash,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
