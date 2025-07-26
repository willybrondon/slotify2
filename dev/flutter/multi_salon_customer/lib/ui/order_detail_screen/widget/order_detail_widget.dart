import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/cancel_order_dialog.dart';
import 'package:salon_2/custom/order_detail/order_detail_title.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/order_detail_screen/controller/order_detail_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class OrderDetailAppBarView extends StatelessWidget {
  const OrderDetailAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtOrderDetails".tr,
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        onTap: () {
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
        ),
      ),
    );
  }
}

class OrderDetailInfoView extends StatelessWidget {
  const OrderDetailInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      builder: (logic) {
        return Container(
          width: Get.width,
          decoration: BoxDecoration(
            color: AppColors.whiteColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.grey.withOpacity(0.15),
              width: 1,
            ),
            boxShadow: Constant.boxShadow,
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const OrderDetailDeliveryView(),
                const OrderDetailWidgetDividerView(),
                const OrderDetailDeliveryLocationView(),
                const OrderDetailWidgetDividerView(),
                const OrderDetailOrderInfoView(),
                const OrderDetailPaymentView(),
                const OrderDetailWidgetDividerView(),
                const OrderDetailTotalView(),
                logic.items?.status == "Out Of Delivery" ? const OrderDetailWidgetDividerView() : const SizedBox(),
                logic.items?.status == "Out Of Delivery" ? const OrderDetailWidgetTrackingView() : const SizedBox(),
              ],
            ).paddingOnly(left: 15, right: 15, top: 15),
          ),
        ).paddingAll(15);
      },
    );
  }
}

class OrderDetailDeliveryView extends StatelessWidget {
  const OrderDetailDeliveryView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OrderDetailTitle(
              title: logic.orderData?.orderId ?? "",
              subTitle: logic.onGetDate(date: logic.items?.date ?? ""),
              widget: Container(
                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 13),
                margin: const EdgeInsets.only(left: 10),
                decoration: BoxDecoration(
                  color: logic.items?.status == "Pending" || logic.items?.status == "Delivered"
                      ? AppColors.greenColorBg
                      : logic.items?.status == "Confirmed" || logic.items?.status == "Out Of Delivery"
                          ? AppColors.orangeBg
                          : AppColors.redBg,
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text(
                  logic.items?.status ?? "",
                  style: TextStyle(
                    color: logic.items?.status == "Pending" || logic.items?.status == "Delivered"
                        ? AppColors.greenText
                        : logic.items?.status == "Confirmed" || logic.items?.status == "Out Of Delivery"
                            ? AppColors.orange
                            : AppColors.redText,
                    fontFamily: AppFontFamily.heeBo500,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
            OrderDetailTitle(title: "txtNoReceipt".tr, subTitle: logic.items?.productCode ?? ""),
            OrderDetailTitle(
              title: "txtPaymentMethod".tr,
              subTitle: logic.orderData?.paymentGateway?.isEmpty == true ? "Wallet" : logic.orderData?.paymentGateway ?? "Wallet",
              titleFontFamily: AppFontFamily.heeBo700,
            ),
          ],
        );
      },
    );
  }
}

class OrderDetailDeliveryLocationView extends StatelessWidget {
  const OrderDetailDeliveryLocationView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OrderDetailTitle(
              title: "txtDeliveryLocation".tr,
              subTitle: "",
              titleFontFamily: AppFontFamily.heeBo700,
            ),
            OrderDetailTitle(
              title: Constant.capitalizeFirstLetter(logic.orderData?.shippingAddress?.name ?? ""),
              subTitle: "",
              titleFontFamily: AppFontFamily.heeBo700,
            ),
            SizedBox(
              width: Get.width * 0.58,
              child: Text(
                "${Constant.capitalizeFirstLetter(logic.orderData?.shippingAddress?.address ?? "")}, ${logic.orderData?.shippingAddress?.city ?? ""}, ${logic.orderData?.shippingAddress?.state ?? ""}, ${logic.orderData?.shippingAddress?.zipCode ?? ""}",
                style: TextStyle(
                  color: AppColors.currencyGrey,
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 13,
                ),
              ),
            ).paddingOnly(bottom: 15),
          ],
        );
      },
    );
  }
}

class OrderDetailOrderInfoView extends StatelessWidget {
  const OrderDetailOrderInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OrderDetailTitle(
              title: "txtOrderInfo".tr,
              subTitle: "",
              titleFontFamily: AppFontFamily.heeBo700,
            ),
            OrderDetailTitle(
              title: Constant.capitalizeFirstLetter(logic.items?.product?.productName ?? ""),
              subTitle: "$currency${logic.items?.purchasedTimeProductPrice ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleColor: AppColors.currencyGrey,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
              subTitleFontFamily: AppFontFamily.heeBo700,
              widget: Text(
                "x${logic.items?.productQuantity ?? ""}",
                style: TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: AppFontFamily.heeBo600,
                  fontSize: 15,
                ),
              ).paddingOnly(left: 5),
            ),
          ],
        );
      },
    );
  }
}

class OrderDetailPaymentView extends StatelessWidget {
  const OrderDetailPaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OrderDetailTitle(
              title: "txtSubTotal".tr,
              subTitle: "$currency${logic.purchasedTimeProductPrice ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
              subTitleFontFamily: AppFontFamily.heeBo600,
            ),
            OrderDetailTitle(
              title: "txtShipping".tr,
              subTitle: "$currency${logic.items?.purchasedTimeShippingCharges ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
            ),
          ],
        );
      },
    );
  }
}

class OrderDetailTotalView extends StatelessWidget {
  const OrderDetailTotalView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return OrderDetailTitle(
          title: "txtTotal".tr,
          subTitle: "$currency${logic.purchasedTimeTotal ?? ""}",
          titleFontFamily: AppFontFamily.heeBo600,
          titleFontSize: 20,
          subTitleColor: AppColors.blackColor1,
          subTitleFontFamily: AppFontFamily.heeBo700,
          subTitleFontSize: 20,
        );
      },
    );
  }
}

class OrderDetailWidgetTrackingView extends StatelessWidget {
  const OrderDetailWidgetTrackingView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            OrderDetailTitle(
              title: "txtLogisticsDetails".tr,
              subTitle: "",
              titleFontFamily: AppFontFamily.heeBo700,
            ),
            OrderDetailTitle(title: "txtServiceName".tr, subTitle: logic.items?.deliveredServiceName ?? ""),
            OrderDetailTitle(title: "txtTrackingID".tr, subTitle: logic.items?.trackingId ?? ""),
            InkWell(
              onTap: () {
                logic.onTrackingOrder();
              },
              overlayColor: WidgetStateColor.transparent,
              child: OrderDetailTitle(
                title: "txtTrackingLink".tr,
                subTitle: logic.items?.trackingLink ?? "",
                titleFontFamily: AppFontFamily.heeBo600,
                titleFontSize: 20,
                subTitleWidth: Get.width * 0.45,
              ),
            ),
          ],
        );
      },
    );
  }
}

class OrderDetailWidgetDividerView extends StatelessWidget {
  const OrderDetailWidgetDividerView({super.key});

  @override
  Widget build(BuildContext context) {
    return Divider(color: AppColors.greyColor.withOpacity(0.2)).paddingOnly(bottom: 15);
  }
}

class OrderDetailCancellationView extends StatelessWidget {
  const OrderDetailCancellationView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return RichText(
          textAlign: TextAlign.start,
          text: TextSpan(
            children: [
              TextSpan(
                text: "* As per policy, ",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 13,
                  color: AppColors.redText,
                ),
              ),
              TextSpan(
                text: "${logic.cancelOrderAmount}$currency",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.redText,
                ),
              ),
              TextSpan(
                text: " will be deducted from your wallet for this order cancellation.",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 13,
                  color: AppColors.redText,
                ),
              ),
            ],
          ),
        ).paddingOnly(left: 15, right: 15);
      },
    );
  }
}

class OrderDetailButtonView extends StatelessWidget {
  const OrderDetailButtonView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderDetailController>(
      builder: (logic) {
        return Container(
          height: 115,
          padding: const EdgeInsets.only(top: 10),
          child: Column(
            children: [
              logic.items?.status == "Pending" ? const OrderDetailCancellationView() : const SizedBox(),
              GestureDetector(
                onTap: () async {
                  logic.items?.status == "Delivered"
                      ? Get.toNamed(
                          AppRoutes.productReview,
                          arguments: [
                            logic.items?.product?.brand,
                            logic.items?.product?.productName,
                            logic.items?.product?.mainImage,
                            logic.items?.product?.id,
                            logic.items?.purchasedTimeProductPrice,
                            logic.purchasedTimeProductPrice,
                            logic.items?.purchasedTimeShippingCharges,
                            logic.purchasedTimeTotal,
                            logic.items?.productQuantity
                          ],
                        )
                      : Get.dialog(
                          barrierColor: AppColors.blackColor.withOpacity(0.8),
                          Dialog(
                            backgroundColor: AppColors.transparent,
                            surfaceTintColor: AppColors.transparent,
                            shadowColor: AppColors.transparent,
                            elevation: 0,
                            child: const CancelOrderDialog(),
                          ),
                        );
                },
                child: logic.items?.status == "Pending"
                    ? Container(
                        height: 50,
                        margin: const EdgeInsets.only(bottom: 12, top: 5, left: 12, right: 12),
                        decoration: BoxDecoration(
                          color: AppColors.currencyRed,
                          borderRadius: BorderRadius.circular(45),
                        ),
                        child: Center(
                          child: Text(
                            "txtCancelOrder".tr,
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontFamily: AppFontFamily.heeBo700,
                              fontSize: 17,
                            ),
                          ),
                        ),
                      )
                    : logic.items?.status == "Delivered"
                        ? Container(
                            height: 50,
                            margin: const EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                            decoration: BoxDecoration(
                              color: AppColors.primaryAppColor,
                              borderRadius: BorderRadius.circular(45),
                            ),
                            child: Center(
                              child: Text(
                                "txtGiveReview".tr,
                                style: TextStyle(
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 17,
                                ),
                              ),
                            ),
                          )
                        : const SizedBox(),
              ),
            ],
          ),
        );
      },
    );
  }
}
