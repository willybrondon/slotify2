// To parse this JSON data, do
//
//     final getExpertServiceBaseSalonModel = getExpertServiceBaseSalonModelFromJson(jsonString);

import 'dart:convert';

GetExpertServiceBaseSalonModel getExpertServiceBaseSalonModelFromJson(String str) =>
    GetExpertServiceBaseSalonModel.fromJson(json.decode(str));

String getExpertServiceBaseSalonModelToJson(GetExpertServiceBaseSalonModel data) => json.encode(data.toJson());

class GetExpertServiceBaseSalonModel {
  bool? status;
  String? message;
  List<Datum>? data;
  num? tax;
  List<MatchedService>? matchedServices;

  GetExpertServiceBaseSalonModel({
    this.status,
    this.message,
    this.data,
    this.tax,
    this.matchedServices,
  });

  factory GetExpertServiceBaseSalonModel.fromJson(Map<String, dynamic> json) => GetExpertServiceBaseSalonModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? [] : List<Datum>.from(json["data"]!.map((x) => Datum.fromJson(x))),
        tax: json["tax"],
        matchedServices: json["matchedServices"] == null
            ? []
            : List<MatchedService>.from(json["matchedServices"]!.map((x) => MatchedService.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
        "tax": tax,
        "matchedServices": matchedServices == null ? [] : List<dynamic>.from(matchedServices!.map((x) => x.toJson())),
      };
}

class Datum {
  String? id;
  String? fname;
  String? lname;
  String? image;
  String? mobile;
  num? review;
  num? reviewCount;
  num? age;
  String? gender;
  String? salon;

  Datum({
    this.id,
    this.fname,
    this.lname,
    this.image,
    this.mobile,
    this.review,
    this.reviewCount,
    this.age,
    this.gender,
    this.salon,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        fname: json["fname"],
        lname: json["lname"],
        image: json["image"],
        mobile: json["mobile"],
        review: json["review"],
        reviewCount: json["reviewCount"],
        age: json["age"],
        gender: json["gender"],
        salon: json["salon"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "fname": fname,
        "lname": lname,
        "image": image,
        "mobile": mobile,
        "review": review,
        "reviewCount": reviewCount,
        "age": age,
        "gender": gender,
        "salon": salon,
      };
}

class MatchedService {
  Id? matchedServiceId;
  num? price;
  String? id;

  MatchedService({
    this.matchedServiceId,
    this.price,
    this.id,
  });

  factory MatchedService.fromJson(Map<String, dynamic> json) => MatchedService(
        matchedServiceId: json["id"] == null ? null : Id.fromJson(json["id"]),
        price: json["price"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "id": matchedServiceId?.toJson(),
        "price": price,
        "_id": id,
      };
}

class Id {
  String? id;
  bool? status;
  bool? isDelete;
  String? name;
  num? duration;
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
