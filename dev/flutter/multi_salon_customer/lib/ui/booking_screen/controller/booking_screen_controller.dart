import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/bottom_sheet/payment_bottom_sheet.dart';
import 'package:salon_2/custom/dialog/confirm_dialog.dart';
import 'package:salon_2/custom/dialog/success_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_screen/model/create_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_check_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_expert_service_base_salon_model.dart';
import 'package:salon_2/ui/branch_detail_screen/model/get_salon_detail_model.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/payment_screen/method/flutter_wave/flutter_wave_service.dart';
import 'package:salon_2/ui/payment_screen/method/razor_pay/razor_pay_service.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/ui/wallet_screen/model/get_coupon_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class BookingScreenController extends GetxController {
  int currentStep = 0;
  int stepCount = 0;
  int selectExpert = -1;
  bool checkValue = false;
  bool isFirstTap = false;
  String selectedPayment = "wallet";
  List<String> morningSlots = [];
  List<String> afternoonSlots = [];
  List<String> eveningSlots = [];
  List<String> selectedSlotsList = [];
  String selectedSlot = '';
  final Map<String, Set<String>> disabledSlotsMap = {};
  String? slotsString;
  String? expertId;
  double? rupee;
  String? formattedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String date = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String formattedDateNow = "";
  List checkItem = [];
  String breakStartTimes = '';
  String breakEndTimes = '';
  List serviceId = [];
  double totalPrice = 0.0;
  double finalTaxRupee = 0.0;
  double withOutTaxRupee = 0.0;
  int? totalDuration;
  int? tax;
  int? totalMinute;
  String? salonId;
  String? expertDetail;
  String? salonName; // Add salon name variable
  String? salonAddress; // Add salon address variable
  List<dynamic> selectedExpertDataList = [];

  // Import the salon detail model and controller
  GetSalonDetailModel? getSalonDetailCategory;

  num? rating;
  int? roundedRating;
  int? filledStars;

  /// Morning Slot Hide
  bool hasMorningSlots = true;

  /// AfterNoon Slot Hide
  bool hasAfternoonSlots = true;

  dynamic args = Get.arguments;
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.find<SplashController>();
  WalletScreenController walletScreenController =
      Get.find<WalletScreenController>();
  CategoryDetailController categoryDetailController =
      Get.put(CategoryDetailController());
  BranchDetailController branchDetailController =
      Get.put(BranchDetailController());
  SelectBranchController selectBranchController =
      Get.put(SelectBranchController());
  SearchScreenController searchScreenController =
      Get.put(SearchScreenController());

  TextEditingController searchEditingController = TextEditingController();
  TextEditingController couponCodeController = TextEditingController();

  //------ Split Break Time Variables ------//
  String? str;
  List? parts;
  String? breakStartTime;
  String? breakEndTime;

  //----------- API Variables -----------//
  GetBookingModel? getBookingModel;

  //----------- Coupon Variables -----------//
  GetCouponModel? getCouponModel;
  int applyCoupon = -1;
  String? selectedCouponId;
  String? manualCouponCode; // Store manually entered coupon code
  double couponDiscountAmount = 0.0;
  double totalPriceAfterDiscount = 0.0;
  GetCheckBookingModel? getCheckBookingCategory;
  CreateBookingModel? createBookingCategory;
  GetExpertServiceBaseSalonModel? getExpertServiceBaseSalonCategory;
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  Map<String, PurchaseDetails>? purchases;

  String selectedVenue = "";

  void selectVenue(String venue) {
    selectedVenue = venue;
    update([Constant.idProgressView, Constant.idConfirm]);
  }

  void onAddressSelected() {
    // Update the UI to show the address is selected
    update([Constant.idProgressView, Constant.idConfirm]);
  }

  @override
  void onInit() async {
    log("Enter booking screen controller");
    await getDataFromArgs();
    await onGetExpertServiceBasedSalonApiCall(
        serviceId: serviceId.join(","), salonId: salonId.toString());

    // Check if expert is pre-selected (coming from Top Experts)
    expertDetail = Constant.storage.read("expertDetail");
    if (expertDetail != null) {
      // For Top Experts: venue selection is step 0, staff info is step 1
      currentStep = 0;
      stepCount = 0;
      onExpertSelect();
      // Fetch salon details to get real address
      await fetchSalonDetails();

      // Get salon name from home screen controller expert data
      await homeScreenController.onGetExpertApiCall(expertId: expertDetail!);
      if (homeScreenController.getExpertCategory?.data?.expert?.salonId?.name !=
          null) {
        salonName =
            homeScreenController.getExpertCategory!.data!.expert!.salonId!.name;
        log("Salon name from home controller: $salonName");
      }
    }

    // Salon address will be fetched from API when needed

    onCheckBoxClick();
    onGetSlotsList();
    update(
        [Constant.idServiceList, Constant.idBottomService, Constant.idConfirm]);

    Stripe.publishableKey =
        splashController.settingCategory?.setting?.stripePublishableKey ?? "";
    log("Stripe Publishable Key: ${splashController.settingCategory?.setting?.stripeSecretKey ?? ""}");
    log("Stripe Publishable Key:Stripe.publishableKey ${Stripe.publishableKey}");

    await Stripe.instance.applySettings();
    await splitBreakTime();

    super.onInit();
  }

  String getCurrentTime() {
    final now = DateTime.now();
    log("Time now == $now");
    final formatter = DateFormat('h:mm a');
    return formatter.format(now);
  }

  bool isTimePassed(String time) {
    final currentTime = getCurrentTime();
    log("..........timing == $time");
    return time.compareTo(currentTime) < 0;
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null ||
          args[5] != null ||
          args[6] != null) {
        checkItem = args[0];
        totalPrice = args[1];
        finalTaxRupee = args[2];
        totalMinute = args[3];
        serviceId = args[4];
        withOutTaxRupee = args[5];
        salonId = args[6];

        log("booking controller checkItem :: $checkItem");
        log("booking controller serviceId :: $serviceId");
        log("booking controller totalPrice :: $totalPrice");
        log("booking controller finalTaxRupee :: $finalTaxRupee");
        log("booking controller totalMinute :: $totalMinute");
        log("booking controller withOutTaxRupee  :: $withOutTaxRupee");
        log("booking controller salonId :: $salonId");
      }
    }

    // Get salon name from expert data if coming from Top Experts
    expertDetail = Constant.storage.read("expertDetail");
    if (expertDetail != null) {
      // Try to get salon name from home screen controller
      try {
        salonName =
            homeScreenController.getExpertCategory?.data?.expert?.salonId?.name;
        log("Salon name from expert data: $salonName");
      } catch (e) {
        log("Error getting salon name: $e");
        salonName = "Salon"; // Default fallback
      }
    }
  }

  onCheckBoxClick() {
    withOutTaxRupee = 0.0;
    totalPrice = 0.0;
    finalTaxRupee = 0.0;

    double taxPercentage =
        getExpertServiceBaseSalonCategory?.tax?.toDouble() ?? 0.0;

    for (int i = 0;
        i < (getExpertServiceBaseSalonCategory?.matchedServices?.length ?? 0);
        i++) {
      num servicePrice =
          getExpertServiceBaseSalonCategory?.matchedServices?[i].price ?? 0.0;
      double withTaxRupee = (servicePrice * taxPercentage) / 100;

      withOutTaxRupee += servicePrice;
      totalPrice += (servicePrice + withTaxRupee);
      finalTaxRupee += withTaxRupee;
    }

    log("Booking add WithOutTaxRupee :: $withOutTaxRupee");
    log("Booking add Total Price :: $totalPrice");
    log("Booking add FinalTaxRupee :: $finalTaxRupee");

    // Fetch available coupons when booking amount is calculated
    if (withOutTaxRupee > 0) {
      String userId = Constant.storage.read<String>('userId') ?? "";
      getCouponApiCall(
        userId: userId,
        type: "2", // Type 2 for booking
        amount: withOutTaxRupee.toInt().toString(),
      );
    }

    update(
        [Constant.idServiceList, Constant.idBottomService, Constant.idConfirm]);
  }

  onBackStep() {
    if (currentStep > 0) {
      // If expert is pre-selected and we're at date/time step, go back to venue selection
      if (expertDetail != null && currentStep == 2) {
        stepCount = 0;
        currentStep = 0;
        log("Going back to venue selection from date/time step");
      } else {
        stepCount--;
        currentStep -= 1;
      }
    } else {
      Get.back();
    }
    update([Constant.idCurrentStep, Constant.idConfirm]);
  }

  onConfirmButton(BuildContext context) {
    final constant = Constant();
    final isLastStep = currentStep == constant.stepper().length - 1;
    if (isLastStep) {
      checkValue = false;

      if (selectedPayment == "wallet") {
        if (totalPrice > double.parse(walletAmount.toString())) {
          showModalBottomSheet(
            isScrollControlled: true,
            context: context,
            builder: (BuildContext context) {
              return const PaymentBottomSheet(isRecharge: false);
            },
          ).then(
            (value) async {
              await walletScreenController.onGetWalletHistoryApiCall(
                userId: Constant.storage.read<String>('userId') ?? "",
                month: DateFormat('yyyy-MM').format(DateTime.now()),
              );
            },
          );
        } else {
          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              shadowColor: AppColors.transparent,
              elevation: 0,
              child: const ConfirmDialog(),
            ),
          );
        }
      } else {
        Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            shadowColor: AppColors.transparent,
            elevation: 0,
            child: const ConfirmDialog(),
          ),
        );
      }

      log("----------Completed--------------");
    } else {
      stepCount++;
      currentStep += 1;

      // For Top Experts: Handle the new step flow
      if (expertDetail != null) {
        if (currentStep == 1) {
          // Just moved from venue selection to staff info display - no API call needed
          log("Top Experts: Moved to staff info display step");
        } else if (currentStep == 2) {
          // Moving from staff info to date/time - trigger booking API call
          log("Top Experts: Moving to date/time selection");
          _triggerBookingApiCall();
        }
      }
    }
    update([
      Constant.idConfirm,
      Constant.idCurrentStep,
      Constant.idStep1,
      Constant.idStep3
    ]);
  }

  // Helper method to trigger booking API call
  _triggerBookingApiCall() async {
    try {
      await onGetBookingApiCall(
        selectedDate: date,
        expertId: Constant.storage.read<String>('expertDetail') != null
            ? Constant.storage.read<String>('expertDetail').toString()
            : Constant.storage.read<String>('expertId').toString(),
        salonId: salonId.toString(),
      );

      formattedDate = date;
      splitBreakTime();
      onGetSlotsList();

      log("Get Booking Status :: ${getBookingModel?.status}");
      if (getBookingModel?.status == false) {
        Utils.showToast(Get.context!, getBookingModel?.message ?? "");
      }

      rupee = (totalPrice.toDouble() + finalTaxRupee.toDouble());
      log("rupee :: $rupee");
    } catch (e) {
      log("Error triggering booking API call: $e");
    }
  }

  onStep1(int index) {
    if (selectExpert == index) {
      selectExpert = -1;
    } else {
      selectExpert = index;
    }

    log("-----------------------$index");
    update([Constant.idStep1, Constant.idProgressView, Constant.idConfirm]);
  }

  onExpertSelect() {
    expertDetail = Constant.storage.read("expertDetail");

    if (expertDetail != null) {
      for (int i = 0;
          i < (getExpertServiceBaseSalonCategory?.data?.length ?? 0);
          i++) {
        if (getExpertServiceBaseSalonCategory?.data?[i].id == expertDetail) {
          selectExpert = i;
          selectExpert = 0;
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].id);
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].fname);
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].lname);
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].image);
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].review);
          selectedExpertDataList
              .add(getExpertServiceBaseSalonCategory?.data?[i].reviewCount);

          // Store salon name and ID for address fetching
          salonName = getExpertServiceBaseSalonCategory?.data?[i].salon;

          log("selectedExpertIndices :: $selectedExpertDataList");
          log("salonName (ID) :: $salonName");
          break;
        }
      }
    }
  }

  // Fetch actual salon details including address
  Future<void> fetchSalonDetails() async {
    if (salonId == null) return;

    try {
      isLoading1(true);

      final queryString = "salonId=$salonId";
      final url = Uri.parse(
          '${ApiConstant.BASE_URL}${ApiConstant.getSalonDetail}$queryString');

      log("Fetch Salon Details Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Fetch Salon Details StatusCode :: ${response.statusCode}");
      log("Fetch Salon Details Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getSalonDetailCategory = GetSalonDetailModel.fromJson(jsonResponse);

        // Build the actual salon address
        final addressDetails = getSalonDetailCategory?.salon?.addressDetails;
        if (addressDetails != null) {
          salonAddress =
              "${addressDetails.addressLine1 ?? ''}, ${addressDetails.landMark ?? ''}, ${addressDetails.city ?? ''}, ${addressDetails.state ?? ''}, ${addressDetails.country ?? ''}";
          // Clean up extra commas and spaces
          salonAddress = salonAddress
              ?.replaceAll(RegExp(r',\s*,'), ',')
              .replaceAll(RegExp(r'^,\s*|,\s*$'), '');
          log("Real Salon Address :: $salonAddress");
        }

        update([Constant.idProgressView, Constant.idConfirm]);
      }
    } catch (e) {
      log("Error fetching salon details: $e");
      // Fallback to a generic address if API fails
      salonAddress = "Salon Address";
    } finally {
      isLoading1(false);
    }
  }

  splitBreakTime() {
    breakStartTime = getBookingModel?.salonTime?.breakStartTime;
    breakEndTime = getBookingModel?.salonTime?.breakEndTime;
  }

  onGetSlotsList() {
    morningSlots.clear();
    afternoonSlots.clear();

    totalDuration = getBookingModel?.salonTime?.time?.toInt();
    breakStartTimes = breakStartTime ?? "";
    breakEndTimes = breakEndTime ?? "";

    for (var i = 0;
        i < (getBookingModel?.allSlots?.morning?.length ?? 0);
        i++) {
      morningSlots.add(getBookingModel?.allSlots?.morning?[i] ?? "");
    }

    for (var i = 0;
        i < (getBookingModel?.allSlots?.evening?.length ?? 0);
        i++) {
      afternoonSlots.add(getBookingModel?.allSlots?.evening?[i] ?? "");
    }

    afternoonSlots = afternoonSlots.sublist(1);

    log("Morning Slot :: $morningSlots");
    log("Afternoon Slot :: $afternoonSlots");

    update([Constant.idUpdateSlots, Constant.idProgressView]);
  }

  bool isBreakTime(String slot) {
    DateTime slotTime = DateFormat('hh:mm a').parse(slot);
    DateTime breakStartTime = DateFormat('hh:mm a').parse(breakStartTimes);
    DateTime breakEndTime = DateFormat('hh:mm a').parse(breakEndTimes);

    return slotTime.isAfter(breakStartTime) && slotTime.isBefore(breakEndTime);
  }

  void addSlotsUntilTime(DateTime targetTime) {
    selectedSlotsList.clear();
    log("object :: $targetTime");
    DateTime selectedSlotTime = DateFormat('hh:mm a').parse(selectedSlot);

    selectedSlotsList.add(selectedSlot);

    int iterations = ((targetTime.hour * 60 + targetTime.minute) -
            (selectedSlotTime.hour * 60 + selectedSlotTime.minute)) ~/
        totalDuration!;
    log("iterations :: $iterations");

    for (int i = 0; i < iterations; i++) {
      selectedSlotTime =
          selectedSlotTime.add(Duration(minutes: totalDuration!.toInt()));

      if (isBreakTime(DateFormat('hh:mm a').format(selectedSlotTime))) {
        continue;
      }

      if (selectedSlotTime.isAtSameMomentAs(targetTime)) {
        break;
      }

      selectedSlotsList.add(DateFormat('hh:mm a').format(selectedSlotTime));
    }
  }

  List<DateTime> getDisabledDates() {
    DateTime currentDate = DateTime.now();
    List<DateTime> disabledDates = [];

    for (int i = 0; i < currentDate.day - 1; i++) {
      disabledDates.add(currentDate.subtract(Duration(days: i + 1)));
    }

    return disabledDates;
  }

  void disableSlot(String date, String slot) {
    if (!disabledSlotsMap.containsKey(date)) {
      disabledSlotsMap[date] = {};
    }
    disabledSlotsMap[date]?.add(slot);
  }

  bool isSlotDisabled(String date, String slot) {
    return disabledSlotsMap[date]?.contains(slot) ?? false;
  }

  selectSlot(String slot) {
    selectedSlot = slot;
    DateTime selectedDateTime = DateFormat('hh:mm a').parse(selectedSlot);
    DateTime targetTime =
        selectedDateTime.add(Duration(minutes: totalMinute?.toInt() ?? 0));
    addSlotsUntilTime(targetTime);

    slotsString = selectedSlotsList.join(',');
    log("Slots String :: $slotsString");
    log("Slots String :: $selectedSlotsList");
    update(
        [Constant.idUpdateSlots0, Constant.idConfirm, Constant.idUpdateSlots]);
  }

  onStep3(String value) {
    selectedPayment = value;

    log("currentIndex::$selectedPayment");
    update([Constant.idStep3, Constant.idConfirm]);
  }

  onGetExpertServiceBasedSalonApiCall(
      {required String serviceId, required String salonId}) async {
    try {
      isLoading1(true);
      update([Constant.idProgressView, Constant.idSelectBranch]);

      final url = Uri.parse(
          '${ApiConstant.BASE_URL}${ApiConstant.getExpertServiceBasedSalon}?serviceId=$serviceId&salonId=$salonId');

      log("Get Expert Service Based Salon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Expert Service Based Salon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Expert Service Based Salon StatusCode :: ${response.statusCode}");
      log("Get Expert Service Based Salon Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getExpertServiceBaseSalonCategory =
            GetExpertServiceBaseSalonModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Service Based Salon Api :: $e");
    } finally {
      isLoading1(false);
      update([Constant.idProgressView, Constant.idSelectBranch]);
    }
  }

  onGetBookingApiCall(
      {required String selectedDate,
      required String expertId,
      required String salonId}) async {
    try {
      isLoading1(true);
      update([
        Constant.idProgressView,
        Constant.idUpdateSlots,
        Constant.idUpdateSlots0
      ]);

      final queryParameters = {
        "date": selectedDate,
        "expertId": expertId,
        "salonId": salonId
      };

      log("Get Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getBooking + queryString);

      log("Get Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY};
      log("Get Booking Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Booking StatusCode :: ${response.statusCode}");
      log("Get Booking Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getBookingModel = GetBookingModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Booking Api :: $e");
      Utils.showToast(Get.context!, getBookingModel?.message.toString() ?? "");
    } finally {
      isLoading1(false);
      update([
        Constant.idProgressView,
        Constant.idUpdateSlots,
        Constant.idUpdateSlots0
      ]);
    }
  }

  onGetCheckBookingApiCall({
    required String userId,
    required String expertId,
    required String date,
    required String time,
    required String serviceId,
    required double amount,
    required int withoutTax,
    required String salonId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Check Booking Headers :: $headers");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.checkBooking);
      var request = http.Request('GET', url);

      log("Get Check Booking Url :: $request");

      request.body = json.encode({
        "userId": userId,
        "expertId": expertId,
        "serviceId": serviceId,
        "salonId": salonId,
        "date": date,
        "time": time,
        "amount": amount,
        "withoutTax": withoutTax
      });

      log("Get Check Booking Body :: ${request.body}");

      request.headers.addAll(headers);

      http.StreamedResponse response = await request.send();

      log("Get Check Booking Status Code :: ${response.statusCode}");

      if (response.statusCode == 200) {
        final String bookingCategory = await response.stream.bytesToString();

        log("Get Check Booking Response :: $bookingCategory");
        getCheckBookingCategory =
            GetCheckBookingModel.fromJson(json.decode(bookingCategory));
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Check Booking Api :: $e");
      Utils.showToast(
          Get.context!, getCheckBookingCategory?.status?.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCreateBookingApiCall({
    required String userId,
    required String expertId,
    required String serviceId,
    required String salonId,
    required String date,
    required String time,
    required double amount,
    required double withoutTax,
    required String paymentType,
    required int atPlace,
    required String address,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      // Recalculate amount right before sending to ensure accuracy
      // This matches the backend calculation exactly
      calculateTotalWithDiscount();

      // Use the recalculated totalPrice as the final amount
      double finalAmount = totalPrice;

      // Prepare coupon ID - use selectedCouponId if available, otherwise try to find by manual code
      String? couponIdToSend = selectedCouponId;

      // If manual coupon code is used but no ID found, try to find it in the list
      if (couponIdToSend == null &&
          manualCouponCode != null &&
          getCouponModel?.data != null) {
        for (var coupon in getCouponModel!.data!) {
          if (coupon.code?.toUpperCase() == manualCouponCode!.toUpperCase()) {
            couponIdToSend = coupon.id;
            selectedCouponId = coupon.id;
            break;
          }
        }
      }

      final body = json.encode({
        "userId": userId,
        "expertId": expertId,
        "serviceId": serviceId,
        "salonId": salonId,
        "date": date,
        "time": time,
        "amount": finalAmount,
        "withoutTax": withoutTax,
        "paymentType": paymentType,
        "atPlace": atPlace,
        "address": address,
        if (couponIdToSend != null && couponIdToSend.isNotEmpty)
          "couponId": couponIdToSend,
      });

      log("Create Booking - selectedCouponId: $selectedCouponId");
      log("Create Booking - couponDiscountAmount: $couponDiscountAmount");
      log("Create Booking - finalAmount: $finalAmount");
      log("Create Booking - amount (original param): $amount");
      log("Create Booking - withoutTax: $withoutTax");
      log("Create Booking - withOutTaxRupee: $withOutTaxRupee");
      log("Create Booking - finalTaxRupee: $finalTaxRupee");
      log("Create Booking - totalPrice: $totalPrice");
      log("Create Booking Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createBooking);
      log("Create Booking Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.post(url, headers: headers, body: body);

      log("Create Booking Status Code :: ${response.statusCode}");
      log("Create Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        createBookingCategory = CreateBookingModel.fromJson(jsonResponse);
      }

      Utils.showToast(
          Get.context!, createBookingCategory?.message.toString() ?? "");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  //----------- Coupon API Methods -----------//
  getCouponApiCall(
      {required String userId,
      required String type,
      required String amount}) async {
    try {
      isLoading(true);
      update([Constant.idGetCoupon, Constant.idApplyCoupon]);

      final queryParameters = {
        "userId": userId,
        "type": type,
        "amount": amount,
      };

      log("Get Coupon Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url =
          Uri.parse(ApiConstant.BASE_URL + ApiConstant.getCoupon + queryString);
      log("Get Coupon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Coupon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Coupon Status Code :: ${response.statusCode}");
      log("Get Coupon Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getCouponModel = GetCouponModel.fromJson(jsonResponse);
      }

      log("Get Coupon Api Call Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Coupon Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idGetCoupon, Constant.idApplyCoupon]);
    }
  }

  validateCouponApiCall(
      {required String userId,
      required String couponId,
      required String type,
      required String amount}) async {
    try {
      isLoading(true);
      update([Constant.idGetCoupon, Constant.idApplyCoupon]);

      final queryParameters = {
        "userId": userId,
        "couponId": couponId,
        "type": type,
        "amount": amount,
      };

      log("Validate Coupon Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.validateCoupon + queryString);
      log("Validate Coupon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Validate Coupon Status Code :: ${response.statusCode}");
      log("Validate Coupon Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true) {
          couponDiscountAmount = (jsonResponse['data'] ?? 0.0).toDouble();
          calculateTotalWithDiscount();
          return true;
        } else {
          Utils.showToast(
              Get.context!, jsonResponse['message'] ?? "Invalid coupon");
          return false;
        }
      }
      return false;
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
      return false;
    } catch (e) {
      log("Error call Validate Coupon Api :: $e");
      Utils.showToast(Get.context!, "Error validating coupon");
      return false;
    } finally {
      isLoading(false);
      update([Constant.idGetCoupon, Constant.idApplyCoupon]);
    }
  }

  onSelectCoupon(int index) async {
    if (getCouponModel?.data == null ||
        index >= (getCouponModel?.data?.length ?? 0)) {
      return;
    }

    final coupon = getCouponModel!.data![index];
    String userId = Constant.storage.read<String>('userId') ?? "";

    if (applyCoupon == index) {
      // Deselect coupon
      applyCoupon = -1;
      selectedCouponId = null;
      couponDiscountAmount = 0.0;
      calculateTotalWithDiscount();
    } else {
      // Select and validate coupon
      applyCoupon = index;
      selectedCouponId = coupon.id;

      log("onSelectCoupon - Coupon selected:");
      log("  - Coupon ID: ${coupon.id}");
      log("  - Coupon Code: ${coupon.code}");
      log("  - selectedCouponId: $selectedCouponId");

      bool isValid = await validateCouponApiCall(
        userId: userId,
        couponId: coupon.code ?? "",
        type: "2", // Type 2 for booking
        amount: withOutTaxRupee.toInt().toString(),
      );

      if (!isValid) {
        applyCoupon = -1;
        selectedCouponId = null;
        couponDiscountAmount = 0.0;
      } else {
        log("onSelectCoupon - Coupon validated successfully");
        log("  - Discount Amount: $couponDiscountAmount");
      }
    }

    update([Constant.idGetCoupon, Constant.idApplyCoupon]);
  }

  // Apply manually entered coupon code
  onApplyManualCouponCode() async {
    String couponCode = couponCodeController.text.trim().toUpperCase();

    if (couponCode.isEmpty) {
      Utils.showToast(Get.context!, "Please enter a coupon code");
      return;
    }

    String userId = Constant.storage.read<String>('userId') ?? "";

    // Clear any previously selected coupon from list
    applyCoupon = -1;
    selectedCouponId = null;
    manualCouponCode = couponCode;

    log("onApplyManualCouponCode - Applying coupon code: $couponCode");

    bool isValid = await validateCouponApiCall(
      userId: userId,
      couponId: couponCode,
      type: "2", // Type 2 for booking
      amount: withOutTaxRupee.toInt().toString(),
    );

    if (!isValid) {
      manualCouponCode = null;
      couponCodeController.clear();
      Utils.showToast(
          Get.context!, "Invalid coupon code. Please check and try again.");
    } else {
      log("onApplyManualCouponCode - Coupon validated successfully");
      log("  - Discount Amount: $couponDiscountAmount");
      Utils.showToast(Get.context!, "Coupon applied successfully!");

      // Find the coupon in the list to get its ID
      if (getCouponModel?.data != null) {
        for (int i = 0; i < getCouponModel!.data!.length; i++) {
          if (getCouponModel!.data![i].code?.toUpperCase() == couponCode) {
            selectedCouponId = getCouponModel!.data![i].id;
            applyCoupon = i;
            log("onApplyManualCouponCode - Found coupon in list, ID: $selectedCouponId");
            break;
          }
        }
      }

      // If coupon not found in list, we need to fetch it or use the code
      // For now, we'll try to fetch available coupons again to see if it appears
      if (selectedCouponId == null) {
        log("onApplyManualCouponCode - Coupon not found in current list, will use code for booking");
        // The booking API will need to find the coupon by code
        // We'll handle this in the booking API call
      }
    }

    update([Constant.idGetCoupon, Constant.idApplyCoupon]);
  }

  // Remove manually entered coupon
  onRemoveManualCoupon() {
    couponCodeController.clear();
    manualCouponCode = null;
    selectedCouponId = null;
    applyCoupon = -1;
    couponDiscountAmount = 0.0;
    calculateTotalWithDiscount();
    update([Constant.idGetCoupon, Constant.idApplyCoupon]);
  }

  calculateTotalWithDiscount() {
    // Keep original withoutTax for backend (backend calculates discount on this)
    // Calculate tax on original amount (before discount) - matching backend calculation
    // Backend uses: taxAmount = (withoutTax * global.settingJSON.tax) / 100
    if (tax != null && tax! > 0) {
      finalTaxRupee = (withOutTaxRupee * tax!) / 100;
    } else {
      finalTaxRupee = 0.0;
    }

    // Calculate total with tax - matching backend: withTaxAmount = (taxAmount + withoutTax).toFixed(2)
    // Backend: withTaxAmount is a STRING from .toFixed(2)
    // But when backend does: totalAmount = withTaxAmount - discountAmount, it converts string to number
    // So we need to match that exact calculation
    double withTaxAmountNum = (finalTaxRupee + withOutTaxRupee);
    // Convert to string with .toFixed(2) then back to number to match backend's precision
    String withTaxAmountStr = withTaxAmountNum.toStringAsFixed(2);
    double withTaxAmount = double.parse(withTaxAmountStr);

    // Apply discount to get final total - matching backend: totalAmount = withTaxAmount - discountAmount
    // Backend: when it does "10.50" - 2, JavaScript converts string to number, so result is 8.5 (number)
    // We need to match that exact calculation
    totalPriceAfterDiscount = withTaxAmount - couponDiscountAmount;
    if (totalPriceAfterDiscount < 0) totalPriceAfterDiscount = 0;

    // Round to 2 decimal places to match backend calculation
    // Backend compares: totalAmount (NUMBER) !== bookingAmount (STRING from req.body.amount.toFixed(2))
    // Since backend does: totalAmount = parseFloat("10.50") - 2 = 8.5
    // And compares: 8.5 !== "8.50" (which is always true in strict comparison)
    // But the backend might be doing loose comparison or type coercion
    // We need to ensure our amount, when converted to string with .toFixed(2), matches backend's calculation
    totalPriceAfterDiscount =
        double.parse(totalPriceAfterDiscount.toStringAsFixed(2));

    totalPrice = totalPriceAfterDiscount;

    log("calculateTotalWithDiscount - withOutTaxRupee: $withOutTaxRupee");
    log("calculateTotalWithDiscount - tax percentage: $tax");
    log("calculateTotalWithDiscount - finalTaxRupee: $finalTaxRupee");
    log("calculateTotalWithDiscount - withTaxAmount (number): $withTaxAmount");
    log("calculateTotalWithDiscount - withTaxAmount (string): $withTaxAmountStr");
    log("calculateTotalWithDiscount - couponDiscountAmount: $couponDiscountAmount");
    log("calculateTotalWithDiscount - totalPriceAfterDiscount: $totalPriceAfterDiscount");
    log("calculateTotalWithDiscount - totalPrice: $totalPrice");
    log("calculateTotalWithDiscount - totalPrice as string (.toFixed(2)): ${totalPrice.toStringAsFixed(2)}");

    update([
      Constant.idProgressView,
      Constant.idGetCoupon,
      Constant.idApplyCoupon
    ]);
  }

  void resetCoupon() {
    applyCoupon = -1;
    selectedCouponId = null;
    manualCouponCode = null;
    couponCodeController.clear();
    couponDiscountAmount = 0.0;
    calculateTotalWithDiscount();
    update([Constant.idGetCoupon, Constant.idApplyCoupon]);
  }

  confirmDialogButton(BuildContext context) async {
    String userId = Constant.storage.read<String>('userId') ?? "";

    if (checkValue) {
      Get.back();

      if (selectedPayment == "wallet") {
        log("it's wallet ");

        // Ensure withoutTax is sent as double with 2 decimal places to match backend expectation
        double withoutTaxValue =
            double.parse(withOutTaxRupee.toStringAsFixed(2));

        await onCreateBookingApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          expertId: Constant.storage.read<String>('expertDetail') != null
              ? Constant.storage.read<String>('expertDetail').toString()
              : Constant.storage.read<String>('expertId').toString(),
          serviceId: serviceId.join(","),
          salonId: salonId.toString(),
          date: formattedDate.toString(),
          time: slotsString.toString(),
          amount: totalPrice,
          withoutTax: withoutTaxValue, // Send as double with 2 decimal places
          paymentType: "",
          atPlace: selectedVenue == "At Salon" ? 1 : 2,
          address: searchEditingController.text,
        );

        if (createBookingCategory?.status == true) {
          finalTaxRupee = 0.0;
          withOutTaxRupee = 0.0;
          totalPrice = 0.0;
          resetCoupon();

          for (var i = 0;
              i <
                  (categoryDetailController
                          .getServiceCategory?.services?.length ??
                      0);
              i++) {
            categoryDetailController.onCheckBoxClick(false, i);
          }

          for (var i = 0;
              i <
                  (homeScreenController
                          .getAllServiceCategory?.services?.length ??
                      0);
              i++) {
            homeScreenController.onServiceCheckBoxClick(false, i);
          }

          for (var i = 0;
              i <
                  (homeScreenController
                          .getExpertCategory?.data?.services?.length ??
                      0);
              i++) {
            homeScreenController.onCheckBoxClick(false, i);
          }

          for (var i = 0;
              i <
                  (branchDetailController
                          .getSalonDetailCategory?.salon?.serviceIds?.length ??
                      0);
              i++) {
            branchDetailController.onCheckBoxClick(false, i);
          }

          homeScreenController.withOutTaxRupee = 0.0;
          homeScreenController.totalPrice = 0.0;
          homeScreenController.finalTaxRupee = 0.0;
          homeScreenController.totalMinute = 0;
          homeScreenController.checkItem.clear();
          homeScreenController.serviceId.clear();
          homeScreenController.serviceName.clear();

          homeScreenController.withOutTaxRupeeExpert = 0.0;
          homeScreenController.totalPriceExpert = 0.0;
          homeScreenController.finalTaxRupeeExpert = 0.0;
          homeScreenController.totalMinuteExpert = 0;
          homeScreenController.checkItemExpert.clear();
          homeScreenController.serviceIdExpert.clear();
          homeScreenController.serviceNameExpert.clear();

          searchScreenController.totalMinute = 0;
          searchScreenController.checkItem.clear();
          searchScreenController.serviceId.clear();
          searchScreenController.serviceName.clear();

          categoryDetailController.totalMinute = 0;
          categoryDetailController.checkItem.clear();
          categoryDetailController.serviceId.clear();
          categoryDetailController.serviceName.clear();

          branchDetailController.withOutTaxRupee = 0.0;
          branchDetailController.totalPrice = 0.0;
          branchDetailController.finalTaxRupee = 0.0;
          branchDetailController.totalMinute = 0;
          branchDetailController.checkItem.clear();
          branchDetailController.serviceId.clear();

          selectBranchController.selectBranch = -1;
          Constant.storage.remove("expertDetail");
          selectedExpertDataList.clear();

          log("withOutTaxRupee :: home ${homeScreenController.withOutTaxRupee} :: branch ${branchDetailController.withOutTaxRupee} ::  homeExpert ${homeScreenController.withOutTaxRupeeExpert}");
          log("totalPrice :: home ${homeScreenController.totalPrice} :: branch ${branchDetailController.totalPrice} ::  homeExpert ${homeScreenController.totalPriceExpert}");
          log("finalTaxRupee :: home ${homeScreenController.finalTaxRupee} :: branch ${branchDetailController.finalTaxRupee} ::  homeExpert ${homeScreenController.finalTaxRupeeExpert}");
          log("totalMinute :: home ${homeScreenController.totalMinute} :: category ${categoryDetailController.totalMinute} :: branch ${branchDetailController.totalMinute} :: search ${searchScreenController.totalMinute} ");
          log("checkItem :: home ${homeScreenController.checkItem} :: category ${categoryDetailController.checkItem} :: branch ${branchDetailController.checkItem} :: search ${searchScreenController.checkItem} ");
          log("serviceId :: home ${homeScreenController.serviceId} :: category ${categoryDetailController.serviceId} :: branch ${branchDetailController.serviceId} :: search ${searchScreenController.serviceId} ");

          Get.delete<CategoryDetailController>();
          Get.delete<BranchDetailController>();
          Get.delete<SelectBranchController>();
          Get.delete<ViewAllCategoryController>();
          Get.delete<ExpertDetailController>();

          Get.offAndToNamed(AppRoutes.bottom);
          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: SuccessDialog(),
            ),
          );
        } else {
          Utils.showToast(Get.context!, createBookingCategory?.message ?? "");
        }
      } else {
        // For non-wallet payments (Stripe, Cash After Service)
        log("it's ${selectedPayment} payment");

        if (selectedPayment == "cashAfterService") {
          // For Cash After Service, create booking directly
          // Recalculate amount right before sending (same as Stripe does)
          calculateTotalWithDiscount();

          // Ensure withoutTax is sent as double with 2 decimal places to match backend expectation
          double withoutTaxValue =
              double.parse(withOutTaxRupee.toStringAsFixed(2));

          await onCreateBookingApiCall(
            userId: Constant.storage.read<String>('userId') ?? "",
            expertId: Constant.storage.read<String>('expertDetail') != null
                ? Constant.storage.read<String>('expertDetail').toString()
                : Constant.storage.read<String>('expertId').toString(),
            serviceId: serviceId.join(","),
            salonId: salonId.toString(),
            date: formattedDate.toString(),
            time: slotsString.toString(),
            amount: totalPrice, // Use recalculated totalPrice
            withoutTax: withoutTaxValue, // Send as double with 2 decimal places
            paymentType: selectedPayment,
            atPlace: selectedVenue == "At Salon" ? 1 : 2,
            address: searchEditingController.text,
          );

          if (createBookingCategory?.status == true) {
            // Clear all data and show success
            finalTaxRupee = 0.0;
            withOutTaxRupee = 0.0;
            totalPrice = 0.0;
            resetCoupon();

            for (var i = 0;
                i <
                    (categoryDetailController
                            .getServiceCategory?.services?.length ??
                        0);
                i++) {
              categoryDetailController.onCheckBoxClick(false, i);
            }

            for (var i = 0;
                i <
                    (homeScreenController
                            .getAllServiceCategory?.services?.length ??
                        0);
                i++) {
              homeScreenController.onServiceCheckBoxClick(false, i);
            }

            for (var i = 0;
                i <
                    (homeScreenController
                            .getExpertCategory?.data?.services?.length ??
                        0);
                i++) {
              homeScreenController.onCheckBoxClick(false, i);
            }

            for (var i = 0;
                i <
                    (branchDetailController.getSalonDetailCategory?.salon
                            ?.serviceIds?.length ??
                        0);
                i++) {
              branchDetailController.onCheckBoxClick(false, i);
            }

            homeScreenController.withOutTaxRupee = 0.0;
            homeScreenController.totalPrice = 0.0;
            homeScreenController.finalTaxRupee = 0.0;
            homeScreenController.totalMinute = 0;
            homeScreenController.checkItem.clear();
            homeScreenController.serviceId.clear();
            homeScreenController.serviceName.clear();

            homeScreenController.withOutTaxRupeeExpert = 0.0;
            homeScreenController.totalPriceExpert = 0.0;
            homeScreenController.finalTaxRupeeExpert = 0.0;
            homeScreenController.totalMinuteExpert = 0;
            homeScreenController.checkItemExpert.clear();
            homeScreenController.serviceIdExpert.clear();
            homeScreenController.serviceNameExpert.clear();

            searchScreenController.totalMinute = 0;
            searchScreenController.checkItem.clear();
            searchScreenController.serviceId.clear();
            searchScreenController.serviceName.clear();

            categoryDetailController.totalMinute = 0;
            categoryDetailController.checkItem.clear();
            categoryDetailController.serviceId.clear();
            categoryDetailController.serviceName.clear();

            branchDetailController.withOutTaxRupee = 0.0;
            branchDetailController.totalPrice = 0.0;
            branchDetailController.finalTaxRupee = 0.0;
            branchDetailController.totalMinute = 0;
            branchDetailController.checkItem.clear();
            branchDetailController.serviceId.clear();

            selectBranchController.selectBranch = -1;
            Constant.storage.remove("expertDetail");
            selectedExpertDataList.clear();

            Get.delete<CategoryDetailController>();
            Get.delete<BranchDetailController>();
            Get.delete<SelectBranchController>();
            Get.delete<ViewAllCategoryController>();
            Get.delete<ExpertDetailController>();

            Get.offAndToNamed(AppRoutes.bottom);
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                backgroundColor: AppColors.transparent,
                child: SuccessDialog(),
              ),
            );
          } else {
            Utils.showToast(Get.context!, createBookingCategory?.message ?? "");
          }
        } else if (selectedPayment == "Stripe") {
          // For Stripe, collect booking data and navigate to payment screen
          Map<String, dynamic> bookingData = {
            'isWalletAdd': false, // This is a direct service payment
            'totalAmount': totalPrice.toString(),
            'isCreateOrder': true,
            'selectedPayment': selectedPayment,
            'serviceId': serviceId.join(","),
            'expertId': Constant.storage.read<String>('expertDetail') != null
                ? Constant.storage.read<String>('expertDetail').toString()
                : Constant.storage.read<String>('expertId').toString(),
            'salonId': salonId.toString(),
            'date': formattedDate.toString(),
            'time': slotsString.toString(),
            'amount': totalPrice,
            'withoutTax': double.parse(withOutTaxRupee
                .toStringAsFixed(2)), // Send as double with 2 decimal places
            'atPlace': selectedVenue == "At Salon" ? 1 : 2,
            'address': searchEditingController.text,
            'totalMinute': totalMinute,
            'finalTaxRupee': finalTaxRupee,
          };

          log("Navigating to payment screen with booking data: $bookingData");

          // Navigate to payment screen with all booking data as secure arguments
          Get.toNamed(AppRoutes.payment, arguments: [
            false, // isWalletAdd
            totalPrice.toString(), // totalAmount
            true, // isCreateOrder
            selectedPayment, // selectedPayment
            bookingData, // Additional booking data
          ]);
        }
      }
    } else {
      Utils.showToast(context, createBookingCategory?.message.toString() ?? "");
    }
  }
}
