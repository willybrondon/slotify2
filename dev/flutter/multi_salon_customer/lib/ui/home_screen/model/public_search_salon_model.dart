import 'dart:convert';

import 'package:salon_2/ui/home_screen/model/get_all_salon_model.dart';

PublicSearchSalonsResponse publicSearchSalonsResponseFromJson(String str) =>
    PublicSearchSalonsResponse.fromJson(json.decode(str));

class PublicSearchSalonsResponse {
  final bool? status;
  final List<PublicSearchSalon> salons;
  final int totalReviews;
  final String? searchCity;

  PublicSearchSalonsResponse({
    this.status,
    this.salons = const [],
    this.totalReviews = 0,
    this.searchCity,
  });

  factory PublicSearchSalonsResponse.fromJson(Map<String, dynamic> json) =>
      PublicSearchSalonsResponse(
        status: json['status'] as bool?,
        salons: json['salons'] == null
            ? []
            : List<PublicSearchSalon>.from(
                (json['salons'] as List).map(
                  (x) => PublicSearchSalon.fromJson(x as Map<String, dynamic>),
                ),
              ),
        totalReviews: (json['totalReviews'] as num?)?.toInt() ?? 0,
        searchCity: json['searchCity'] as String?,
      );
}

class PublicSearchSalon {
  final String id;
  final String name;
  final String? mainImage;
  final num review;
  final int reviewCount;
  final String? address;
  final String? city;
  final num? minPrice;
  final double? distance;
  final double? latitude;
  final double? longitude;

  const PublicSearchSalon({
    required this.id,
    required this.name,
    this.mainImage,
    this.review = 0,
    this.reviewCount = 0,
    this.address,
    this.city,
    this.minPrice,
    this.distance,
    this.latitude,
    this.longitude,
  });

  factory PublicSearchSalon.fromJson(Map<String, dynamic> json) =>
      PublicSearchSalon(
        id: (json['_id'] ?? json['id'] ?? '').toString(),
        name: (json['name'] ?? '').toString(),
        mainImage: json['mainImage'] as String?,
        review: json['review'] as num? ?? 0,
        reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
        address: json['address'] as String?,
        city: json['city'] as String?,
        minPrice: json['minPrice'] as num?,
        distance: (json['distance'] as num?)?.toDouble(),
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
      );

  Datum toDatum() => Datum(
        id: id,
        name: name,
        mainImage: mainImage,
        review: review,
        reviewCount: reviewCount,
        distance: distance,
        addressDetails: AddressDetails(
          addressLine1: address,
          city: city,
        ),
        locationCoordinates: (latitude != null && longitude != null)
            ? LocationCoordinates(
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              )
            : null,
      );
}
