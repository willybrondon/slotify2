// To parse this JSON data, do
//
//     final getSalonDetailModel = getSalonDetailModelFromJson(jsonString);

import 'dart:convert';

GetSalonDetailModel getSalonDetailModelFromJson(String str) => GetSalonDetailModel.fromJson(json.decode(str));

String getSalonDetailModelToJson(GetSalonDetailModel data) => json.encode(data.toJson());

class GetSalonDetailModel {
  bool? status;
  String? message;
  Salon? salon;
  List<dynamic>? reviews;
  List<Expert>? experts;
  num? tax;

  GetSalonDetailModel({
    this.status,
    this.message,
    this.salon,
    this.reviews,
    this.experts,
    this.tax,
  });

  factory GetSalonDetailModel.fromJson(Map<String, dynamic> json) => GetSalonDetailModel(
        status: json["status"],
        message: json["message"],
        salon: json["salon"] == null ? null : Salon.fromJson(json["salon"]),
        reviews: json["reviews"] == null ? [] : List<dynamic>.from(json["reviews"]!.map((x) => x)),
        experts: json["experts"] == null ? [] : List<Expert>.from(json["experts"]!.map((x) => Expert.fromJson(x))),
        tax: json["tax"],
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "salon": salon?.toJson(),
        "reviews": reviews == null ? [] : List<dynamic>.from(reviews!.map((x) => x)),
        "experts": experts == null ? [] : List<dynamic>.from(experts!.map((x) => x.toJson())),
        "tax": tax,
      };
}

class Expert {
  String? id;
  String? fname;
  String? lname;
  String? image;
  List<String>? serviceId;
  num? review;
  num? reviewCount;

  Expert({
    this.id,
    this.fname,
    this.lname,
    this.image,
    this.serviceId,
    this.review,
    this.reviewCount,
  });

  factory Expert.fromJson(Map<String, dynamic> json) => Expert(
        id: json["_id"],
        fname: json["fname"],
        lname: json["lname"],
        image: json["image"],
        serviceId: json["serviceId"] == null ? [] : List<String>.from(json["serviceId"]!.map((x) => x)),
        review: json["review"],
        reviewCount: json["reviewCount"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "fname": fname,
        "lname": lname,
        "image": image,
        "serviceId": serviceId == null ? [] : List<dynamic>.from(serviceId!.map((x) => x)),
        "review": review,
        "reviewCount": reviewCount,
      };
}

class Salon {
  AddressDetails? addressDetails;
  LocationCoordinates? locationCoordinates;
  String? id;
  String? name;
  String? email;
  String? mobile;
  String? about;
  num? platformFee;
  num? review;
  num? reviewCount;
  bool? isActive;
  bool? isDelete;
  List<String>? image;
  String? mainImage;
  bool? flag;
  List<SalonTime>? salonTime;
  List<ServiceId>? serviceIds;
  String? password;
  num? uniqueId;
  DateTime? createdAt;
  DateTime? updatedAt;
  double? distance;

  Salon({
    this.addressDetails,
    this.locationCoordinates,
    this.id,
    this.name,
    this.email,
    this.mobile,
    this.about,
    this.platformFee,
    this.review,
    this.reviewCount,
    this.isActive,
    this.isDelete,
    this.image,
    this.mainImage,
    this.flag,
    this.salonTime,
    this.serviceIds,
    this.password,
    this.uniqueId,
    this.createdAt,
    this.updatedAt,
    this.distance,
  });

  factory Salon.fromJson(Map<String, dynamic> json) => Salon(
        addressDetails: json["addressDetails"] == null ? null : AddressDetails.fromJson(json["addressDetails"]),
        locationCoordinates:
            json["locationCoordinates"] == null ? null : LocationCoordinates.fromJson(json["locationCoordinates"]),
        id: json["_id"],
        name: json["name"],
        email: json["email"],
        mobile: json["mobile"],
        about: json["about"],
        platformFee: json["platformFee"],
        review: json["review"],
        reviewCount: json["reviewCount"],
        isActive: json["isActive"],
        isDelete: json["isDelete"],
        image: json["image"] == null ? [] : List<String>.from(json["image"]!.map((x) => x)),
        mainImage: json["mainImage"],
        flag: json["flag"],
        salonTime: json["salonTime"] == null ? [] : List<SalonTime>.from(json["salonTime"]!.map((x) => SalonTime.fromJson(x))),
        serviceIds: json["serviceIds"] == null ? [] : List<ServiceId>.from(json["serviceIds"]!.map((x) => ServiceId.fromJson(x))),
        password: json["password"],
        uniqueId: json["uniqueId"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
        distance: json["distance"]?.toDouble(),
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
        "review": review,
        "reviewCount": reviewCount,
        "isActive": isActive,
        "isDelete": isDelete,
        "image": image == null ? [] : List<dynamic>.from(image!.map((x) => x)),
        "mainImage": mainImage,
        "flag": flag,
        "salonTime": salonTime == null ? [] : List<dynamic>.from(salonTime!.map((x) => x.toJson())),
        "serviceIds": serviceIds == null ? [] : List<dynamic>.from(serviceIds!.map((x) => x.toJson())),
        "password": password,
        "uniqueId": uniqueId,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "distance": distance,
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
  String? breakTime;
  num? time;
  String? id;

  SalonTime({
    this.day,
    this.openTime,
    this.closedTime,
    this.isActive,
    this.breakTime,
    this.time,
    this.id,
  });

  factory SalonTime.fromJson(Map<String, dynamic> json) => SalonTime(
        day: json["day"],
        openTime: json["openTime"],
        closedTime: json["closedTime"],
        isActive: json["isActive"],
        breakTime: json["breakTime"],
        time: json["time"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "day": day,
        "openTime": openTime,
        "closedTime": closedTime,
        "isActive": isActive,
        "breakTime": breakTime,
        "time": time,
        "_id": id,
      };
}

class ServiceId {
  Id? serviceIdId;
  num? price;
  String? id;

  ServiceId({
    this.serviceIdId,
    this.price,
    this.id,
  });

  factory ServiceId.fromJson(Map<String, dynamic> json) => ServiceId(
        serviceIdId: json["id"] == null ? null : Id.fromJson(json["id"]),
        price: json["price"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "id": serviceIdId?.toJson(),
        "price": price,
        "_id": id,
      };
}

class Id {
  String? id;
  bool? status;
  bool? isDelete;
  String? name;
  int? duration;
  String? categoryId;
  String? image;
  DateTime? createdAt;
  DateTime? updatedAt;

  Id({
    this.id,
    this.status,
    this.isDelete,
    this.name,
    this.duration,
    this.categoryId,
    this.image,
    this.createdAt,
    this.updatedAt,
  });

  factory Id.fromJson(Map<String, dynamic> json) => Id(
        id: json["_id"],
        status: json["status"],
        isDelete: json["isDelete"],
        name: json["name"],
        duration: json["duration"],
        categoryId: json["categoryId"],
        image: json["image"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "status": status,
        "isDelete": isDelete,
        "name": name,
        "duration": duration,
        "categoryId": categoryId,
        "image": image,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}
