import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/hair_profile_screen/controller/hair_profile_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class HairProfileScreen extends StatelessWidget {
  const HairProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        backgroundColor: AppColors.whiteColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close, color: AppColors.primaryAppColor),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'txtHairProfileTitle'.tr,
          style: TextStyle(
            color: AppColors.primaryAppColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
            fontFamily: AppFontFamily.sfProDisplayBold,
          ),
        ),
        centerTitle: true,
      ),
      body: GetBuilder<HairProfileController>(
        builder: (logic) {
          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'txtHairProfileLead'.tr,
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.45,
                          color: AppColors.grey,
                          fontFamily: AppFontFamily.sfProDisplayRegular,
                        ),
                      ),
                      const SizedBox(height: 24),
                      _section(
                        'txtHairProfileQ1'.tr,
                        HairProfileController.hairTypes,
                        logic.hairType,
                        logic.selectHairType,
                      ),
                      _section(
                        'txtHairProfileQ2'.tr,
                        HairProfileController.conditions,
                        logic.hairCondition,
                        logic.selectCondition,
                      ),
                      _section(
                        'txtHairProfileQ3'.tr,
                        HairProfileController.interests,
                        logic.styleInterest,
                        logic.selectInterest,
                      ),
                      _section(
                        'txtHairProfileQ4'.tr,
                        HairProfileController.scalpOptions,
                        logic.scalpSensitivity,
                        logic.selectScalp,
                      ),
                      _section(
                        'txtHairProfileQ5'.tr,
                        HairProfileController.goals,
                        logic.bookingGoal,
                        logic.selectGoal,
                      ),
                    ],
                  ),
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: logic.canSave ? logic.saveAndClose : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryAppColor,
                        disabledBackgroundColor:
                            AppColors.primaryAppColor.withOpacity(0.4),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'txtHairProfileSave'.tr,
                        style: TextStyle(
                          color: AppColors.whiteColor,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          fontFamily: AppFontFamily.sfProDisplayBold,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _section(
    String title,
    List<String> optionIds,
    String? selected,
    void Function(String) onSelect,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.blackColor,
              fontFamily: AppFontFamily.sfProDisplayBold,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: optionIds.map((id) {
              final isSelected = selected == id;
              return ChoiceChip(
                label: Text(id.tr),
                selected: isSelected,
                onSelected: (_) => onSelect(id),
                selectedColor: AppColors.primaryAppColor.withOpacity(0.15),
                labelStyle: TextStyle(
                  color: isSelected
                      ? AppColors.primaryAppColor
                      : AppColors.blackColor,
                  fontWeight:
                      isSelected ? FontWeight.w600 : FontWeight.normal,
                  fontSize: 13,
                ),
                side: BorderSide(
                  color: isSelected
                      ? AppColors.primaryAppColor
                      : AppColors.lineColor,
                ),
                backgroundColor: AppColors.whiteColor,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
