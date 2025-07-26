import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/wishlist_screen/model/get_favourite_product_model.dart';
import 'package:salon_2/ui/wishlist_screen/model/get_favourite_salon_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';

class WishlistController extends GetxController with GetSingleTickerProviderStateMixin {
  TabController? tabController;
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  var tabs = [
    const Tab(text: "Salon"),
    const Tab(text: "Products"),
  ];

  @override
  void onInit() async {
    tabController = TabController(initialIndex: 0, length: 2, vsync: this);

    await onGetFavouriteProductApiCall();
    await onGetFavouriteSalonApiCall();
    super.onInit();
  }

  void onClickLikeButton({
    required String userId,
    required String productId,
    required String categoryId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      await homeScreenController.onFavouriteProductCall(
        userId: userId,
        productId: productId,
        categoryId: categoryId,
      );

      if (homeScreenController.favouriteProductModel?.status == true) {
        await onGetFavouriteProductApiCall();
      } else {
        Utils.showToast(Get.context!, homeScreenController.favouriteProductModel?.message ?? "");
      }

      homeScreenController.isTrendingProductSaved = [];
      homeScreenController.isNewProductSaved = [];

      await homeScreenController.onGetTrendingProductApiCall();
      await homeScreenController.onGetNewProductApiCall();

      for (int i = 0; i < (homeScreenController.getTrendingProductModel?.data?.length ?? 0); i++) {
        homeScreenController.isTrendingProductSaved
            .add(homeScreenController.getTrendingProductModel?.data?[i].isFavourite ?? false);
      }

      for (int i = 0; i < (homeScreenController.getNewProductModel?.data?.length ?? 0); i++) {
        homeScreenController.isNewProductSaved.add(homeScreenController.getNewProductModel?.data?[i].isFavourite ?? false);
      }
    } catch (e) {
      log("Error call Add Favourite :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  void onClickSalonLikeButton({
    required String userId,
    required String salonId,
    required String latitudes,
    required String longitudes,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      await homeScreenController.onFavouriteSalonApiCall(
        userId: userId,
        salonId: salonId,
        latitude: latitudes,
        longitude: longitudes,
      );

      if (homeScreenController.favouriteSalonModel?.status == true) {
        await onGetFavouriteSalonApiCall();
      } else {
        Utils.showToast(Get.context!, homeScreenController.favouriteSalonModel?.message ?? "");
      }

      homeScreenController.isSalonSaved = [];
      homeScreenController.isSalonSaved = [];

      homeScreenController.onGetAllSalonApiCall(
        latitude: latitude ?? 0.0,
        longitude: longitude ?? 0.0,
        userId: Constant.storage.read<String>('userId') ?? "",
      );

      for (int i = 0; i < (homeScreenController.getAllSalonCategory?.data?.length ?? 0); i++) {
        homeScreenController.isSalonSaved.add(homeScreenController.getAllSalonCategory?.data?[i].isFavorite ?? false);
      }
    } catch (e) {
      log("Error call Add Favourite :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  //----------- API Variables -----------//
  GetFavouriteProductModel? getFavouriteProductModel;
  GetFavouriteSalonModel? getFavouriteSalonModel;
  RxBool isLoading = false.obs;

  onGetFavouriteProductApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"userId": Constant.storage.read<String>('userId') ?? ""};

      log("Get Favourite Product Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getFavouriteProduct + queryString);
      log("Get Favourite Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Favourite Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Favourite Product Status Code :: ${response.statusCode}");
      log("Get Favourite Product Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getFavouriteProductModel = GetFavouriteProductModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Favourite Product Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetFavouriteSalonApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"userId": Constant.storage.read<String>('userId') ?? ""};

      log("Get Favourite Salon Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getFavouriteSalonList + queryString);
      log("Get Favourite Salon Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Favourite Salon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Favourite Salon Status Code :: ${response.statusCode}");
      log("Get Favourite Salon Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getFavouriteSalonModel = GetFavouriteSalonModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Favourite Salon Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
