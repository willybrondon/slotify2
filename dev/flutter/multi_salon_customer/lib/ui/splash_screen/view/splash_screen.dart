import 'dart:developer';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/app_active_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
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
  final HomeScreenController homeScreenController =
      Get.find<HomeScreenController>();
  final SearchScreenController searchScreenController =
      Get.find<SearchScreenController>();
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());
  final SplashController splashController = Get.find<SplashController>();
  final BookingDetailScreenController bookingDetailScreenController =
      Get.find<BookingDetailScreenController>();
  FirebaseMessaging? messaging;
  FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
  bool notificationVisit = false;

  @override
  void initState() {
    Future.delayed(
      const Duration(seconds: 3),
      () async {
        await splashController.onSettingApiCall();

        initFirebase();

        if (splashController.settingCategory?.status == true) {
          if (splashController.settingCategory?.setting?.maintenanceMode ==
              true) {
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                backgroundColor: AppColors.transparent,
                shadowColor: Colors.transparent,
                surfaceTintColor: Colors.transparent,
                elevation: 0,
                child: const AppActiveDialog(),
              ),
            );
          } else {
            log("is LogIn Splash :: ${Constant.storage.read<bool>('isLogIn')}");
            log("is Update Splash :: ${Constant.storage.read<bool>('isUpdate')}");

            if (Constant.storage.read("isOnBoarding") == true) {
              loginScreenController.isLogIn == true &&
                      loginScreenController.isUpdate == false
                  ? Get.offAllNamed(
                      AppRoutes.editProfile,
                      arguments: [
                        profileScreenController.getUserCategory?.user?.fname,
                        profileScreenController.getUserCategory?.user?.lname,
                        profileScreenController.getUserCategory?.user?.email,
                        profileScreenController.getUserCategory?.user?.mobile,
                        0,
                        profileScreenController.getUserCategory?.user?.bio,
                        profileScreenController
                            .getUserCategory?.user?.loginType,
                        false,
                      ],
                    )
                  : Get.offAllNamed(AppRoutes.bottom);
            } else {
              Get.offAllNamed(AppRoutes.onBoarding);
            }
          }
        } else {
          Utils.showToast(
              Get.context!, splashController.settingCategory?.message ?? "");
        }
      },
    );
    super.initState();
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
            AndroidInitializationSettings('@mipmap/ic_launcher');
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
      Get.toNamed(AppRoutes.notification);
    }
  }

  Future showNotificationWithSound(RemoteMessage message) async {
    log("Enter showNotificationWithSound");

    log("message.notification?.title :: ${message.notification?.title}");
    log("message.notification?.body :: ${message.notification?.body}");

    var androidPlatformChannelSpecifics = const AndroidNotificationDetails(
      '0',
      "Multi Salon Customer",
      channelDescription: 'hello',
      icon: 'mipmap/ic_launcher',
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
