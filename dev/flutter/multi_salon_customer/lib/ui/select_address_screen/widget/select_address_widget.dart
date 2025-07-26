import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/select_address_screen/controller/select_address_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class SelectAddressAppBarView extends StatelessWidget {
  const SelectAddressAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtSelectAddress".tr,
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

class SelectAddressItemView extends StatelessWidget {
  const SelectAddressItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SelectAddressController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getAllAddressModel?.address?.isEmpty == true
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      AppAsset.icNoService,
                      height: 170,
                      width: 170,
                    ).paddingOnly(top: 50),
                    Text(
                      "desNoDataFoundAddress".tr,
                      style: TextStyle(
                        color: AppColors.primaryTextColor,
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 18,
                      ),
                    )
                  ],
                ),
              )
            : ListView.builder(
                itemCount: logic.getAllAddressModel?.address?.length ?? 0,
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () {
                      logic.onSelectAddress(
                        index: index,
                        addressId: logic.getAllAddressModel?.address?[index].id ?? "",
                      );
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.whiteColor,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: Constant.boxShadow,
                        border: Border.all(
                          color: AppColors.greyColor.withOpacity(0.15),
                          width: 1,
                        ),
                      ),
                      child: Stack(
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: Get.width * 0.8,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      Constant.capitalizeFirstLetter(logic.getAllAddressModel?.address?[index].name ?? ""),
                                      style: TextStyle(
                                        color: AppColors.appText,
                                        fontFamily: AppFontFamily.heeBo500,
                                        fontSize: 15,
                                      ),
                                    ),
                                    SizedBox(
                                      width: Get.width * 0.7,
                                      child: Text(
                                        Constant.capitalizeFirstLetter(
                                            "${logic.getAllAddressModel?.address?[index].address ?? ""} \n${logic.getAllAddressModel?.address?[index].city ?? ""}, ${logic.getAllAddressModel?.address?[index].state ?? ""}\n${logic.getAllAddressModel?.address?[index].country ?? ""},${logic.getAllAddressModel?.address?[index].zipCode.toString() ?? ""}"),
                                        style: TextStyle(
                                          color: AppColors.appText,
                                          fontFamily: AppFontFamily.heeBo500,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ),
                                  ],
                                ).paddingOnly(top: 28, left: 15, right: 15, bottom: 10),
                              ),
                              const Spacer(),
                              logic.selectAddress == index
                                  ? Container(
                                      height: 25,
                                      width: 25,
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAppColor,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: AppColors.greyColor.withOpacity(0.3),
                                          width: 0.8,
                                        ),
                                      ),
                                      child: Image.asset(AppAsset.icCheck).paddingAll(6),
                                    )
                                  : Container(
                                      height: 25,
                                      width: 25,
                                      decoration: BoxDecoration(
                                        color: AppColors.whiteColor,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: AppColors.greyColor.withOpacity(0.3),
                                          width: 1,
                                        ),
                                      ),
                                    ),
                            ],
                          ).paddingOnly(right: 20),
                          Container(
                            height: 22,
                            width: Get.width * 0.21,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              borderRadius: const BorderRadius.only(
                                bottomRight: Radius.circular(14),
                                topLeft: Radius.circular(12),
                              ),
                              color: AppColors.sellerBg,
                            ),
                            child: Text(
                              "${"txtAddress".tr} ${index + 1}",
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo700,
                                fontSize: 11.5,
                                color: AppColors.sellerYellow,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ).paddingOnly(bottom: 12),
                  );
                },
              ).paddingOnly(top: 15, left: 13, right: 13);
      },
    );
  }
}

class SelectAddressBottomView extends StatelessWidget {
  const SelectAddressBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SelectAddressController>(
      id: Constant.idSelectAddress,
      builder: (logic) {
        return logic.selectAddress == -1
            ? GestureDetector(
                onTap: () {
                  Get.toNamed(
                    AppRoutes.addNewAddress,
                    arguments: [
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      false,
                      false,
                      "",
                    ],
                  )?.then(
                    (value) async {
                      await logic.onGetAllAddressApiCall();
                    },
                  );
                },
                child: Container(
                  height: 52,
                  width: Get.width,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(44),
                    color: AppColors.productBg,
                    border: Border.all(
                      color: AppColors.primaryAppColor,
                      width: 1,
                    ),
                  ),
                  margin: const EdgeInsets.all(15),
                  child: Center(
                    child: Text(
                      "txtAddNewAddress".tr,
                      style: TextStyle(
                        color: AppColors.primaryAppColor,
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              )
            : Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        logic.onEditAddress();
                      },
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(44),
                          color: AppColors.productBg,
                          border: Border.all(
                            color: AppColors.primaryAppColor,
                            width: 1,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            "txtEditAddress".tr,
                            style: TextStyle(
                              color: AppColors.primaryAppColor,
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
                    child: GestureDetector(
                      onTap: () {
                        Get.toNamed(
                          AppRoutes.productPayment,
                          arguments: [
                            logic.totalAmount,
                            logic.productId,
                            logic.quantity,
                            logic.attributes,
                            logic.withoutCart,
                          ],
                        );
                      },
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(44),
                          color: AppColors.primaryAppColor,
                        ),
                        child: Center(
                          child: Text(
                            "txtContinue".tr,
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
                ],
              ).paddingOnly(bottom: 15, left: 15, right: 15);
      },
    );
  }
}
