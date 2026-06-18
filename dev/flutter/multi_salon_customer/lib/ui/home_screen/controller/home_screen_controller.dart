import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/hair_profile_service.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/main.dart';
import 'package:share_plus/share_plus.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';

import 'package:salon_2/ui/expert/expert_detail/model/get_expert_model.dart';
import 'package:salon_2/ui/home_screen/model/favourite_product_model.dart';
import 'package:salon_2/ui/home_screen/model/favourite_salon_model.dart';
import 'package:salon_2/ui/home_screen/model/get_all_category_model.dart';
import 'package:salon_2/ui/home_screen/model/get_all_expert_model.dart';
import 'package:salon_2/ui/home_screen/model/get_all_salon_model.dart';
import 'package:salon_2/ui/home_screen/model/get_new_product_model.dart';
import 'package:salon_2/ui/home_screen/model/get_trending_product_model.dart';
import 'package:salon_2/ui/product_screen/model/get_product_category_model.dart';
import 'package:salon_2/ui/home_screen/model/public_search_salon_model.dart';
import 'package:salon_2/ui/home_screen/model/search_suggestions_model.dart';
import 'package:salon_2/ui/search_screen/model/get_all_service_model.dart';
import 'package:salon_2/ui/home_screen/model/get_service_base_salon_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class HomeScreenController extends GetxController {
  List checkItem = [];
  List serviceId = [];
  List serviceName = [];
  List? bannersImages;
  List? type;

  List checkItemExpert = [];
  List serviceIdExpert = [];
  List serviceNameExpert = [];
  double totalPriceExpert = 0.0;
  int totalMinuteExpert = 0;
  double withOutTaxRupeeExpert = 0.0;
  double finalTaxRupeeExpert = 0.0;

  int value = 0;
  int currentIndex = 0;
  String selectDate = "";
  String finalDate = "";
  String finalTime = "";
  int selectedIndex = -1;
  int selectIndexMorning = -1;
  int selectIndexAfternoon = -1;
  int selectIndexEvening = -1;
  late List<bool> isSelected = List.generate(
      (getAllServiceCategory?.services?.length ?? 0), (index) => false);
  List<bool> isExpertSelected = [];
  List<bool> isTrendingProductSaved = [];
  List<bool> isNewProductSaved = [];
  List<bool> isSalonSaved = [];

  bool isLike = false;

  num? rating;
  int? roundedRating;
  int? filledStars;

  /// ========> for pagination
  int startExpert = 0;
  int limitExpert = 10;

  ScrollController expertScrollController = ScrollController();
  ScrollController serviceScrollController = ScrollController();

  double totalPrice = 0.0;
  int totalMinute = 0;
  double? withTaxRupee;
  double withOutTaxRupee = 0.0;
  double finalTaxRupee = 0.0;

  String? text;

  TextEditingController homeScreenEditingController = TextEditingController();
  final BookingDetailScreenController bookingDetailScreenController =
      Get.find<BookingDetailScreenController>();
  TextEditingController searchEditingController = TextEditingController();
  TextEditingController intentQueryController = TextEditingController();
  TextEditingController intentLocationController = TextEditingController();
  FocusNode intentQueryFocusNode = FocusNode();

  SearchSuggestionsModel? searchSuggestions;
  bool showIntentSuggestions = false;
  bool loadingIntentSuggestions = false;

  List<PublicSearchSalon> publicSearchSalons = [];
  List<PublicSearchSalon> publicSearchSalonsRaw = [];
  int publicSearchTotalReviews = 0;
  String? publicSearchCity;
  String? publicSearchCategoryId;
  String? publicSearchCategoryName;
  bool publicSearchActive = false;
  bool publicSearchLoading = false;
  bool publicSearchMapView = false;
  bool showPublicSearchFilters = false;
  double publicSearchMinRating = 0;
  String publicSearchSort = 'distance';

  // CartScreenController cartScreenController = Get.put(CartScreenController());

  //----------- API Variables -----------//
  GetAllCategoryModel? getAllCategory;
  GetAllExpertModel? getAllExpertCategory;
  GetAllServiceModel? getAllServiceCategory;
  GetAllSalonModel? getAllSalonCategory;
  GetServiceBaseSalonModel? getServiceBaseSalonCategory;
  GetExpertModel? getExpertCategory;
  GetTrendingProductModel? getTrendingProductModel;
  GetNewProductModel? getNewProductModel;
  FavouriteProductModel? favouriteProductModel;
  FavouriteSalonModel? favouriteSalonModel;
  GetProductCategoryModel? getProductCategoryModel;
  List getExpert = [];
  bool hasMore = true;
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  // Map to store expert salon details
  Map<String, Map<String, dynamic>> expertSalonDetails = {};

  @override
  void onInit() async {
    log("Enter in Home Screen Controller");
    log("Latitude :: $latitude");
    log("Longitude :: $longitude");

    // cartScreenController.onGetCartProductApiCall();

    expertScrollController.addListener(onExpertPagination);
    serviceScrollController.addListener(onServicePagination);
    intentQueryFocusNode.addListener(_onIntentQueryFocusChanged);
    intentQueryController.addListener(_onIntentQueryTextChanged);
    getTrendingProductModel == null
        ? await onGetTrendingProductApiCall()
        : null;
    getNewProductModel == null ? await onGetNewProductApiCall() : null;
    getAllSalonCategory == null
        ? await onGetAllSalonApiCall(
            latitude: latitude ?? 0.0,
            longitude: longitude ?? 0.0,
            userId: Constant.storage.read<String>('userId') ?? "",
          )
        : null;

    for (int i = 0; i < (getTrendingProductModel?.data?.length ?? 0); i++) {
      isTrendingProductSaved
          .add(getTrendingProductModel?.data?[i].isFavourite ?? false);
    }

    for (int i = 0; i < (getNewProductModel?.data?.length ?? 0); i++) {
      isNewProductSaved.add(getNewProductModel?.data?[i].isFavourite ?? false);
    }

    for (int i = 0; i < (getAllSalonCategory?.data?.length ?? 0); i++) {
      isSalonSaved.add(getAllSalonCategory?.data?[i].isFavorite ?? false);
    }

    getAllCategory == null ? await onGetAllCategoryApiCall() : null;
    getAllExpertCategory == null
        ? await onGetAllExpertApiCall(
            start: startExpert.toString(), limit: limitExpert.toString())
        : null;
    getAllServiceCategory == null
        ? await onGetAllServiceApiCall(city: city ?? "")
        : null;
    getProductCategoryModel == null
        ? await onGetProductCategoryApiCall()
        : null;

    log("isTrendingProductSaved :: $isTrendingProductSaved");
    log("isNewProductSaved :: $isNewProductSaved");
    log("isSalonSaved :: $isSalonSaved");

    withOutTaxRupee = 0.0;
    totalPrice = 0.0;
    finalTaxRupee = 0.0;
    totalMinute = 0;
    checkItem.clear();
    serviceId.clear();
    serviceName.clear();

    withOutTaxRupeeExpert = 0.0;
    totalPriceExpert = 0.0;
    finalTaxRupeeExpert = 0.0;
    totalMinuteExpert = 0;
    checkItemExpert.clear();
    serviceIdExpert.clear();
    serviceNameExpert.clear();

    _maybePromptHairProfile();

    if (city != null && city!.trim().isNotEmpty) {
      intentLocationController.text = city!.trim();
    }

    await refreshLocationAndSync();

    super.onInit();
  }

  static const _locationStorageKey = 'skedisy-location-label';

  String get locationLabel {
    if (city != null && city!.trim().isNotEmpty) return city!.trim();
    if (intentLocationController.text.trim().isNotEmpty) {
      return intentLocationController.text.trim();
    }
    return '';
  }

  Future<void> refreshLocationAndSync({bool forceGps = false}) async {
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        final saved = Constant.storage.read<String>(_locationStorageKey);
        if (saved != null && saved.trim().isNotEmpty) {
          city = saved.trim();
          intentLocationController.text = saved.trim();
        }
        update([Constant.idIntentSearch]);
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      latitude = pos.latitude;
      longitude = pos.longitude;
      position = pos;

      try {
        final placemarks = await placemarkFromCoordinates(
          pos.latitude,
          pos.longitude,
        );
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          final resolved = (p.locality ??
                  p.subAdministrativeArea ??
                  p.administrativeArea ??
                  '')
              .trim();
          if (resolved.isNotEmpty) {
            city = resolved;
            intentLocationController.text = resolved;
            Constant.storage.write(_locationStorageKey, resolved);
          } else if (forceGps) {
            final near = 'txtNearYou'.tr;
            city = near;
            intentLocationController.text = near;
            Constant.storage.write(_locationStorageKey, near);
          }
        }
      } catch (e) {
        log('Reverse geocode failed :: $e');
      }

      update([Constant.idIntentSearch, Constant.idHomeSearchResults]);
    } catch (e) {
      log('refreshLocationAndSync :: $e');
      final saved = Constant.storage.read<String>(_locationStorageKey);
      if (saved != null && saved.trim().isNotEmpty) {
        city = saved.trim();
        intentLocationController.text = saved.trim();
        update([Constant.idIntentSearch]);
      }
    }
  }

  void setPublicSearchLocation(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return;
    city = trimmed;
    intentLocationController.text = trimmed;
    Constant.storage.write(_locationStorageKey, trimmed);
    update([Constant.idIntentSearch, Constant.idHomeSearchResults]);
    if (publicSearchActive) {
      onPublicSearchSalonsApiCall();
    }
  }

  void setPublicSearchMapView(bool value) {
    publicSearchMapView = value;
    update([Constant.idHomeSearchResults]);
  }

  void togglePublicSearchFilters() {
    showPublicSearchFilters = !showPublicSearchFilters;
    update([Constant.idHomeSearchResults]);
  }

  void setPublicSearchMinRating(double value) {
    publicSearchMinRating = value;
    update([Constant.idHomeSearchResults]);
    if (publicSearchCategoryId != null) {
      _applyPublicSearchClientFilters();
    } else {
      onPublicSearchSalonsApiCall();
    }
  }

  void setPublicSearchSort(String value) {
    publicSearchSort = value;
    update([Constant.idHomeSearchResults]);
    if (publicSearchCategoryId != null) {
      _applyPublicSearchClientFilters();
    } else {
      onPublicSearchSalonsApiCall();
    }
  }

  void _clearCategoryBrowse() {
    publicSearchCategoryId = null;
    publicSearchCategoryName = null;
    publicSearchSalonsRaw = [];
  }

  void _applyPublicSearchClientFilters() {
    var list = List<PublicSearchSalon>.from(publicSearchSalonsRaw);
    if (publicSearchMinRating > 0) {
      list = list.where((s) => s.review >= publicSearchMinRating).toList();
    }
    if (publicSearchSort == 'rating') {
      list.sort((a, b) => b.review.compareTo(a.review));
    } else if (publicSearchSort == 'reviews') {
      list.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
    } else {
      list.sort((a, b) {
        final da = a.distance ?? double.infinity;
        final db = b.distance ?? double.infinity;
        return da.compareTo(db);
      });
    }
    publicSearchSalons = list;
    publicSearchTotalReviews =
        list.fold<int>(0, (sum, s) => sum + s.reviewCount);
    update([Constant.idHomeSearchResults, Constant.idProgressView]);
  }

  String formatPublicSearchStats() {
    final count = publicSearchSalons.length;
    final isFr = Get.locale?.languageCode == 'fr';
    final salonWord = isFr
        ? (count > 1 ? 'salons' : 'salon')
        : (count == 1 ? 'salon' : 'salons');
    final reviewWord = isFr ? 'avis' : (publicSearchTotalReviews == 1 ? 'review' : 'reviews');
    return '$count $salonWord · $publicSearchTotalReviews $reviewWord';
  }

  Future<void> onPublicSearchSalonsApiCall() async {
    _clearCategoryBrowse();
    final query = intentQueryController.text.trim();
    final location = locationLabel;

    if (query.isEmpty &&
        location.isEmpty &&
        latitude == null &&
        longitude == null) {
      publicSearchActive = false;
      publicSearchSalons = [];
      update([Constant.idHomeSearchResults, Constant.idProgressView]);
      return;
    }

    try {
      publicSearchLoading = true;
      publicSearchActive = true;
      update([Constant.idHomeSearchResults, Constant.idProgressView]);

      final languageCode = Get.locale?.languageCode ?? 'fr';
      final params = <String, String>{
        'language': languageCode,
        if (query.isNotEmpty) 'q': query,
        if (location.isNotEmpty && location != 'txtNearYou'.tr) 'location': location,
        if (latitude != null) 'latitude': latitude.toString(),
        if (longitude != null) 'longitude': longitude.toString(),
        if (publicSearchMinRating > 0) 'minRating': publicSearchMinRating.toString(),
        'sort': publicSearchSort,
      };

      final url = Uri.parse(
        ApiConstant.BASE_URL + ApiConstant.searchSalonsPublic,
      ).replace(queryParameters: params);

      final response = await http.get(
        url,
        headers: {
          'key': ApiConstant.SECRET_KEY,
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final parsed = publicSearchSalonsResponseFromJson(response.body);
        publicSearchSalons = parsed.salons;
        publicSearchSalonsRaw = [];
        publicSearchTotalReviews = parsed.totalReviews;
        publicSearchCity = parsed.searchCity;
      } else {
        publicSearchSalons = [];
        publicSearchTotalReviews = 0;
        publicSearchCity = null;
      }
    } catch (e) {
      log('onPublicSearchSalonsApiCall :: $e');
      publicSearchSalons = [];
    } finally {
      publicSearchLoading = false;
      update([Constant.idHomeSearchResults, Constant.idProgressView]);
    }
  }

  Future<void> onPublicSalonsByCategoryApiCall(
    String categoryId, {
    String? categoryName,
    String? search,
  }) async {
    try {
      publicSearchLoading = true;
      publicSearchActive = true;
      publicSearchCategoryId = categoryId;
      publicSearchCategoryName = categoryName;
      update([Constant.idHomeSearchResults, Constant.idProgressView]);

      final languageCode = Get.locale?.languageCode ?? 'fr';
      final params = <String, String>{
        'categoryId': categoryId,
        'language': languageCode,
        'limit': '50',
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
        if (latitude != null) 'latitude': latitude.toString(),
        if (longitude != null) 'longitude': longitude.toString(),
      };

      final url = Uri.parse(
        ApiConstant.BASE_URL + ApiConstant.salonsByCategory,
      ).replace(queryParameters: params);

      final response = await http.get(
        url,
        headers: {
          'key': ApiConstant.SECRET_KEY,
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['status'] == true) {
          final salonsJson = data['salons'] as List<dynamic>? ?? [];
          publicSearchSalonsRaw = salonsJson
              .map((s) => PublicSearchSalon.fromJson(s as Map<String, dynamic>))
              .toList();
          publicSearchTotalReviews =
              (data['totalReviews'] as num?)?.toInt() ?? 0;
          publicSearchCity = data['searchCity'] as String?;
          final cat = data['category'] as Map<String, dynamic>?;
          if (cat != null && (cat['name'] as String?)?.isNotEmpty == true) {
            publicSearchCategoryName = cat['name'] as String;
          }
          _applyPublicSearchClientFilters();
          return;
        }
      }
      publicSearchSalonsRaw = [];
      publicSearchSalons = [];
      publicSearchTotalReviews = 0;
      publicSearchCity = null;
    } catch (e) {
      log('onPublicSalonsByCategoryApiCall :: $e');
      publicSearchSalonsRaw = [];
      publicSearchSalons = [];
    } finally {
      publicSearchLoading = false;
      update([Constant.idHomeSearchResults, Constant.idProgressView]);
    }
  }

  void _maybePromptHairProfile() {
    final svc = HairProfileService.instance;
    if (svc.isComplete || svc.hasBeenPrompted) return;

    SchedulerBinding.instance.addPostFrameCallback((_) async {
      if (!Get.isRegistered<BottomBarController>()) return;
      final bottom = Get.find<BottomBarController>();
      if (bottom.selectIndex != 0) return;

      await svc.markPrompted();
      await Get.toNamed(AppRoutes.hairProfile);
    });
  }

  // Simplified and consistent search method
  printLatestValue(String? text) async {
    if (text == null || text.trim().isEmpty) {
      log("Search is empty, clearing results and showing recent searches");
      getAllServiceCategory = null; // Clear service results
      getAllSalonCategory = null; // Clear salon results
      update([Constant.idSearchService, Constant.idBottomService]);
      return; // Exit early
    }

    log("Searching for: '${text.trim()}'");

    String searchTerm = text.trim();

    // First try service search with current city
    await onGetAllServiceApiCall(search: searchTerm, city: city ?? "");

    // If no service results, try salon search
    if (getAllServiceCategory?.services?.isEmpty == true ||
        getAllServiceCategory?.services == null) {
      log("No service results found, trying salon search");
      await onGetAllSalonApiCall(
        latitude: latitude ?? 0.0,
        longitude: longitude ?? 0.0,
        userId: Constant.storage.read<String>('userId') ?? "",
        search: searchTerm,
      );
    }
  }

  @override
  void dispose() {
    expertScrollController.dispose();
    serviceScrollController.dispose();
    intentQueryFocusNode.removeListener(_onIntentQueryFocusChanged);
    intentQueryFocusNode.dispose();
    intentQueryController.removeListener(_onIntentQueryTextChanged);
    intentQueryController.dispose();
    intentLocationController.dispose();
    searchEditingController.dispose();
    super.dispose();
  }

  void _onIntentQueryFocusChanged() {
    if (intentQueryFocusNode.hasFocus) {
      showIntentSuggestions = true;
      if (searchSuggestions == null) {
        onGetSearchSuggestionsApiCall();
      }
      update([Constant.idIntentSearch]);
    } else {
      Future.delayed(const Duration(milliseconds: 200), () {
        if (!intentQueryFocusNode.hasFocus) {
          hideIntentSuggestions();
        }
      });
    }
  }

  void _onIntentQueryTextChanged() {
    if (showIntentSuggestions) {
      update([Constant.idIntentSearch]);
    }
  }

  void hideIntentSuggestions() {
    if (!showIntentSuggestions) return;
    showIntentSuggestions = false;
    update([Constant.idIntentSearch]);
  }

  Future<void> onGetSearchSuggestionsApiCall() async {
    if (loadingIntentSuggestions) return;
    try {
      loadingIntentSuggestions = true;
      update([Constant.idIntentSearch]);

      final languageCode = Get.locale?.languageCode ?? 'fr';
      final queryParameters = {"language": languageCode};
      final queryString = Uri(queryParameters: queryParameters).query;
      final url = Uri.parse(
        ApiConstant.BASE_URL + ApiConstant.searchSuggestions + queryString,
      );
      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
      };

      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        searchSuggestions =
            SearchSuggestionsModel.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      log("Error loading search suggestions :: $e");
    } finally {
      loadingIntentSuggestions = false;
      update([Constant.idIntentSearch]);
    }
  }

  Future<void> submitIntentSearch() async {
    final query = intentQueryController.text.trim();
    final location = locationLabel;

    if (query.isEmpty && location.isEmpty) {
      return;
    }

    hideIntentSuggestions();
    intentQueryFocusNode.unfocus();

    publicSearchMapView = false;
    await onPublicSearchSalonsApiCall();
  }

  Future<void> openPublicSearchMap() async {
    hideIntentSuggestions();
    intentQueryFocusNode.unfocus();
    publicSearchMapView = true;
    if (!publicSearchActive) {
      await onPublicSearchSalonsApiCall();
    } else {
      update([Constant.idHomeSearchResults]);
    }
  }

  void onIntentServiceSuggestionTap(String name) {
    intentQueryController.text = name;
    hideIntentSuggestions();
    submitIntentSearch();
  }

  void onIntentCategorySuggestionTap(
    String? id,
    String? name, {
    String? image,
  }) {
    hideIntentSuggestions();
    intentQueryFocusNode.unfocus();
    if (id == null || name == null) return;
    intentQueryController.text = name;
    publicSearchActive = false;
    publicSearchCategoryId = null;
    publicSearchCategoryName = null;
    publicSearchSalons = [];
    update([Constant.idHomeSearchResults, Constant.idProgressView]);
    Get.toNamed(
      AppRoutes.categorySalons,
      arguments: [id, name, if (image != null && image.isNotEmpty) image],
    );
  }

  void onExpertPagination() async {
    if (expertScrollController.hasClients) {
      if (expertScrollController.position.pixels ==
          expertScrollController.position.maxScrollExtent) {
        await onGetAllExpertApiCall(
          start: startExpert.toString(),
          limit: limitExpert.toString(),
        );
      }
    }
  }

  void onServicePagination() async {
    if (serviceScrollController.position.pixels ==
        serviceScrollController.position.maxScrollExtent) {
      await onGetAllServiceApiCall(city: city ?? "");
    }
  }

  onRefresh() async {
    startExpert = 0;
    isTrendingProductSaved = [];
    isNewProductSaved = [];
    isSalonSaved = [];

    await refreshLocationAndSync();
    await onGetTrendingProductApiCall();
    await onGetNewProductApiCall();
    await onGetAllSalonApiCall(
      latitude: latitude ?? 0.0,
      longitude: longitude ?? 0.0,
      userId: Constant.storage.read<String>('userId') ?? "",
    );

    for (int i = 0; i < (getTrendingProductModel?.data?.length ?? 0); i++) {
      isTrendingProductSaved
          .add(getTrendingProductModel?.data?[i].isFavourite ?? false);
    }

    for (int i = 0; i < (getNewProductModel?.data?.length ?? 0); i++) {
      isNewProductSaved.add(getNewProductModel?.data?[i].isFavourite ?? false);
    }

    for (int i = 0; i < (getAllSalonCategory?.data?.length ?? 0); i++) {
      isSalonSaved.add(getAllSalonCategory?.data?[i].isFavorite ?? false);
    }

    await onGetAllCategoryApiCall();
    await onGetAllExpertApiCall(
        start: startExpert.toString(), limit: limitExpert.toString());
    await onGetAllServiceApiCall(city: city ?? "");
    if (publicSearchActive) {
      if (publicSearchCategoryId != null) {
        await onPublicSalonsByCategoryApiCall(
          publicSearchCategoryId!,
          categoryName: publicSearchCategoryName,
        );
      } else {
        await onPublicSearchSalonsApiCall();
      }
    }
    update([
      Constant.idProgressView,
      Constant.idSearchService,
      Constant.idServiceList
    ]);
  }

  onTrendingProductSaved({
    required String userId,
    required String productId,
    required String categoryId,
  }) async {
    await onFavouriteProductCall(
      userId: userId,
      productId: productId,
      categoryId: categoryId,
    );

    if (favouriteProductModel?.status == true) {
      if (favouriteProductModel?.isFavourite == true) {
        Utils.showToast(Get.context!, "Product saved successfully");

        int? index = getTrendingProductModel?.data
            ?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isTrendingProductSaved[index] = true;
        }
      } else {
        int? index = getTrendingProductModel?.data
            ?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isTrendingProductSaved[index] = false;
        }
      }
    } else {
      Utils.showToast(Get.context!, favouriteProductModel?.message ?? "");
    }

    update([Constant.idProductSaved, Constant.idProgressView]);
  }

  onNewProductSaved({
    required String userId,
    required String productId,
    required String categoryId,
  }) async {
    await onFavouriteProductCall(
      userId: userId,
      productId: productId,
      categoryId: categoryId,
    );

    if (favouriteProductModel?.status == true) {
      if (favouriteProductModel?.isFavourite == true) {
        Utils.showToast(Get.context!, "Product saved successfully");

        int? index = getNewProductModel?.data
            ?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isNewProductSaved[index] = true;
        }
      } else {
        int? index = getNewProductModel?.data
            ?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isNewProductSaved[index] = false;
        }
      }
    } else {
      Utils.showToast(Get.context!, favouriteProductModel?.message ?? "");
    }

    update([Constant.idProductSaved, Constant.idProgressView]);
  }

  onLikeSalon({
    required String userId,
    required String salonId,
    required String latitude,
    required String longitude,
  }) async {
    await onFavouriteSalonApiCall(
      userId: userId,
      salonId: salonId,
      latitude: latitude,
      longitude: longitude,
    );

    if (favouriteSalonModel?.status == true) {
      if (favouriteSalonModel?.isFavourite == true) {
        Utils.showToast(Get.context!, "Salon favourite successfully");

        int? index = getAllSalonCategory?.data
            ?.indexWhere((element) => element.id == salonId);
        if (index != null) {
          isSalonSaved[index] = true;
        }
      } else {
        int? index = getAllSalonCategory?.data
            ?.indexWhere((element) => element.id == salonId);
        if (index != null) {
          isSalonSaved[index] = false;
        }
      }
    } else {
      Utils.showToast(Get.context!, favouriteProductModel?.message ?? "");
    }

    update([Constant.idLike, Constant.idProgressView]);
  }

  onServiceCheckBoxClick(value, int index) {
    isSelected[index] = value;

    if (isSelected[index]) {
      totalMinute += getAllServiceCategory?.services?[index].duration ?? 0;
      checkItem.add(getAllServiceCategory?.services?[index].name);
      serviceId.add(getAllServiceCategory?.services?[index].id);
      serviceName.add(getAllServiceCategory?.services?[index].name);

      log("Service add Total Minute :: $totalMinute");
      log("Service add Check Item :: $checkItem");
      log("Service add Service Id :: $serviceId");
      log("Service add Service Name :: $serviceName");
    } else {
      totalMinute -= getAllServiceCategory?.services?[index].duration ?? 0;
      checkItem.remove(getAllServiceCategory?.services?[index].name);
      serviceId.remove(getAllServiceCategory?.services?[index].id);
      serviceName.remove(getAllServiceCategory?.services?[index].name);

      log("Service Minus Total Minute :: $totalMinute");
      log("Service Minus Check Item :: $checkItem");
      log("Service Minus Service Id :: $serviceId");
      log("Service Minus Service Name :: $serviceName");
    }

    update([Constant.idServiceList, Constant.idBottomService]);
  }

  Future<void> onSelectedDate(BuildContext context) async {
    DateTime currentDate = DateTime(2150);

    DateTime? selectedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: currentDate,
      selectableDayPredicate: (DateTime day) {
        log("###########$day");
        selectDate = day.toString();

        return day.weekday != 6 && day.weekday != 7;
      },
    );

    if (selectedDate != currentDate) {
      DateTime? now = selectedDate;
      DateFormat formatter = DateFormat('dd/MM/yyyy');
      finalDate = formatter.format(now!);
      log('-------------Selected date: ${finalDate.toString()}');
    }

    update([Constant.idDatePick]);
  }

  /// =======> get device location
  getLocation() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      log("Request permission for location");

      await getDeviceLocation();

      (latitude ?? 0.0) == 0.0 && (longitude ?? 0.0) == 0.0
          ? permission = await Geolocator.requestPermission()
          : null;

      if (permission == LocationPermission.always) {
        log("message loading :: $isLoading");

        isLoading(true);
        update([Constant.idProgressView]);
        log("message loading :: $isLoading");
        Position? position;

        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );

        latitude = position.latitude;
        longitude = position.longitude;

        log("Latitude :: $latitude");
        log("Longitude :: $longitude");

        await onGetAllSalonApiCall(
          latitude: latitude ?? 0.0,
          longitude: longitude ?? 0.0,
          userId: Constant.storage.read<String>('userId') ?? "",
        );
      } else if (permission == LocationPermission.denied) {
        latitude = position!.latitude;
        longitude = position!.longitude;

        await onGetAllSalonApiCall(
          latitude: latitude ?? 0.0,
          longitude: longitude ?? 0.0,
          userId: Constant.storage.read<String>('userId') ?? "",
        );

        log('Location permissions are denied');
      }
    } catch (e) {
      log("Error in Get location in Branch :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  Future<Position> getDeviceLocation() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      latitude = position.latitude;
      longitude = position.longitude;
      log("Latitude :: $latitude");
      log("Longitude :: $longitude");

      // City will be set by reverse geocoding in main.dart

      return position;
    } catch (e) {
      log("Error getting location: $e");

      return Position(
        latitude: 0.0,
        longitude: 0.0,
        timestamp: DateTime.now(),
        accuracy: 0.0,
        altitude: 0.0,
        altitudeAccuracy: 0.0,
        heading: 0.0,
        headingAccuracy: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
      );
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCheckBoxClick(value, int index) {
    isExpertSelected[index] = value;

    num servicePrice = getExpertCategory?.data?.services?[index].price ?? 0.0;
    num taxPercentage = getExpertCategory?.data?.tax ?? 0.0;
    double withTaxRupee = (servicePrice * taxPercentage) / 100;

    log("Service Tax :: $taxPercentage");

    if (isExpertSelected[index]) {
      withOutTaxRupeeExpert += servicePrice;
      totalPriceExpert += (servicePrice + withTaxRupee);
      finalTaxRupeeExpert += withTaxRupee;
      totalMinuteExpert +=
          getExpertCategory?.data?.services?[index].id?.duration ?? 0;
      checkItemExpert.add(getExpertCategory?.data?.services?[index].id?.name);
      serviceIdExpert.add(getExpertCategory?.data?.services?[index].id?.id);
      serviceNameExpert.add(getExpertCategory?.data?.services?[index].id?.name);

      log("Expert details add WithOutTaxRupee :: $withOutTaxRupeeExpert");
      log("Expert details add Total Price :: $totalPriceExpert");
      log("Expert details add Final Tax :: $finalTaxRupeeExpert");
      log("Expert details add Total Minute :: $totalMinuteExpert");
      log("Expert details add Check Item :: $checkItemExpert");
      log("Expert details add Service Id :: $serviceIdExpert");
      log("Expert details add Service Name :: $serviceNameExpert");
    } else {
      withOutTaxRupeeExpert -= servicePrice;
      totalPriceExpert -= (servicePrice + withTaxRupee);
      finalTaxRupeeExpert -= withTaxRupee;
      totalMinuteExpert -=
          getExpertCategory?.data?.services?[index].id?.duration ?? 0;
      checkItemExpert
          .remove(getExpertCategory?.data?.services?[index].id?.name);
      serviceIdExpert.remove(getExpertCategory?.data?.services?[index].id?.id);
      serviceNameExpert
          .remove(getExpertCategory?.data?.services?[index].id?.name);

      log("Expert details Minus WithOutTaxRupee :: $withOutTaxRupeeExpert");
      log("Expert details Minus Total Price :: $totalPriceExpert");
      log("Expert details Minus Final Tax :: $finalTaxRupeeExpert");
      log("Expert details Minus Total Minute :: $totalMinuteExpert");
      log("Expert details Minus Check Item :: $checkItemExpert");
      log("Expert details Minus Service Id :: $serviceIdExpert");
      log("Expert details Minus Service Name :: $serviceNameExpert");
    }

    totalPriceExpert = 0.0;
    for (int i = 0; i < isExpertSelected.length; i++) {
      if (isExpertSelected[i]) {
        num price = getExpertCategory?.data?.services?[i].price ?? 0.0;
        double tax = (price * taxPercentage) / 100;
        totalPriceExpert += (price + tax);
      }
    }

    log("Expert details Final Total price :: $totalPriceExpert");
    update([
      Constant.idSearchService,
      Constant.idServiceList,
      Constant.idBottomService
    ]);
  }

  onBack() {
    withOutTaxRupeeExpert = 0.0;
    totalPriceExpert = 0.0;
    finalTaxRupeeExpert = 0.0;
    totalMinuteExpert = 0;
    checkItemExpert.clear();
    serviceIdExpert.clear();
    serviceNameExpert.clear();
    isExpertSelected = List.generate(
        (getExpertCategory?.data?.services?.length ?? 0), (index) => false);

    update([Constant.idBottomService, Constant.idServiceList]);
  }

  //------------ API Services ------------//

  onGetAllCategoryApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      // Get current language code (default to 'en')
      final languageCode = Get.locale?.languageCode ?? 'en';

      final queryParameters = {"language": languageCode};
      String queryString = Uri(queryParameters: queryParameters).query;
      final url = Uri.parse(
          "${ApiConstant.BASE_URL}${ApiConstant.getAllCategory}?$queryString");

      log("Get All Category Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get All Category Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Category StatusCode :: ${response.statusCode}");
      log("Get All Category Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllCategory = GetAllCategoryModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get All Category Api :: $e");
      Utils.showToast(Get.context!, getAllCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetAllExpertApiCall({required String start, required String limit}) async {
    try {
      startExpert++;

      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"start": start, "limit": limit};
      log("Get All Expert Params :: $queryParameters");
      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          "${ApiConstant.BASE_URL}${ApiConstant.getAllExpert}$queryString");

      log("Get All Expert Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get All Expert Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Expert StatusCode :: ${response.statusCode}");
      log("Get All Expert Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllExpertCategory = GetAllExpertModel.fromJson(jsonResponse);
      }

      if (getAllExpertCategory != null) {
        final List data = getAllExpertCategory?.data ?? [];

        if (data.length < limitExpert) {
          hasMore = false;
          update([Constant.idProgressView]);
        }

        if (data.isNotEmpty) {
          getExpert.addAll(data);
        }
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error Call Get Expert Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetAllServiceApiCall({String? search, required String city}) async {
    try {
      isLoading(true);
      update([
        Constant.idProgressView,
        Constant.idSearchService,
        Constant.idServiceList
      ]);

      // Get current language code (default to 'en')
      final languageCode = Get.locale?.languageCode ?? 'en';

      final queryParameters = {
        "search": search ?? "",
        "city": city,
        "language": languageCode,
      };

      log("Get All Service Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getAllService + queryString);

      log("Get All Service Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get All Service Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Service StatusCode :: ${response.statusCode}");
      log("Get All Service Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllServiceCategory = GetAllServiceModel.fromJson(jsonResponse);

        log("Services found: ${getAllServiceCategory?.services?.length ?? 0}");
        log("Services status: ${getAllServiceCategory?.status}");
        log("Services message: ${getAllServiceCategory?.message}");

        if (getAllServiceCategory?.services != null) {
          log("Service names: ${getAllServiceCategory?.services?.map((s) => s.name).toList()}");
        }

        isSelected = List.generate(
            (getAllServiceCategory?.services?.length ?? 0),
            (index) => checkItem
                .contains(getAllServiceCategory?.services?[index].name));
      }
    } on AppException catch (exception) {
      log("AppException in onGetAllServiceApiCall: ${exception.message}");
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Service Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([
        Constant.idProgressView,
        Constant.idSearchService,
        Constant.idServiceList
      ]);
    }
  }

  onGetExpertApiCall({required String expertId}) async {
    try {
      isLoading(true);
      isLoading1(true);
      update([Constant.idProgressView, Constant.idExpertDetail]);

      final queryParameters = {"expertId": expertId};

      log("Get Expert Params :: $queryParameters");
      String queryString = Uri(queryParameters: queryParameters).query;

      final url =
          Uri.parse(ApiConstant.BASE_URL + ApiConstant.getExpert + queryString);

      log("Get Expert Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Expert Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Expert StatusCode :: ${response.statusCode}");
      log("Get Expert Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getExpertCategory = GetExpertModel.fromJson(jsonResponse);
        isExpertSelected = List.generate(
            (getExpertCategory?.data?.services?.length ?? 0), (index) => false);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Api :: $e");
      Utils.showToast(
          Get.context!, getExpertCategory?.message.toString() ?? "");
    } finally {
      log("enter finally");
      isLoading(false);
      isLoading1(false);
      update([Constant.idProgressView, Constant.idExpertDetail]);
    }
  }

  // Enhanced salon search method
  onGetAllSalonApiCall({
    required double latitude,
    required double longitude,
    required String userId,
    String? search,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "latitude": latitude.toString(),
        "longitude": longitude.toString(),
        if (search != null && search.isNotEmpty) "search": search,
      };

      log("Get All Salon Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getAllSalon + queryString);

      log("Get All Salon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Get All Salon StatusCode :: ${response.statusCode}");
      log("Get All Salon Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllSalonCategory = GetAllSalonModel.fromJson(jsonResponse);

        log("Salons found: ${getAllSalonCategory?.data?.length ?? 0}");

        // If we found salons but no services, show a message
        if (getAllSalonCategory?.data?.isNotEmpty == true &&
            (getAllServiceCategory?.services?.isEmpty == true ||
                getAllServiceCategory?.services == null)) {
          log("Found salons but no services, updating service list to show salon results");
          // You could create a custom service model to show salon results
          // For now, we'll just log that salons were found
        }
      }
    } on AppException catch (exception) {
      log("AppException in onGetAllSalonApiCall: ${exception.message}");
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get All Salon Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetServiceBasedSalonApiCall(
      {required String serviceId,
      required double latitude,
      required double longitude,
      required String city}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idSelectBranch]);

      final url = Uri.parse(
        '${ApiConstant.BASE_URL}${ApiConstant.getServiceBasedSalon}?serviceId=$serviceId&latitude=${latitude == 0.0 ? null : latitude}&longitude=${longitude == 0.0 ? null : longitude}&city=$city',
      );

      log("Get Service Based Salon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Service Based Salon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Service Based Salon StatusCode :: ${response.statusCode}");
      log("Get Service Based Salon Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getServiceBaseSalonCategory =
            GetServiceBaseSalonModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Service Based Salon Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idSelectBranch]);
    }
  }

  onGetTrendingProductApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "start": "0",
        "end": "10",
        "userId": Constant.storage.read<String>('userId') ?? "",
        "city": city ?? "",
      };

      log("Get Trending Product Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getTrendingProduct + queryString);

      log("Get Trending Product Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Trending Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Trending Product StatusCode :: ${response.statusCode}");
      log("Get Trending Product Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getTrendingProductModel =
            GetTrendingProductModel.fromJson(jsonResponse);
      }

      log("Get Trending Product Api Called Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Trending Product Api :: $e");
      Utils.showToast(Get.context!, getAllCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetNewProductApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "start": "0",
        "end": "10",
        "userId": Constant.storage.read<String>('userId') ?? "",
        "city": city ?? "",
      };

      log("Get New Product Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getNewProduct + queryString);

      log("Get New Product Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get New Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get New Product StatusCode :: ${response.statusCode}");
      log("Get New Product Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getNewProductModel = GetNewProductModel.fromJson(jsonResponse);
      }

      log("Get New Product Api Called Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get New Product Api :: $e");
      Utils.showToast(Get.context!, getAllCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onFavouriteProductCall({
    required String userId,
    required String productId,
    required String categoryId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({
        "userId": userId,
        "productId": productId,
        "categoryId": categoryId,
      });

      log("Favourite Product Body :: $body");

      final url =
          Uri.parse(ApiConstant.BASE_URL + ApiConstant.favouriteProduct);
      log("Favourite Product Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.post(url, headers: headers, body: body);

      log("Favourite Product Status Code :: ${response.statusCode}");
      log("Favourite Product Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        favouriteProductModel = FavouriteProductModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Favourite Product Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetProductCategoryApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final url =
          Uri.parse(ApiConstant.BASE_URL + ApiConstant.getProductCategory);
      log("Get Product Category Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Get Product Category Status Code :: ${response.statusCode}");
      log("Get Product Category Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getProductCategoryModel =
            GetProductCategoryModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Product Category Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onFavouriteSalonApiCall({
    required String userId,
    required String salonId,
    required String latitude,
    required String longitude,
  }) async {
    try {
      update([Constant.idProgressView]);

      final body = json.encode({
        "userId": userId,
        "salonId": salonId,
        "latitude": latitude,
        "longitude": longitude,
      });

      log("Favourite Salon Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.salonFavourite);
      log("Favourite Salon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.post(url, headers: headers, body: body);

      log("Favourite Salon Status Code :: ${response.statusCode}");
      log("Favourite Salon Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        favouriteSalonModel = FavouriteSalonModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Favourite Salon Api :: $e");
    } finally {
      update([Constant.idProgressView]);
    }
  }

  // Share salon link from home screen
  Future<void> shareSalonLink(
      {required String salonId, required String salonName}) async {
    try {
      final queryParameters = {
        "salonId": salonId,
      };

      String queryString = Uri(queryParameters: queryParameters).query;
      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getSalonShareUrl + queryString);
      log("Get Salon Share URL Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Get Salon Share URL Status Code :: ${response.statusCode}");
      log("Get Salon Share URL Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true &&
            jsonResponse['shareUrl'] != null) {
          final shareUrl = jsonResponse['shareUrl'];
          final shareText = "Check out $salonName on Skedisy!\n\n$shareUrl";

          await Share.share(
            shareText,
            subject: "Check out $salonName",
          );
          log("Share Salon Link - Shared successfully: $shareUrl");
        } else {
          Utils.showToast(
              Get.context!, "Unable to generate share link. Please try again.");
          log("Share Salon Link - Share URL is null or empty");
        }
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error sharing salon link :: $e");
      Utils.showToast(Get.context!, "Error sharing salon link");
    }
  }
}
