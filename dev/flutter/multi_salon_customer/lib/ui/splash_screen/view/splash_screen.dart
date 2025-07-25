import 'dart:developer';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/app_active_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/search/controller/search_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  final SearchScreenController searchScreenController = Get.find<SearchScreenController>();
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());
  final SplashController splashController = Get.find<SplashController>();
  final BookingDetailScreenController bookingDetailScreenController = Get.find<BookingDetailScreenController>();
  FirebaseMessaging? messaging;
  FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
  bool notificationVisit = false;

  @override
  void initState() {
    Future.delayed(const Duration(seconds: 3), () async {
      await splashController.onSettingApiCall();

      initFirebase();

      if (splashController.settingCategory?.status == true) {
        if (splashController.settingCategory?.setting?.maintenanceMode == true) {
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
          loginScreenController.isLogIn == true && loginScreenController.isUpdate == false
              ? Get.offAllNamed(AppRoutes.editProfile, arguments: [
                  profileScreenController.getUserCategory?.user?.fname,
                  profileScreenController.getUserCategory?.user?.lname,
                  profileScreenController.getUserCategory?.user?.email,
                  profileScreenController.getUserCategory?.user?.mobile,
                  0,
                  profileScreenController.getUserCategory?.user?.bio,
                  profileScreenController.getUserCategory?.user?.loginType,
                  false
                ])
              : Get.offAllNamed(AppRoutes.bottom);
        }
      } else {
        Utils.showToast(Get.context!, splashController.settingCategory?.message ?? "");
      }
    });
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

    log("Setting Splash Screen :: $settings");

    await messaging.getToken().then((value) {
      log("this is fcm token = $value");
    });

    RemoteMessage? initialMessage = await FirebaseMessaging.instance.getInitialMessage();

    if (initialMessage != null) {
      setState(() {
        log("notificationVisit with start :- $notificationVisit");
        notificationVisit = !notificationVisit;
        log("notificationVisit with SetState :- $notificationVisit");
      });
      handleMessage(initialMessage);
    }

    FirebaseMessaging.onMessageOpenedApp.listen((event) {
      log("this is event log :- $event");
      handleMessage(event);
    });

    FirebaseMessaging.onMessage.listen(
      (RemoteMessage message) {
        log('Got a message whilst in the foreground!');
        log('Message data: ${message.data}');

        if (message.notification != null) {
          log('Message also contained a notification: ${message.notification}');
        }
        const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
        flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
        flutterLocalNotificationsPlugin?.initialize(const InitializationSettings(android: initializationSettingsAndroid),
            onDidReceiveNotificationResponse: (payload) {
          log("payload is:- $payload");
          handleMessage(message);
        });
        _showNotificationWithSound(message);
      },
    );
  }

  Future<void> handleMessage(RemoteMessage message) async {
    Get.find<BottomBarController>().onClick(2);
  }

  Future _showNotificationWithSound(RemoteMessage message) async {
    var androidPlatformChannelSpecifics = const AndroidNotificationDetails(
      '0',
      'Salon',
      channelDescription: 'hello',
      icon: 'mipmap/ic_launcher',
      importance: Importance.max,
      priority: Priority.high,
    );

    var platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    log("Splash Body :: ${message.notification!.body}");
    log("Splash title :: ${message.notification!.title}");
    await flutterLocalNotificationsPlugin?.show(
      message.hashCode,
      message.notification!.title.toString(),
      message.notification!.body.toString(),
      platformChannelSpecifics,
      payload: 'Custom_Sound',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      body: Container(
        color: AppColors.backGround,
        child: Container(
          alignment: Alignment.bottomCenter,
          margin: const EdgeInsets.only(bottom: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(AppAsset.icLogo, height: 150, width: 150),
            ],
          ),
        ),
      ),
    );
  }
}
