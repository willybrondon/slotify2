import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/history_screen/controller/history_screen_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

/// =================== App Bar =================== ///
class HistoryAppBarView extends StatelessWidget {
  const HistoryAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtHistory".tr,
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

/// =================== Title =================== ///
class HistoryTitleView extends StatelessWidget {
  const HistoryTitleView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "txtPaymentHistory".tr,
              style: TextStyle(
                fontFamily: AppFontFamily.heeBo800,
                fontSize: 16,
                color: AppColors.primaryAppColor,
              ),
            ),
            GetBuilder<HistoryScreenController>(
              id: Constant.idSelectMonth,
              builder: (logic) {
                return GestureDetector(
                  onTap: () {
                    logic.onClickMonth();
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.selectSize,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 8),
                    child: Row(
                      children: [
                        Text(
                          logic.selectedMonth.toString(),
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.slotText,
                            fontFamily: AppFontFamily.heeBo600,
                          ),
                        ).paddingOnly(right: 5),
                        Image.asset(
                          AppAsset.icArrowDown,
                          height: 15,
                          color: AppColors.slotText,
                        )
                      ],
                    ),
                  ),
                );
              },
            )
          ],
        )
      ],
    ).paddingOnly(top: 15, left: 15, right: 15);
  }
}

/// =================== List View =================== ///
class HistoryListView extends StatelessWidget {
  const HistoryListView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WalletScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getWalletHistoryModel?.data?.isEmpty == true
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      AppAsset.icNoService,
                      height: 170,
                      width: 170,
                    ),
                    Text(
                      "desNoDataFoundWallet".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                        fontSize: 17,
                        color: AppColors.primaryTextColor,
                      ),
                    )
                  ],
                ),
              )
            : ListView.builder(
                scrollDirection: Axis.vertical,
                itemCount: logic.getWalletHistoryModel?.data?.length ?? 0,
                physics: const AlwaysScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return AnimationConfiguration.staggeredGrid(
                    position: index,
                    duration: const Duration(milliseconds: 800),
                    columnCount: logic.getWalletHistoryModel?.data?.length ?? 0,
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
    ).paddingOnly(bottom: 15);
  }
}
