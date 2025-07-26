import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/booking_screen/model/cancel_confirm_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/complete_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/status_wise_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/update_payment_status_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class BookingScreenController extends GetxController with GetTickerProviderStateMixin {
  bool isPaymentReceive = false;
  bool isPendingApiCalling = false;
  bool isSwitchOn = false;

  int startPending = 0;
  int limitPending = 20;
  int startCancel = 0;
  int limitCancel = 20;
  int startCompleted = 0;
  int limitCompleted = 20;

  TabController? tabController;
  TextEditingController reasonEditingController = TextEditingController();

  ScrollController pendingScrollController = ScrollController();
  ScrollController completedScrollController = ScrollController();
  ScrollController cancelScrollController = ScrollController();

  //-------- Custom TabBar Variable --------//

  void onChangeTabBar(int index) async {
    if (index == 0) {
      startPending = 0;
      getPending = [];

      await onStatusWiseBookingApiCall(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "pending",
        start: startPending.toString(),
        limit: limitPending.toString(),
      );
    }
    if (index == 1) {
      startCancel = 0;
      getCancel = [];

      await onStatusWiseBookingApiCall(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "cancel",
        start: startCancel.toString(),
        limit: limitCancel.toString(),
      );
    }
    if (index == 2) {
      startCompleted = 0;
      getComplete = [];

      await onStatusWiseBookingApiCall(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "completed",
        start: startCompleted.toString(),
        limit: limitCompleted.toString(),
      );
    }
    update([Constant.idProgressView]);
  }

  void onPendingPagination() async {
    if (pendingScrollController.hasClients) {
      if (pendingScrollController.position.pixels == pendingScrollController.position.maxScrollExtent) {
        await onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "pending",
          start: startPending.toString(),
          limit: limitPending.toString(),
        );
      }
    }
  }

  void onCompletedPagination() async {
    if (completedScrollController.hasClients) {
      if (completedScrollController.position.pixels == completedScrollController.position.maxScrollExtent) {
        await onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "completed",
          start: startCompleted.toString(),
          limit: limitCompleted.toString(),
        );
      }
    }
  }

  void onCancelPagination() async {
    if (cancelScrollController.hasClients) {
      if (cancelScrollController.position.pixels == cancelScrollController.position.maxScrollExtent) {
        await onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "pending",
          start: startCancel.toString(),
          limit: limitCancel.toString(),
        );
      }
    }
  }

  onSwitch(value) {
    isPaymentReceive = !isPaymentReceive;
    isSwitchOn = value;
    log("Payment Receive :: $isPaymentReceive");
    log("Check Out Button :: $isSwitchOn");
    update([Constant.idSwitchOn]);
  }

  //----------- API Variables -----------//
  StatusWiseBookingModel? statusWiseBookingCategory;
  CancelConfirmBookingModel? cancelConfirmBookingCategory;
  CompleteBookingModel? completeBookingCategory;
  UpdatePaymentStatusModel? updatePaymentStatusCategory;
  List<Data> getPending = [];
  List<Data> getCancel = [];
  List<Data> getComplete = [];
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  @override
  void onInit() async {
    pendingScrollController.addListener(onPendingPagination);
    completedScrollController.addListener(onCompletedPagination);
    cancelScrollController.addListener(onCancelPagination);

    await onStatusWiseBookingApiCall(
      expertId: Constant.storage.read<String>("expertId").toString(),
      status: "pending",
      start: startPending.toString(),
      limit: limitPending.toString(),
    );

    tabController = TabController(length: 3, vsync: this, initialIndex: 0);

    tabController?.addListener(() async {
      isPendingApiCalling = true;

      await 400.milliseconds.delay();

      if (isPendingApiCalling) {
        isPendingApiCalling = false;

        statusWiseBookingCategory?.data?.clear();
        isLoading(true);

        update([Constant.idProgressView]);
        onChangeTabBar(tabController!.index);
      }
    });
    super.onInit();
  }

  onStatusWiseBookingApiCall({
    required String expertId,
    required String status,
    required String start,
    required String limit,
  }) async {
    try {
      if (status == "pending") {
        startPending++;
      } else if (status == "cancel") {
        startCancel++;
      } else {
        startCompleted++;
      }

      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "expertId": expertId,
        "status": status,
        "start": start,
        "limit": limit,
      };

      log("Status Wise Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.statusWiseBooking + queryString);
      log("Status Wise Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Status Wise Booking Status Code :: ${response.statusCode}");
      log("Status Wise Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        statusWiseBookingCategory = StatusWiseBookingModel.fromJson(jsonResponse);

        if (statusWiseBookingCategory != null) {
          final List<Data> data = statusWiseBookingCategory?.data ?? [];

          if (data.isNotEmpty) {
            if (status == "pending") {
              getPending.addAll(data);
            } else if (status == "cancel") {
              getCancel.addAll(data);
            } else {
              getComplete.addAll(data);
            }
          }
        }
      }
      log("User Status Wise Booking Api Call SuccessFully..!");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Status Wise Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onUpdateBookingStatusApiCall({required String bookingId, required String status, String? reason, String? person}) async {
    try {
      isLoading(true);
      isLoading1(true);
      update([Constant.idProgressView]);

      final body = json.encode({"bookingId": bookingId, "status": status, "reason": reason, "person": person});

      log("Cancel Confirm Booking Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.cancelConfirmBooking);
      log("Cancel Confirm Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers, body: body);

      log("Cancel Confirm Booking Status Code :: ${response.statusCode}");
      log("Cancel Confirm Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        cancelConfirmBookingCategory = CancelConfirmBookingModel.fromJson(jsonResponse);
      }
      log("Cancel Confirm Booking Api Call SuccessFully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Cancel Confirm Booking Api :: $e");
    } finally {
      isLoading(false);
      isLoading1(false);
      update([Constant.idProgressView]);
    }
  }

  onCompleteBookingApiCall({required String bookingId}) async {
    try {
      isLoading(true);
      isLoading1(true);
      update([Constant.idProgressView]);

      final queryParameters = {"bookingId": bookingId};

      log("Complete Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.completeBooking + queryString);

      log("Complete Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Complete Booking Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Complete Booking Status Code :: ${response.statusCode}");
      log("Complete Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        completeBookingCategory = CompleteBookingModel.fromJson(jsonResponse);
      }
      log("Complete Booking Api Call SuccessFully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Complete Booking Api :: $e");
      Utils.showToast(Get.context!, 'Something went wrong!!');
    } finally {
      isLoading(false);
      isLoading1(false);
      update([Constant.idProgressView]);
    }
  }

  onUpdatePaymentStatusApiCall({required String bookingId}) async {
    try {
      isLoading(true);
      isLoading1(true);
      update([Constant.idProgressView]);

      final queryParameters = {"bookingId": bookingId};

      log("Update Payment Status Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updatePaymentStatus + queryString);

      log("Update Payment Status Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers);

      log("Update Payment Status Status Code :: ${response.statusCode}");
      log("Update Payment Status Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        updatePaymentStatusCategory = UpdatePaymentStatusModel.fromJson(jsonResponse);
      }
      log("Update Payment Status Api Call SuccessFully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Update Payment Status Api :: $e");
    } finally {
      isLoading(false);
      isLoading1(false);
      update([Constant.idProgressView]);
    }
  }
}
