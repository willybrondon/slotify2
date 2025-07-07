// To parse this JSON data, do
//
//     final getAllSalonModel = getAllSalonModelFromJson(jsonString);

import 'dart:convert';

GetAllSalonModel getAllSalonModelFromJson(String str) => GetAllSalonModel.fromJson(json.decode(str));

String getAllSalonModelToJson(GetAllSalonModel data) => json.encode(data.toJson());

class GetAllSalonModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetAllSalonModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetAllSalonModel.fromJson(Map<String, dynamic> json) => GetAllSalonModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? [] : List<Datum>.from(json["data"]!.map((x) => Datum.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
      };
}

class Datum {
  AddressDetails? addressDetails;
  LocationCoordinates? locationCoordinates;
  String? id;
  String? name;
  String? email;
  String? mobile;
  String? about;
  num? platformFee;
  num? wallet;
  num? review;
  num? reviewCount;
  bool? isActive;
  bool? isDelete;
  List<String>? image;
  String? mainImage;
  bool? flag;
  bool? isBestSeller;
  List<SalonTime>? salonTime;
  List<ServiceId>? serviceIds;
  String? password;
  num? uniqueId;
  DateTime? createdAt;
  DateTime? updatedAt;
  num? distance;
  bool? isFavorite;

  Datum({
    this.addressDetails,
    this.locationCoordinates,
    this.id,
    this.name,
    this.email,
    this.mobile,
    this.about,
    this.platformFee,
    this.wallet,
    this.review,
    this.reviewCount,
    this.isActive,
    this.isDelete,
    this.image,
    this.mainImage,
    this.flag,
    this.isBestSeller,
    this.salonTime,
    this.serviceIds,
    this.password,
    this.uniqueId,
    this.createdAt,
    this.updatedAt,
    this.distance,
    this.isFavorite,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        addressDetails: json["addressDetails"] == null ? null : AddressDetails.fromJson(json["addressDetails"]),
        locationCoordinates:
            json["locationCoordinates"] == null ? null : LocationCoordinates.fromJson(json["locationCoordinates"]),
        id: json["_id"],
        name: json["name"],
        email: json["email"],
        mobile: json["mobile"],
        about: json["about"],
        platformFee: json["platformFee"],
        wallet: json["wallet"],
        review: json["review"],
        reviewCount: json["reviewCount"],
        isActive: json["isActive"],
        isDelete: json["isDelete"],
        image: json["image"] == null ? [] : List<String>.from(json["image"]!.map((x) => x)),
        mainImage: json["mainImage"],
        flag: json["flag"],
        isBestSeller: json["isBestSeller"],
        salonTime: json["salonTime"] == null ? [] : List<SalonTime>.from(json["salonTime"]!.map((x) => SalonTime.fromJson(x))),
        serviceIds: json["serviceIds"] == null ? [] : List<ServiceId>.from(json["serviceIds"]!.map((x) => ServiceId.fromJson(x))),
        password: json["password"],
        uniqueId: json["uniqueId"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
        distance: json["distance"],
        isFavorite: json["isFavorite"],
      );

  Map<String, dynamic> toJson() => {
        "addressDetails": addressDetails?.toJson(),
        "locationCoordinates": locationCoordinates?.toJson(),
        "_id": id,
        "name": name,
        "email": email,
        "mobile": mobile,
        "about": about,
        "platformFee": platformFee,
        "wallet": wallet,
        "review": review,
        "reviewCount": reviewCount,
        "isActive": isActive,
        "isDelete": isDelete,
        "image": image == null ? [] : List<dynamic>.from(image!.map((x) => x)),
        "mainImage": mainImage,
        "flag": flag,
        "isBestSeller": isBestSeller,
        "salonTime": salonTime == null ? [] : List<dynamic>.from(salonTime!.map((x) => x.toJson())),
        "serviceIds": serviceIds == null ? [] : List<dynamic>.from(serviceIds!.map((x) => x.toJson())),
        "password": password,
        "uniqueId": uniqueId,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "distance": distance,
        "isFavorite": isFavorite,
      };
}

class AddressDetails {
  String? addressLine1;
  String? landMark;
  String? city;
  String? state;
  String? country;

  AddressDetails({
    this.addressLine1,
    this.landMark,
    this.city,
    this.state,
    this.country,
  });

  factory AddressDetails.fromJson(Map<String, dynamic> json) => AddressDetails(
        addressLine1: json["addressLine1"],
        landMark: json["landMark"],
        city: json["city"],
        state: json["state"],
        country: json["country"],
      );

  Map<String, dynamic> toJson() => {
        "addressLine1": addressLine1,
        "landMark": landMark,
        "city": city,
        "state": state,
        "country": country,
      };
}

class LocationCoordinates {
  String? latitude;
  String? longitude;

  LocationCoordinates({
    this.latitude,
    this.longitude,
  });

  factory LocationCoordinates.fromJson(Map<String, dynamic> json) => LocationCoordinates(
        latitude: json["latitude"],
        longitude: json["longitude"],
      );

  Map<String, dynamic> toJson() => {
        "latitude": latitude,
        "longitude": longitude,
      };
}

class SalonTime {
  String? day;
  String? openTime;
  String? closedTime;
  bool? isActive;
  String? breakStartTime;
  String? breakEndTime;
  num? time;
  bool? isBreak;
  String? id;

  SalonTime({
    this.day,
    this.openTime,
    this.closedTime,
    this.isActive,
    this.breakStartTime,
    this.breakEndTime,
    this.time,
    this.isBreak,
    this.id,
  });

  factory SalonTime.fromJson(Map<String, dynamic> json) => SalonTime(
        day: json["day"],
        openTime: json["openTime"],
        closedTime: json["closedTime"],
        isActive: json["isActive"],
        breakStartTime: json["breakStartTime"],
        breakEndTime: json["breakEndTime"],
        time: json["time"],
        isBreak: json["isBreak"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "day": day,
        "openTime": openTime,
        "closedTime": closedTime,
        "isActive": isActive,
        "breakStartTime": breakStartTime,
        "breakEndTime": breakEndTime,
        "time": time,
        "isBreak": isBreak,
        "_id": id,
      };
}

class ServiceId {
  String? serviceIdId;
  num? price;
  String? id;

  ServiceId({
    this.serviceIdId,
    this.price,
    this.id,
  });

  factory ServiceId.fromJson(Map<String, dynamic> json) => ServiceId(
        serviceIdId: json["id"],
        price: json["price"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "id": serviceIdId,
        "price": price,
        "_id": id,
      };
}
