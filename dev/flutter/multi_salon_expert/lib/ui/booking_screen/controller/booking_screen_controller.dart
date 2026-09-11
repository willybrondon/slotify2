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

  int _bookingFetchGen = 0;
  int? _lastFetchedTab;
  bool _pendingHasMore = true;
  bool _cancelHasMore = true;
  bool _completedHasMore = true;

  TabController? tabController;
  TextEditingController reasonEditingController = TextEditingController();

  ScrollController pendingScrollController = ScrollController();
  ScrollController completedScrollController = ScrollController();
  ScrollController cancelScrollController = ScrollController();

  List<String> get _bookingViewIds => [Constant.idProgressView, Constant.idOnChangeTabBar];

  String get _expertId => Constant.storage.read<String>("expertId").toString();

  Future<void> onChangeTabBar(int index) async {
    _lastFetchedTab = index;
    if (index == 0) {
      startPending = 0;
      getPending = [];
      _pendingHasMore = true;
      await onStatusWiseBookingApiCall(
        expertId: _expertId,
        status: "pending",
        start: "0",
        limit: limitPending.toString(),
      );
    } else if (index == 1) {
      startCancel = 0;
      getCancel = [];
      _cancelHasMore = true;
      await onStatusWiseBookingApiCall(
        expertId: _expertId,
        status: "cancel",
        start: "0",
        limit: limitCancel.toString(),
      );
    } else if (index == 2) {
      startCompleted = 0;
      getComplete = [];
      _completedHasMore = true;
      await onStatusWiseBookingApiCall(
        expertId: _expertId,
        status: "completed",
        start: "0",
        limit: limitCompleted.toString(),
      );
    }
    update(_bookingViewIds);
  }

  bool _shouldPaginate(ScrollController controller, {required bool hasMore}) {
    if (!hasMore || isLoading.value || !controller.hasClients) return false;
    final position = controller.position;
    if (position.maxScrollExtent <= 0) return false;
    return position.pixels >= position.maxScrollExtent - 80;
  }

  void onPendingPagination() async {
    if (!_shouldPaginate(pendingScrollController, hasMore: _pendingHasMore)) return;
    await onStatusWiseBookingApiCall(
      expertId: _expertId,
      status: "pending",
      start: startPending.toString(),
      limit: limitPending.toString(),
    );
  }

  void onCompletedPagination() async {
    if (!_shouldPaginate(completedScrollController, hasMore: _completedHasMore)) return;
    await onStatusWiseBookingApiCall(
      expertId: _expertId,
      status: "completed",
      start: startCompleted.toString(),
      limit: limitCompleted.toString(),
    );
  }

  void onCancelPagination() async {
    if (!_shouldPaginate(cancelScrollController, hasMore: _cancelHasMore)) return;
    await onStatusWiseBookingApiCall(
      expertId: _expertId,
      status: "cancel",
      start: startCancel.toString(),
      limit: limitCancel.toString(),
    );
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
  void onInit() {
    super.onInit();
    pendingScrollController.addListener(onPendingPagination);
    completedScrollController.addListener(onCompletedPagination);
    cancelScrollController.addListener(onCancelPagination);

    tabController = TabController(length: 3, vsync: this, initialIndex: 0);
    tabController?.addListener(_onBookingTabChanged);
  }

  void _onBookingTabChanged() {
    if (tabController == null || tabController!.indexIsChanging) return;
    final index = tabController!.index;
    if (_lastFetchedTab == index) return;
    onChangeTabBar(index);
  }

  void primeBookingTab(int tabIndex) {
    _lastFetchedTab = tabIndex;
  }

  Future<void> openBookingTab(int tabIndex) async {
    if (tabController == null) {
      tabController = TabController(length: 3, vsync: this, initialIndex: tabIndex);
      tabController?.addListener(_onBookingTabChanged);
    }

    _lastFetchedTab = tabIndex;
    if (tabController!.index != tabIndex) {
      tabController!.animateTo(tabIndex);
    }

    await onChangeTabBar(tabIndex);
  }

  onStatusWiseBookingApiCall({
    required String expertId,
    required String status,
    required String start,
    required String limit,
  }) async {
    final gen = ++_bookingFetchGen;
    final page = int.tryParse(start) ?? 0;
    final pageLimit = int.tryParse(limit) ?? 20;

    try {
      isLoading(true);
      update(_bookingViewIds);

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

      if (gen != _bookingFetchGen) return;

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        statusWiseBookingCategory = StatusWiseBookingModel.fromJson(jsonResponse);
        final List<Data> data = statusWiseBookingCategory?.data ?? [];
        final hasMore = data.length >= pageLimit;

        if (status == "pending") {
          if (page == 0) getPending = [];
          _mergeBookings(getPending, data);
          _pendingHasMore = hasMore;
          if (hasMore) startPending = page + 1;
        } else if (status == "cancel") {
          if (page == 0) getCancel = [];
          _mergeBookings(getCancel, data);
          _cancelHasMore = hasMore;
          if (hasMore) startCancel = page + 1;
        } else {
          if (page == 0) getComplete = [];
          _mergeBookings(getComplete, data);
          _completedHasMore = hasMore;
          if (hasMore) startCompleted = page + 1;
        }
      }
      log("User Status Wise Booking Api Call SuccessFully..!");
    } on AppException catch (exception) {
      if (gen == _bookingFetchGen) {
        Utils.showToast(Get.context!, exception.message);
      }
    } catch (e) {
      log("Error call Status Wise Booking Api :: $e");
    } finally {
      if (gen == _bookingFetchGen) {
        isLoading(false);
        update(_bookingViewIds);
      }
    }
  }

  void _mergeBookings(List<Data> target, List<Data> incoming) {
    final existingIds = target.map((item) => item.id).whereType<String>().toSet();
    for (final item in incoming) {
      final id = item.id;
      if (id == null || !existingIds.contains(id)) {
        target.add(item);
        if (id != null) existingIds.add(id);
      }
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
