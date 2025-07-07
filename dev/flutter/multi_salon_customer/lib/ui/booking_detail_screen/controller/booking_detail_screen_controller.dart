import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/booking_detail_screen/model/cancel_booking_model.dart';
import 'package:salon_2/ui/booking_detail_screen/model/get_all_booking_model.dart';
import 'package:salon_2/ui/booking_detail_screen/model/get_complain_model.dart';
import 'package:salon_2/ui/booking_detail_screen/model/user_submit_review_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class BookingDetailScreenController extends GetxController with GetSingleTickerProviderStateMixin {
  int selectedIndex = 0;
  int selectedTab = 0;
  bool savedCheckScreen = true;
  bool checkValue = false;

  bool isPendingApiCalling = false;

  int selectedStarIndex = -1;

  int startPending = 0;
  int limitPending = 20;
  int startCancel = 0;
  int limitCancel = 20;
  int startCompleted = 0;
  int limitCompleted = 20;

  ScrollController scrollController = ScrollController();
  ScrollController scrollController1 = ScrollController();
  ScrollController scrollController2 = ScrollController();

  String? strDate;
  List? partsDate;
  String? date;
  TabController? tabController;
  TextEditingController bookingDetailScreenEditingController = TextEditingController();
  TextEditingController reasonEditingController = TextEditingController();
  TextEditingController reviewEditingController = TextEditingController();

  var tabs = [
    Tab(text: "txtPending".tr),
    Tab(text: "txtCancelled".tr),
    Tab(text: "txtCompleted".tr),
  ];

  @override
  void onInit() async {
    log("On init called");
    scrollController.addListener(onPagination);
    scrollController1.addListener(onPagination1);
    scrollController2.addListener(onPagination2);

    tabController = TabController(initialIndex: 0, length: 3, vsync: this);

    tabController?.addListener(() async {
      isPendingApiCalling = true;
      await 400.milliseconds.delay();
      if (isPendingApiCalling) {
        isPendingApiCalling = false;

        if (tabController?.index == 0) {
          log("pending api called");
          startPending = 0;
          getPending = [];

          await onGetAllBookingApiCall(
              userId: Constant.storage.read<String>('UserId') ?? "",
              status: "pending",
              start: startPending.toString(),
              limit: limitPending.toString(),
              search: bookingDetailScreenEditingController.text.trim());
          if (getAllBookingCategory?.status == false) {
            Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
          }
        }

        if (tabController?.index == 1) {
          log("cancel api called");
          startCancel = 0;
          getCancel = [];

          await onGetAllBookingApiCall(
              userId: Constant.storage.read<String>('UserId') ?? "",
              status: "cancel",
              start: startCancel.toString(),
              limit: limitCancel.toString(),
              search: bookingDetailScreenEditingController.text.trim());
          if (getAllBookingCategory?.status == false) {
            Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
          }
        }

        if (tabController?.index == 2) {
          log("completed api called");
          startCompleted = 0;
          getComplete = [];

          await onGetAllBookingApiCall(
              userId: Constant.storage.read<String>('UserId') ?? "",
              status: "completed",
              start: startCompleted.toString(),
              limit: limitCompleted.toString(),
              search: bookingDetailScreenEditingController.text.trim());
          if (getAllBookingCategory?.status == false) {
            Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
          }
        }
      }
    });

    bookingDetailScreenEditingController.addListener(() {
      final newText = capitalizeFirstLetter(bookingDetailScreenEditingController.text);
      if (bookingDetailScreenEditingController.text != newText) {
        bookingDetailScreenEditingController.value = bookingDetailScreenEditingController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });

    super.onInit();
  }

  onSelectedStar(int index) {
    selectedStarIndex = index;
    update([Constant.idSelectedStar]);
  }

  onSelectBooking(int index) {
    selectedIndex = index;

    update([Constant.idBooking]);

    strDate = getAllBookingCategory?.data?[index].date ?? "";
    partsDate = strDate?.split('T');
    date = partsDate?[0];
    log("Date :: $date");
  }

  void onPagination() async {
    log("Enter in onPagination");
    if (scrollController.hasClients) {
      if (scrollController.position.pixels == scrollController.position.maxScrollExtent) {
        await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "pending",
          start: startPending.toString(),
          limit: limitPending.toString(),
        );
      }
    }
  }

  void onPagination1() async {
    if (scrollController1.hasClients) {
      if (scrollController1.position.pixels == scrollController1.position.maxScrollExtent) {
        await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "cancel",
          start: startCancel.toString(),
          limit: limitCancel.toString(),
        );
      }
    }
  }

  void onPagination2() async {
    if (scrollController2.hasClients) {
      if (scrollController2.position.pixels == scrollController2.position.maxScrollExtent) {
        await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "completed",
          start: startCompleted.toString(),
          limit: limitCompleted.toString(),
        );
      }
    }
  }

  void printLatestValue(String? text) async {
    if (tabController?.index == 0) {
      startPending = 0;
      getPending = [];
      await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "pending",
          start: startPending.toString(),
          limit: limitPending.toString(),
          search: text);
    }

    if (tabController?.index == 1) {
      startCancel = 0;
      getCancel = [];
      await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "cancel",
          start: startCancel.toString(),
          limit: limitCancel.toString(),
          search: text);
    }

    if (tabController?.index == 2) {
      startCompleted = 0;
      getComplete = [];
      await onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "completed",
          start: startCompleted.toString(),
          limit: limitCompleted.toString(),
          search: text);
    }
  }

  String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text;
    }
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  onSearch() async {
    if (tabController?.index == 0) {
      startPending = 0;
      getPending = [];
      startCancel = 0;
      getCancel = [];
      startCompleted = 0;
      getComplete = [];
      await onGetAllBookingApiCall(
        userId: Constant.storage.read<String>('UserId') ?? "",
        status: "pending",
        start: startPending.toString(),
        limit: limitPending.toString(),
      );
      if (getAllBookingCategory?.status == false) {
        Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
      }
    }
    if (tabController?.index == 1) {
      startCancel = 0;
      getCancel = [];
      startCompleted = 0;
      getComplete = [];
      startPending = 0;
      getPending = [];
      await onGetAllBookingApiCall(
        userId: Constant.storage.read<String>('UserId') ?? "",
        status: "cancel",
        start: startCancel.toString(),
        limit: limitCancel.toString(),
      );
      if (getAllBookingCategory?.status == false) {
        Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
      }
    }
    if (tabController?.index == 2) {
      startCompleted = 0;
      getComplete = [];
      startCancel = 0;
      getCancel = [];
      startPending = 0;
      getPending = [];

      await onGetAllBookingApiCall(
        userId: Constant.storage.read<String>('UserId') ?? "",
        status: "completed",
        start: startCompleted.toString(),
        limit: limitCompleted.toString(),
      );
      if (getAllBookingCategory?.status == false) {
        Utils.showToast(Get.context!, getAllBookingCategory?.message ?? "");
      }
    }

    update([Constant.idProgressView]);
  }

  //----------- API Variables -----------//
  GetAllBookingModel? getAllBookingCategory;
  CancelBookingModel? cancelBookingCategory;
  UserSubmitReviewModel? userSubmitReviewCategory;
  GetComplainModel? getComplainCategory;
  List<Data> getPending = [];
  List<Data> getCancel = [];
  List<Data> getComplete = [];
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  onGetAllBookingApiCall(
      {required String userId, required String status, required String start, required String limit, String? search}) async {
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

      final queryParameters = {"userId": userId, "status": status, "start": start, "limit": limit, "search": search ?? ""};

      log("Get All Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getAllBooking + queryString);

      log("Get All Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get All Booking Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Booking StatusCode :: ${response.statusCode}");
      log("Get All Booking Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllBookingCategory = GetAllBookingModel.fromJson(jsonResponse);

        if (search?.isNotEmpty == true) {
          if (status == "pending") {
            getPending.clear();
          } else if (status == "cancel") {
            getCancel.clear();
          } else {
            getComplete.clear();
          }
        }
        if (getAllBookingCategory != null) {
          final List<Data> data = getAllBookingCategory?.data ?? [];

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
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get All Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCancelBookingApiCall({required String bookingId, required String reason, required String person}) async {
    try {
      isLoading(true);
      isLoading1(true);
      update([Constant.idProgressView]);

      final body = json.encode({"bookingId": bookingId, "reason": reason, "person": person});

      log("Cancel Booking Status Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.cancelBooking);
      log("Cancel Booking Status Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers, body: body);

      log("Cancel Booking Status Status Code :: ${response.statusCode}");
      log("Cancel Booking Status Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        cancelBookingCategory = CancelBookingModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Cancel Booking Status Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      isLoading1(false);
      update([Constant.idProgressView]);
    }
  }

  onUserReviewApiCall({required String bookingId, required String review, required int rating}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"bookingId": bookingId, "review": review, "rating": rating});

      log("User Submit Review Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.userSubmitReview);
      log("User Submit Review Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("User Submit Review Status Code :: ${response.statusCode}");
      log("User Submit Review Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        userSubmitReviewCategory = UserSubmitReviewModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call User Submit Review Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
