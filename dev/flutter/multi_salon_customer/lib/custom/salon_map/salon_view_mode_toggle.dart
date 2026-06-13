import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

/// Bascule liste / carte (alignée sur le site web).
class SalonViewModeToggle extends StatelessWidget {
  const SalonViewModeToggle({
    super.key,
    required this.isMapView,
    required this.onChanged,
  });

  final bool isMapView;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(15, 10, 15, 4),
      child: Row(
        children: [
          _ModeButton(
            label: 'txtViewList'.tr,
            icon: Icons.view_list_rounded,
            selected: !isMapView,
            onTap: () => onChanged(false),
          ),
          const SizedBox(width: 8),
          _ModeButton(
            label: 'txtViewMap'.tr,
            icon: Icons.map_outlined,
            selected: isMapView,
            onTap: () => onChanged(true),
          ),
        ],
      ),
    );
  }
}

class _ModeButton extends StatelessWidget {
  const _ModeButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: selected
            ? AppColors.primaryAppColor.withOpacity(0.12)
            : AppColors.whiteColor,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: selected
                    ? AppColors.primaryAppColor
                    : AppColors.lineColor,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: selected
                      ? AppColors.primaryAppColor
                      : AppColors.grey,
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    fontSize: 13,
                    color: selected
                        ? AppColors.primaryAppColor
                        : AppColors.blackColor,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
