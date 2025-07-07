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
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  final SplashScreenController splashScreenController = Get.find<SplashScreenController>();
  FirebaseMessaging? messaging;
  FlutterLocalNotificationsPlugin? flutterLocalNotificationsPlugin;
  bool notificationVisit = false;

  @override
  void initState() {
    Future.delayed(const Duration(seconds: 3), () async {
      log("Is login check 1 :: ${Constant.storage.read("isLogIn")}");

      await splashScreenController.onSettingApiCall();
      initFirebase();
      if (splashScreenController.settingCategory?.status == true) {
        if (splashScreenController.settingCategory?.setting?.maintenanceMode == true) {
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
            await loginScreenController.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());

            if (loginScreenController.getExpertCategory?.status == true) {
              currentEarning = loginScreenController.getExpertCategory?.data?.currentEarning?.toStringAsFixed(2);

              Constant.storage.write('fName', loginScreenController.getExpertCategory?.data?.fname.toString());
              Constant.storage.write('lName', loginScreenController.getExpertCategory?.data?.lname.toString());
              Constant.storage.write('hostImage', loginScreenController.getExpertCategory?.data?.image.toString());

              Constant.storage.write('uniqueID', loginScreenController.getExpertCategory?.data?.uniqueId.toString());
              Constant.storage.write("salonId", loginScreenController.getExpertCategory?.data?.salonId?.id.toString());

              Constant.storage.write('paymentType', loginScreenController.getExpertCategory?.data?.paymentType);

              Constant.storage.write("bankName", loginScreenController.getExpertCategory?.data?.bankDetails?.bankName.toString());
              Constant.storage
                  .write("accountNumber", loginScreenController.getExpertCategory?.data?.bankDetails?.accountNumber.toString());
              Constant.storage.write("IFSCCode", loginScreenController.getExpertCategory?.data?.bankDetails?.ifscCode.toString());
              Constant.storage
                  .write("branchName", loginScreenController.getExpertCategory?.data?.bankDetails?.branchName.toString());
              Constant.storage.write("upiId", loginScreenController.getExpertCategory?.data?.upiId.toString());

              log("Bank Name :: ${Constant.storage.read<String>("bankName")}");
              log("Account Number :: ${Constant.storage.read<String>("accountNumber")}");
              log("IFSC Code :: ${Constant.storage.read<String>("IFSCCode")}");
              log("Branch Name :: ${Constant.storage.read<String>("branchName")}");
              log("UPI Id :: ${Constant.storage.read<String>("upiId")}");
              log("salon Id :: ${Constant.storage.read<String>("salonId")}");
              log("Unique ID :: ${Constant.storage.read<String>("uniqueID")}");
              log("salon Id df:: ${loginScreenController.getExpertCategory?.data?.salonId.toString()}");

              Get.offAllNamed(AppRoutes.bottom);
            } else {
              Utils.showToast(Get.context!, loginScreenController.getExpertCategory?.message ?? "");
            }
          } else {
            Get.offAllNamed(AppRoutes.login);
          }
        }
      } else {
        Utils.showToast(Get.context!, splashScreenController.settingCategory?.message ?? "");
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

    log("Setting :: $settings");
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

  Future<void> handleMessage(RemoteMessage message) async {}

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
          decoration: BoxDecoration(color: AppColors.backGround),
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
