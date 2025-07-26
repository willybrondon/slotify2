import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/bottom_sheet/payment_bottom_sheet.dart';
import 'package:salon_2/custom/order_detail/order_detail_title.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class WalletAppBarView extends StatelessWidget {
  const WalletAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtMyWallet".tr,
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

/// =================== Current Balance =================== ///
class WalletBalanceView extends StatelessWidget {
  const WalletBalanceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 95,
      width: Get.width,
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        image: const DecorationImage(
          image: AssetImage(AppAsset.imWalletBox),
          fit: BoxFit.cover,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "txtMyBalance".tr,
            style: TextStyle(
              fontFamily: AppFontFamily.heeBo500,
              fontSize: 16,
              color: AppColors.whiteColor,
            ),
          ),
          GetBuilder<WalletScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return Text(
                "$currency ${walletAmount?.toStringAsFixed(2)}",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo800,
                  fontSize: 28,
                  color: AppColors.whiteColor,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

/// =================== Button =================== ///
class WalletButtonView extends StatelessWidget {
  const WalletButtonView({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              showModalBottomSheet(
                isScrollControlled: true,
                context: context,
                builder: (BuildContext context) {
                  return const PaymentBottomSheet(isRecharge: true);
                },
              );
            },
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: AppColors.redText,
              ),
              height: 48,
              child: Center(
                child: Text(
                  "txtAddAmount".tr,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: AppFontFamily.heeBo700,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: GetBuilder<WalletScreenController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return GestureDetector(
                  onTap: () {
                    Get.toNamed(AppRoutes.history)?.then(
                      (value) async {
                        await logic.onGetWalletHistoryApiCall(
                          userId: Constant.storage.read<String>('userId') ?? "",
                          month: DateFormat('yyyy-MM').format(DateTime.now()),
                        );
                      },
                    );
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: AppColors.primaryAppColor,
                    ),
                    height: 48,
                    child: Center(
                      child: Text(
                        "txtHistory".tr,
                        style: TextStyle(
                          color: AppColors.whiteColor,
                          fontFamily: AppFontFamily.heeBo700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                );
              }),
        ),
      ],
    ).paddingOnly(left: 12, right: 12, bottom: 12);
  }
}

class WalletCurrentTransactionTitleView extends StatelessWidget {
  const WalletCurrentTransactionTitleView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WalletScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getWalletHistoryModel?.data?.isEmpty == true
            ? const SizedBox()
            : OrderDetailTitle(
                title: "txtCurrent10Transaction".tr,
                subTitle: "",
                titleFontFamily: AppFontFamily.heeBo700,
                titleFontSize: 18,
                bottomPadding: 10,
              ).paddingOnly(top: 10, left: 12);
      },
    );
  }
}

class WalletCurrentTransactionView extends StatelessWidget {
  const WalletCurrentTransactionView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WalletScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getWalletHistoryModel?.data?.isEmpty == true
            ? const SizedBox()
            : ListView.builder(
                scrollDirection: Axis.vertical,
                itemCount:
                    (logic.getWalletHistoryModel?.data?.length ?? 0) >= 10 ? 10 : logic.getWalletHistoryModel?.data?.length ?? 0,
                physics: const AlwaysScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return AnimationConfiguration.staggeredGrid(
                    position: index,
                    duration: const Duration(milliseconds: 800),
                    columnCount: (logic.getWalletHistoryModel?.data?.length ?? 0) >= 10
                        ? 10
                        : logic.getWalletHistoryModel?.data?.length ?? 0,
                    child: SlideAnimation(
                      child: FadeInAnimation(
                        child: Container(
                          height: 75,
                          width: Get.width,
                          decoration: BoxDecoration(
                            color: AppColors.whiteColor,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              width: 0.8,
                              color: AppColors.grey.withOpacity(0.1),
                            ),
                          ),
                          padding: const EdgeInsets.only(left: 7, right: 10),
                          margin: const EdgeInsets.only(left: 12, right: 12, top: 10),
                          child: Row(
                            children: [
                              Container(
                                height: 55,
                                width: 55,
                                decoration: BoxDecoration(
                                  color: logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                          logic.getWalletHistoryModel?.data?[index].type == 5
                                      ? AppColors.greenBg
                                      : AppColors.redBg,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Image.asset(
                                  logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                          logic.getWalletHistoryModel?.data?[index].type == 5
                                      ? AppAsset.icWalletAdd
                                      : AppAsset.icWalletMinus,
                                ).paddingAll(7),
                              ),
                              Column(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    logic.getWalletHistoryModel?.data?[index].type == 1
                                        ? "txtWalletDeposit".tr
                                        : logic.getWalletHistoryModel?.data?[index].type == 2
                                            ? "txtBookingFeeDeduction".tr
                                            : logic.getWalletHistoryModel?.data?[index].type == 3
                                                ? "txtProductPurchaseDeduction".tr
                                                : logic.getWalletHistoryModel?.data?[index].type == 4
                                                    ? "txtOrderCancellationFee".tr
                                                    : "txtOrderRefund".tr,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 14,
                                      color: logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                              logic.getWalletHistoryModel?.data?[index].type == 5
                                          ? AppColors.greenText
                                          : AppColors.redText,
                                    ),
                                  ),
                                  Text(
                                    logic.getWalletHistoryModel?.data?[index].uniqueId ?? "",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 12,
                                      color: AppColors.primaryAppColor,
                                    ),
                                  ),
                                  Text(
                                    "${logic.getWalletHistoryModel?.data?[index].date ?? ""}  ${logic.getWalletHistoryModel?.data?[index].time?.toUpperCase() ?? ""}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo600,
                                      fontSize: 11,
                                      color: AppColors.currencyGrey,
                                    ),
                                  ),
                                ],
                              ).paddingOnly(top: 10, bottom: 10, left: 10),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                          logic.getWalletHistoryModel?.data?[index].type == 5
                                      ? AppColors.greenBg
                                      : AppColors.redBg,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                          logic.getWalletHistoryModel?.data?[index].type == 5
                                      ? "+ ${logic.getWalletHistoryModel?.data?[index].amount ?? ""}"
                                      : "- ${logic.getWalletHistoryModel?.data?[index].amount ?? ""}",
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.heeBo700,
                                    fontSize: 14,
                                    color: logic.getWalletHistoryModel?.data?[index].type == 1 ||
                                            logic.getWalletHistoryModel?.data?[index].type == 5
                                        ? AppColors.greenText
                                        : AppColors.redText,
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ).paddingOnly(bottom: 15);
      },
    );
  }
}
