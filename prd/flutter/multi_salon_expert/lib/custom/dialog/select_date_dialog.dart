import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:syncfusion_flutter_datepicker/datepicker.dart';

class SelectDateDialog extends StatefulWidget {
  const SelectDateDialog({super.key});

  @override
  State<SelectDateDialog> createState() => _SelectDateDialogState();
}

class _SelectDateDialogState extends State<SelectDateDialog> {
  RevenueDetailController revenueDetailController = Get.put(RevenueDetailController());

  onSelectionChanged(DateRangePickerSelectionChangedArgs args) {
    setState(() {
      if (args.value is PickerDateRange) {
        revenueDetailController.startDateFormatted = DateFormat('yyyy/MM/dd').format(args.value.startDate);
        revenueDetailController.endDateFormatted = DateFormat('yyyy/MM/dd').format(args.value.endDate ?? args.value.startDate);

        revenueDetailController.range =
            '${revenueDetailController.startDateFormatted} - ${revenueDetailController.endDateFormatted}';
      } else if (args.value is DateTime) {
        revenueDetailController.selectedDates = args.value.toString();
      } else if (args.value is List<DateTime>) {
        revenueDetailController.dateCount = args.value.length.toString();
      } else {
        revenueDetailController.rangeCount = args.value.length.toString();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 480,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.dialogBg,
        borderRadius: BorderRadius.circular(30),
      ),
      child: SfDateRangePicker(
        onSelectionChanged: onSelectionChanged,
        selectionMode: DateRangePickerSelectionMode.range,
        showNavigationArrow: true,
        allowViewNavigation: true,
        headerStyle: DateRangePickerHeaderStyle(
          textAlign: TextAlign.center,
          textStyle: TextStyle(
            fontFamily: FontFamily.sfProDisplay,
            color: AppColors.primaryAppColor,
            fontSize: 20,
          ),
        ),
        endRangeSelectionColor: AppColors.primaryAppColor,
        navigationMode: DateRangePickerNavigationMode.snap,
        cancelText: "Cancel",
        confirmText: "Submit",
        onCancel: () {
          Get.back();
        },
        onSubmit: (p0) async {
          await revenueDetailController.onPaymentHistoryApiCall(
            expertId: Constant.storage.read<String>("expertId").toString(),
            startDate: revenueDetailController.startDateFormatted,
            endDate: revenueDetailController.endDateFormatted,
          );

          if (revenueDetailController.paymentHistoryCategory?.status == true) {
            Get.back();
          } else {
            Utils.showToast(Get.context!, revenueDetailController.paymentHistoryCategory?.message ?? "");
          }
        },
        rangeTextStyle: TextStyle(
          color: AppColors.primaryAppColor,
          fontFamily: FontFamily.sfProDisplayMedium,
          fontSize: 15,
        ),
        startRangeSelectionColor: AppColors.primaryAppColor,
        showActionButtons: true,
        monthCellStyle: DateRangePickerMonthCellStyle(
          textStyle: TextStyle(
            color: AppColors.grey,
            fontFamily: FontFamily.sfProDisplayMedium,
            fontSize: 15,
          ),
        ),
        initialSelectedRange: PickerDateRange(
          DateTime.now().subtract(
            const Duration(days: 0),
          ),
          DateTime.now().add(
            const Duration(days: 5),
          ),
        ),
      ),
    );
  }
}
