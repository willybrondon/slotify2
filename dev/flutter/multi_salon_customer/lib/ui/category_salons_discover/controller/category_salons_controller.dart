import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/model/public_search_salon_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';

class CategorySalonsController extends GetxController {
  String categoryId = '';
  String categoryName = '';
  String? categoryImage;

  final TextEditingController searchController = TextEditingController();

  List<PublicSearchSalon> salons = [];
  List<PublicSearchSalon> salonsRaw = [];
  int totalReviews = 0;
  String? searchCity;
  bool loading = false;
  bool mapView = false;
  bool showFilters = false;
  double minRating = 0;
  String sort = 'distance';

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is List && args.length >= 2) {
      categoryId = args[0]?.toString() ?? '';
      categoryName = args[1]?.toString() ?? '';
      if (args.length >= 3) {
        final img = args[2]?.toString();
        if (img != null && img.trim().isNotEmpty) {
          categoryImage = img.trim();
        }
      }
    }
    loadSalons();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  String formatStats() {
    final count = salons.length;
    final isFr = Get.locale?.languageCode == 'fr';
    final salonWord = isFr
        ? (count > 1 ? 'salons' : 'salon')
        : (count == 1 ? 'salon' : 'salons');
    final reviewWord =
        isFr ? 'avis' : (totalReviews == 1 ? 'review' : 'reviews');
    return '$count $salonWord · $totalReviews $reviewWord';
  }

  void toggleFilters() {
    showFilters = !showFilters;
    update([Constant.idCategorySalons]);
  }

  void setMapView(bool value) {
    mapView = value;
    update([Constant.idCategorySalons]);
  }

  void setMinRating(double value) {
    minRating = value;
    _applyClientFilters();
  }

  void setSort(String value) {
    sort = value;
    _applyClientFilters();
  }

  void onSearchSubmitted(String value) {
    searchController.text = value;
    loadSalons();
  }

  void _applyClientFilters() {
    var list = List<PublicSearchSalon>.from(salonsRaw);
    if (minRating > 0) {
      list = list.where((s) => s.review >= minRating).toList();
    }
    if (sort == 'rating') {
      list.sort((a, b) => b.review.compareTo(a.review));
    } else if (sort == 'reviews') {
      list.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
    } else {
      list.sort((a, b) {
        final da = a.distance ?? double.infinity;
        final db = b.distance ?? double.infinity;
        return da.compareTo(db);
      });
    }
    salons = list;
    totalReviews = list.fold<int>(0, (sum, s) => sum + s.reviewCount);
    update([Constant.idCategorySalons]);
  }

  Future<void> loadSalons() async {
    if (categoryId.isEmpty) return;
    try {
      loading = true;
      update([Constant.idCategorySalons]);

      final languageCode = Get.locale?.languageCode ?? 'fr';
      final search = searchController.text.trim();
      final params = <String, String>{
        'categoryId': categoryId,
        'language': languageCode,
        'limit': '50',
        if (search.isNotEmpty) 'search': search,
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
          salonsRaw = salonsJson
              .map((s) => PublicSearchSalon.fromJson(s as Map<String, dynamic>))
              .toList();
          totalReviews = (data['totalReviews'] as num?)?.toInt() ?? 0;
          searchCity = data['searchCity'] as String?;
          final cat = data['category'] as Map<String, dynamic>?;
          if (cat != null) {
            final name = cat['name'] as String?;
            if (name != null && name.isNotEmpty) categoryName = name;
            categoryImage = cat['image'] as String?;
          }
          _applyClientFilters();
          return;
        }
      }
      salonsRaw = [];
      salons = [];
      totalReviews = 0;
      searchCity = null;
    } catch (e) {
      log('CategorySalonsController.loadSalons :: $e');
      salonsRaw = [];
      salons = [];
    } finally {
      loading = false;
      update([Constant.idCategorySalons]);
    }
  }
}
