import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/csc_picker/csc_picker.dart';
import 'package:salon_2/custom/text_field/address_text_field.dart';
import 'package:salon_2/ui/add_new_address_screen/controller/add_new_address_controller.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class AddNewAddressAppBarView extends StatelessWidget {
  const AddNewAddressAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtAddNewAddress".tr,
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

class AddNewAddressTitleView extends StatelessWidget {
  const AddNewAddressTitleView({super.key});

  @override
  Widget build(BuildContext context) {
    return ViewAll(
      title: "txtEnterAddressDetails".tr,
      subtitle: "",
      textColor: AppColors.primaryTextColor,
      fontFamily: AppFontFamily.heeBo700,
      fontSize: 18,
    ).paddingOnly(bottom: 14);
  }
}

class AddNewAddressDataView extends StatelessWidget {
  const AddNewAddressDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: GetBuilder<AddNewAddressController>(
        builder: (logic) {
          return Form(
            key: logic.formKey,
            child: Column(
              children: [
                AddressTextField(
                  labelText: "txtFirstName".tr,
                  controller: logic.firstNameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "txtEnterYourFirstName".tr;
                    }
                    return null;
                  },
                ).paddingOnly(bottom: 25),
                AddressTextField(
                  labelText: "txtLastName".tr,
                  controller: logic.lastNameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "txtEnterYourLastName".tr;
                    }
                    return null;
                  },
                ).paddingOnly(bottom: 25),
                const AddNewAddressCountryView().paddingOnly(bottom: 25),
                AddressTextField(
                  labelText: "txtAddressLine1".tr,
                  controller: logic.addressLine1Controller,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "desPleaseAddressLine1".tr;
                    }
                    return null;
                  },
                ).paddingOnly(bottom: 25),
                AddressTextField(
                  labelText: "txtAddressLine2".tr,
                  controller: logic.addressLine2Controller,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "desPleaseAddressLine2".tr;
                    }
                    return null;
                  },
                ).paddingOnly(bottom: 25),
              ],
            ),
          );
        },
      ),
    );
  }
}

class AddNewAddressCountryView extends StatelessWidget {
  const AddNewAddressCountryView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AddNewAddressController>(
      builder: (logic) {
        return CSCPicker(
          showStates: true,
          showCities: true,
          flagState: CountryFlag.disable,
          dropdownDecoration: BoxDecoration(
            borderRadius: const BorderRadius.all(
              Radius.circular(10),
            ),
            color: Colors.white,
            border: Border.all(
              color: Colors.grey.shade300,
              width: 1,
            ),
          ),
          disabledDropdownDecoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10)),
            color: Colors.grey.shade300,
            border: Border.all(color: Colors.grey.shade300, width: 1),
          ),
          countrySearchPlaceholder: "txtCountry".tr,
          stateSearchPlaceholder: "txtState".tr,
          citySearchPlaceholder: "txtCity".tr,
          countryDropdownLabel: logic.country?.isEmpty == true ? "txtSelectCountry".tr : logic.country ?? "",
          stateDropdownLabel: logic.state?.isEmpty == true ? "txtSelectState".tr : logic.state ?? "",
          cityDropdownLabel: logic.city?.isEmpty == true ? "txtSelectCity".tr : logic.city ?? "",
          selectedItemStyle: TextStyle(
            color: AppColors.appText,
            fontFamily: AppFontFamily.heeBo500,
            fontSize: 15,
          ),
          dropdownDialogRadius: 10.0,
          searchBarRadius: 10.0,
          onCountryChanged: (value) {
            log("onCountryChanged :: $value");

            logic.country = value;
            log("Selected Country :: ${logic.country}");
          },
          onStateChanged: (value) {
            log("onStateChanged :: $value");

            logic.state = value;
            log("Selected State :: ${logic.state}");
          },
          onCityChanged: (value) {
            log("City Changed :: $value");

            logic.city = value;
            log("Selected City :: ${logic.city}");
          },
        );
      },
    );
  }
}

class AddNewAddressSetPrimaryView extends StatelessWidget {
  const AddNewAddressSetPrimaryView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AddNewAddressController>(
      id: Constant.idSetPrimary,
      builder: (logic) {
        return InkWell(
          onTap: () {
            logic.onSelectAddress();
          },
          overlayColor: WidgetStateColor.transparent,
          child: Row(
            children: [
              logic.isSetPrimary == true
                  ? Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(
                        color: AppColors.primaryAppColor,
                        borderRadius: BorderRadius.circular(6),
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
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.greyColor.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                    ),
              Text(
                "txtSetPrimary".tr,
                style: TextStyle(
                  color: AppColors.appText,
                  fontFamily: AppFontFamily.heeBo500,
                  fontSize: 16,
                ),
              ).paddingOnly(left: 10),
            ],
          ).paddingOnly(left: 5),
        );
      },
    );
  }
}

class AddNewAddressBottomView extends StatelessWidget {
  const AddNewAddressBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AddNewAddressController>(
      builder: (logic) {
        return GestureDetector(
          onTap: () {
            logic.onClickSaveAddress();
          },
          child: Container(
            height: 52,
            width: Get.width,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(44),
              color: AppColors.primaryAppColor,
            ),
            margin: const EdgeInsets.all(15),
            child: Center(
              child: Text(
                "txtSaveAddress".tr,
                style: TextStyle(
                  color: AppColors.whiteColor,
                  fontFamily: AppFontFamily.heeBo700,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
