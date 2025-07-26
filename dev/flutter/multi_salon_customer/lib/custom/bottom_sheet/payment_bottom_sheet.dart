import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/confirm_booking_screen/controller/confirm_booking_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class PaymentBottomSheet extends StatelessWidget {
  final bool isRecharge;

  const PaymentBottomSheet({super.key, required this.isRecharge});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WalletScreenController>(
      id: Constant.idMoneyOffer,
      builder: (logic) {
        List amount = [
          "Amount",
          "Discount",
        ];

        return Container(
          height: logic.getCouponModel?.data?.isEmpty == true
              ? Get.height * 0.6
              : logic.applyCoupon == -1
                  ? Get.height * 0.79
                  : Get.height * 0.92,
          width: Get.width,
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(35),
              topRight: Radius.circular(35),
            ),
            color: AppColors.whiteColor,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(28),
                    topRight: Radius.circular(28),
                  ),
                  color: AppColors.primaryAppColor,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),
                    Text(
                      isRecharge == true ? "Add Amount" : "Insufficient Balance",
                      style: TextStyle(
                        fontSize: 19,
                        color: AppColors.whiteColor,
                        fontFamily: AppFontFamily.heeBo800,
                      ),
                    ).paddingOnly(left: 8),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {
                        Get.back();
                      },
                      child: SizedBox(
                        width: 45,
                        child: Image.asset(
                          AppAsset.icClose,
                          height: Get.height * 0.07,
                          width: Get.width * 0.07,
                        ).paddingOnly(right: 15),
                      ),
                    )
                  ],
                ),
              ),
              Text(
                "Add Money",
                style: TextStyle(
                  fontSize: 22,
                  color: AppColors.primaryAppColor,
                  fontFamily: AppFontFamily.heeBo800,
                ),
              ).paddingOnly(top: 10, left: 12.5),
              Text(
                "There is not enough funds in wallet",
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.paymentText,
                  fontFamily: AppFontFamily.heeBo400,
                ),
              ).paddingOnly(top: 5, left: 12.5),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                    decoration: BoxDecoration(
                      color: AppColors.whiteColor,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(10),
                        bottomLeft: Radius.circular(10),
                      ),
                    ),
                    child: Text(
                      currency ?? "",
                      style: TextStyle(
                        fontSize: 25,
                        color: AppColors.paymentText,
                        fontFamily: AppFontFamily.heeBo800,
                      ),
                    ),
                  ),
                  IntrinsicWidth(
                    child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minWidth: 50,
                          maxWidth: MediaQuery.of(context).size.width * 0.8,
                        ),
                        child: TextFormField(
                          controller: logic.currencyController,
                          // onChanged: (text) {
                          //   logic.printLatestValue(text: text.trim().toString());
                          //   return;
                          // },
                          decoration: InputDecoration(
                            border: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            disabledBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.primaryAppColor),
                            ),
                            filled: true,
                            fillColor: AppColors.whiteColor,
                            contentPadding: const EdgeInsets.symmetric(vertical: 7, horizontal: 12),
                          ),
                          cursorColor: AppColors.primaryAppColor,
                          style: TextStyle(
                            fontSize: 25,
                            color: AppColors.paymentText,
                            fontFamily: AppFontFamily.heeBo800,
                          ),
                          keyboardType: TextInputType.number,
                        )),
                  ),
                ],
              ).paddingAll(10),
              Text(
                "Please Recharge \nYour wallet to continue booking",
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.paymentText,
                  fontFamily: AppFontFamily.heeBo400,
                ),
              ).paddingOnly(top: 5, left: 12.5),
              Divider(height: 1.2, color: AppColors.grey.withOpacity(0.15)).paddingOnly(top: 7),
              Text(
                "Select Direct Amount",
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.primaryAppColor,
                  fontFamily: AppFontFamily.heeBo700,
                ),
              ).paddingOnly(top: 10, bottom: 5, left: 12.5),
              SizedBox(
                height: Get.height * 0.06,
                child: GetBuilder<WalletScreenController>(
                  id: Constant.idSelectAmount,
                  builder: (logic) {
                    return ListView.builder(
                      itemCount: logic.directAmount.length,
                      scrollDirection: Axis.horizontal,
                      shrinkWrap: true,
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () {
                            logic.onSelectAmount(index);
                          },
                          child: Container(
                            height: 40,
                            width: 70,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: logic.selectAmountIndex == index ? AppColors.primaryAppColor : AppColors.whiteColor,
                            ),
                            padding: const EdgeInsets.only(left: 15, right: 15),
                            margin: const EdgeInsets.only(bottom: 2.5, right: 10, top: 10),
                            child: Center(
                              child: Text(
                                logic.directAmount[index],
                                style: TextStyle(
                                  fontSize: 15,
                                  color: logic.selectAmountIndex == index ? AppColors.whiteColor : AppColors.paymentText,
                                  fontFamily: AppFontFamily.heeBo800,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ).paddingOnly(left: 12.5),
              logic.getCouponModel?.data?.isEmpty == true || logic.applyCoupon == -1
                  ? const SizedBox()
                  : Container(
                      height: 185,
                      decoration: BoxDecoration(
                        color: AppColors.whiteColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          width: 0.7,
                          color: AppColors.primaryAppColor,
                        ),
                      ),
                      child: Column(
                        children: [
                          Container(
                            height: 45,
                            width: Get.width,
                            decoration: BoxDecoration(
                              color: AppColors.primaryAppColor,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(14),
                                topRight: Radius.circular(14),
                              ),
                            ),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "Payment Description",
                                style: TextStyle(
                                  fontSize: 15,
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.heeBo800,
                                ),
                              ).paddingOnly(left: 15),
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              physics: const NeverScrollableScrollPhysics(),
                              padding: EdgeInsets.zero,
                              itemCount: logic.priceList.length,
                              scrollDirection: Axis.vertical,
                              itemBuilder: (context, index) {
                                return Container(
                                  height: 45,
                                  decoration: BoxDecoration(
                                    color: index.isOdd ? AppColors.paymentDes1 : AppColors.paymentDes,
                                  ),
                                  margin: const EdgeInsets.only(bottom: 3),
                                  padding: const EdgeInsets.only(left: 15, right: 15),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        amount[index],
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: AppColors.blackColor,
                                          fontFamily: AppFontFamily.heeBo600,
                                        ),
                                      ),
                                      Text(
                                        "$currency ${logic.priceList[index]}",
                                        style: TextStyle(
                                          fontSize: 15,
                                          color: AppColors.primaryTextColor,
                                          fontFamily: AppFontFamily.heeBo900,
                                        ),
                                      )
                                    ],
                                  ),
                                );
                              },
                            ).paddingOnly(top: 3, bottom: 3),
                          ),
                          Container(
                            height: 43,
                            width: Get.width,
                            decoration: BoxDecoration(
                              borderRadius: const BorderRadius.only(
                                bottomRight: Radius.circular(14),
                                bottomLeft: Radius.circular(14),
                              ),
                              color: AppColors.primaryAppColor,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "Total Payable Amount",
                                  style: TextStyle(
                                    color: AppColors.whiteColor,
                                    fontSize: 14,
                                    fontFamily: AppFontFamily.heeBo600,
                                  ),
                                ),
                                Text(
                                  "$currency ${logic.finalAmountAfterCoupon}",
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: AppColors.whiteColor,
                                    fontFamily: AppFontFamily.heeBo900,
                                  ),
                                )
                              ],
                            ).paddingOnly(left: 15, right: 15),
                          ),
                        ],
                      ),
                    ).paddingOnly(left: 15, right: 15, top: 10),
              GetBuilder<WalletScreenController>(
                id: Constant.idMoneyOffer,
                builder: (logic) {
                  return logic.getCouponModel?.data?.isEmpty == true
                      ? const SizedBox()
                      : Text(
                          "Add Money Offer",
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.primaryTextColor,
                            fontFamily: AppFontFamily.heeBo900,
                          ),
                        ).paddingOnly(top: 12, bottom: 12, left: 12.5);
                },
              ),
              GetBuilder<WalletScreenController>(
                id: Constant.idMoneyOffer,
                builder: (logic) {
                  return logic.getCouponModel?.data?.isEmpty == true
                      ? const Spacer()
                      : SizedBox(
                          height: Get.height * 0.16,
                          child: ListView.builder(
                            itemCount: logic.getCouponModel?.data?.length ?? 0,
                            scrollDirection: Axis.horizontal,
                            shrinkWrap: true,
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemBuilder: (context, index) {
                              return GestureDetector(
                                onTap: () {
                                  // logic.onMoneyOffer(index);
                                },
                                child: Container(
                                  width: Get.width * 0.83,
                                  decoration: BoxDecoration(
                                    image: DecorationImage(
                                      image: AssetImage(
                                        logic.applyCoupon == index ? AppAsset.icCouponBox : AppAsset.icCouponBox,
                                      ),
                                      fit: BoxFit.fill,
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          SizedBox(
                                            width: Get.width * 0.6,
                                            child: Text(
                                              logic.getCouponModel?.data?[index].title ?? "",
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 21,
                                                color: logic.applyCoupon == index
                                                    ? AppColors.primaryAppColor
                                                    : AppColors.primaryTextColor,
                                                fontFamily: AppFontFamily.heeBo800,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: logic.applyCoupon == index ? AppColors.primaryAppColor : AppColors.dateBox,
                                              borderRadius: BorderRadius.circular(5),
                                            ),
                                            child: RichText(
                                              text: TextSpan(
                                                text: 'Offer Validity  ',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: logic.applyCoupon == index
                                                      ? AppColors.primaryTextColor
                                                      : AppColors.primaryTextColor,
                                                  fontFamily: AppFontFamily.heeBo700,
                                                ),
                                                children: [
                                                  TextSpan(
                                                    text: logic.getCouponModel?.data?[index].expiryDate ?? "",
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      color: logic.applyCoupon == index
                                                          ? AppColors.primaryTextColor
                                                          : AppColors.primaryTextColor,
                                                      fontFamily: AppFontFamily.heeBo900,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          Text(
                                            logic.getCouponModel?.data?[index].description ?? "",
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: logic.applyCoupon == index ? AppColors.whiteColor : AppColors.paymentText,
                                              fontFamily: AppFontFamily.heeBo700,
                                            ),
                                          ),
                                        ],
                                      ).paddingOnly(top: 13, bottom: 13, left: 28),
                                      Container(
                                        height: 22,
                                        width: 22,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: logic.applyCoupon == index ? AppColors.whiteColor : AppColors.paymentText,
                                            width: 1.3,
                                          ),
                                          shape: BoxShape.circle,
                                        ),
                                        child: logic.applyCoupon == index
                                            ? Container(
                                                height: 21,
                                                width: 21,
                                                decoration: BoxDecoration(
                                                  color: AppColors.primaryAppColor,
                                                  shape: BoxShape.circle,
                                                ),
                                                child: Image.asset(AppAsset.icCheck).paddingAll(5),
                                              )
                                            : const SizedBox.shrink(),
                                      ).paddingOnly(right: Get.width * 0.08)
                                    ],
                                  ),
                                ).paddingOnly(left: 12.5),
                              );
                            },
                          ),
                        );
                },
              ),
              GetBuilder<WalletScreenController>(
                builder: (logic) {
                  return AppButton(
                    height: 52,
                    width: Get.width,
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    color: AppColors.whiteColor,
                    fontSize: 18,
                    buttonColor: AppColors.primaryAppColor,
                    buttonText: "Recharge Now",
                    onTap: () {
                      logic.onRechargeClick();
                    },
                  ).paddingOnly(top: 25, left: 12.5, bottom: 8);
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

/*import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class PaymentBottomSheet extends StatelessWidget {
  final bool isRecharge;

  const PaymentBottomSheet({super.key, required this.isRecharge});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WalletScreenController>(
      builder: (logic) {
        return Container(
          height: Get.height * 0.5,
          width: Get.width,
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(35),
              topRight: Radius.circular(35),
            ),
            color: AppColors.paymentSheetBg,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(28),
                    topRight: Radius.circular(28),
                  ),
                  color: AppColors.primaryAppColor,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),
                    Text(
                      isRecharge == true ? "Add Amount" : "Insufficient Balance",
                      style: TextStyle(
                        fontSize: 19,
                        color: AppColors.whiteColor,
                        fontFamily: AppFontFamily.heeBo700,
                      ),
                    ).paddingOnly(left: 8),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {
                        Get.back();
                      },
                      child: SizedBox(
                        width: 45,
                        child: Image.asset(
                          AppAsset.icClose,
                          height: Get.height * 0.07,
                          width: Get.width * 0.07,
                        ).paddingOnly(right: 15),
                      ),
                    )
                  ],
                ),
              ),
              Text(
                "Add Money",
                style: TextStyle(
                  fontSize: 22,
                  color: AppColors.primaryAppColor,
                  fontFamily: AppFontFamily.heeBo800,
                ),
              ).paddingOnly(top: 10, left: 12.5),
              Text(
                "There is not enough funds in wallet",
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.paymentText,
                  fontFamily: AppFontFamily.heeBo400,
                ),
              ).paddingOnly(top: 5, left: 12.5),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                    decoration: BoxDecoration(
                      color: AppColors.whiteColor,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(10),
                        bottomLeft: Radius.circular(10),
                      ),
                    ),
                    child: Text(
                      currency ?? "",
                      style: TextStyle(
                        fontSize: 25,
                        color: AppColors.paymentText,
                        fontFamily: AppFontFamily.heeBo800,
                      ),
                    ),
                  ),
                  IntrinsicWidth(
                    child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minWidth: 50,
                          maxWidth: MediaQuery.of(context).size.width * 0.8,
                        ),
                        child: TextFormField(
                          controller: logic.currencyController,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            disabledBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.transparent),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(10),
                                bottomRight: Radius.circular(10),
                              ),
                              borderSide: BorderSide(color: AppColors.primaryAppColor),
                            ),
                            filled: true,
                            fillColor: AppColors.whiteColor,
                            contentPadding: const EdgeInsets.symmetric(vertical: 7, horizontal: 12),
                          ),
                          cursorColor: AppColors.primaryAppColor,
                          style: TextStyle(
                            fontSize: 25,
                            color: AppColors.paymentText,
                            fontFamily: AppFontFamily.heeBo800,
                          ),
                          keyboardType: TextInputType.number,
                        )),
                  ),
                ],
              ).paddingAll(10),
              Text(
                "Please Recharge \nYour wallet to continue booking",
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.paymentText,
                  fontFamily: AppFontFamily.heeBo400,
                ),
              ).paddingOnly(top: 5, left: 12.5),
              Divider(height: 1.2, color: AppColors.grey.withOpacity(0.15)).paddingOnly(top: 7),
              Text(
                "Select Direct Amount",
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.primaryAppColor,
                  fontFamily: AppFontFamily.heeBo700,
                ),
              ).paddingOnly(top: 10, bottom: 5, left: 12.5),
              SizedBox(
                height: Get.height * 0.06,
                child: GetBuilder<WalletScreenController>(
                  id: Constant.idSelectAmount,
                  builder: (logic) {
                    return ListView.builder(
                      itemCount: logic.directAmount.length,
                      scrollDirection: Axis.horizontal,
                      shrinkWrap: true,
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () {
                            logic.onSelectAmount(index);
                          },
                          child: Container(
                            height: 40,
                            width: 70,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: logic.selectAmountIndex == index ? AppColors.primaryAppColor : AppColors.whiteColor,
                            ),
                            padding: const EdgeInsets.only(left: 15, right: 15),
                            margin: const EdgeInsets.only(bottom: 2.5, right: 10, top: 10),
                            child: Center(
                              child: Text(
                                logic.directAmount[index],
                                style: TextStyle(
                                  fontSize: 15,
                                  color: logic.selectAmountIndex == index ? AppColors.whiteColor : AppColors.paymentText,
                                  fontFamily: AppFontFamily.heeBo800,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ).paddingOnly(left: 12.5),
              GetBuilder<WalletScreenController>(
                builder: (logic) {
                  return AppButton(
                    height: 52,
                    width: Get.width,
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    color: AppColors.whiteColor,
                    fontSize: 18,
                    buttonColor: AppColors.primaryAppColor,
                    buttonText: "Recharge Now",
                    onTap: () {
                      logic.onRechargeClick();
                    },
                  ).paddingAll(15);
                },
              ),
            ],
          ),
        );
      },
    );
  }
}*/
