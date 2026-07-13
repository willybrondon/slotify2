import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class ProductStripeService {
  Future<bool> payAndCreateOrder({
    required BuildContext context,
    required String salonId,
    required String productId,
    required int finalTotal,
    required int subTotal,
    required int quantity,
    required List<Map<String, dynamic>> attributes,
    required bool withoutCart,
    required String salonName,
    required Future<bool> Function({required String paymentGateway}) createOrder,
  }) async {
    final splashController = Get.find<SplashController>();
    final publishableKey =
        splashController.settingCategory?.setting?.stripePublishableKey ?? '';

    if (publishableKey.isEmpty) {
      Utils.showToast(context, 'Stripe is not configured.');
      return false;
    }

    Stripe.publishableKey = publishableKey;
    Stripe.merchantIdentifier = 'merchant.flutter.stripe.test';
    await Stripe.instance.applySettings();

    final url = Uri.parse(
      ApiConstant.BASE_URL + ApiConstant.stripeProductPaymentIntent,
    );

    final response = await http.post(
      url,
      headers: {
        'key': ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'salonId': salonId,
        'productId': productId,
        'amount': finalTotal,
        'subTotal': subTotal,
        'userId': Constant.storage.read<String>('userId') ?? '',
      }),
    );

    log('Product Connect PI status :: ${response.statusCode}');
    log('Product Connect PI body :: ${response.body}');

    if (response.statusCode != 200) {
      Utils.showToast(context, 'Unable to start card payment.');
      return false;
    }

    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['status'] != true) {
      Utils.showToast(
        context,
        jsonResponse['message']?.toString() ?? 'Stripe error',
      );
      return false;
    }

    final clientSecret = jsonResponse['clientSecret']?.toString() ?? '';
    final pk = jsonResponse['publishableKey']?.toString();
    final merchantName =
        jsonResponse['salonName']?.toString().trim().isNotEmpty == true
            ? jsonResponse['salonName'].toString()
            : salonName;

    if (pk != null && pk.isNotEmpty) {
      Stripe.publishableKey = pk;
      await Stripe.instance.applySettings();
    }

    if (clientSecret.isEmpty) {
      Utils.showToast(context, 'Payment intent creation failed.');
      return false;
    }

    try {
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          appearance: PaymentSheetAppearance(
            colors: PaymentSheetAppearanceColors(
              primary: AppColors.primaryAppColor,
            ),
          ),
          merchantDisplayName: merchantName,
        ),
      );

      await Stripe.instance.presentPaymentSheet();

      return await createOrder(paymentGateway: 'Stripe');
    } on StripeException catch (e) {
      Utils.showToast(
        context,
        'Payment failed: ${e.error.localizedMessage ?? e.error.message}',
      );
      return false;
    } catch (e) {
      log('Product stripe error :: $e');
      Utils.showToast(context, 'Payment failed: $e');
      return false;
    }
  }
}
