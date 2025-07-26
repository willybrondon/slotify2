// To parse this JSON data, do
//
//     final getCouponModel = getCouponModelFromJson(jsonString);

import 'dart:convert';

GetCouponModel getCouponModelFromJson(String str) => GetCouponModel.fromJson(json.decode(str));

String getCouponModelToJson(GetCouponModel data) => json.encode(data.toJson());

class GetCouponModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetCouponModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetCouponModel.fromJson(Map<String, dynamic> json) => GetCouponModel(
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
  String? id;
  String? code;
  String? title;
  String? description;
  String? expiryDate;
  int? discountPercent;
  int? maxDiscount;
  int? type;
  int? discountType;
  bool? isActive;
  int? minAmountToApply;
  DateTime? createdAt;
  DateTime? updatedAt;
  List<dynamic>? usedBy;

  Datum({
    this.id,
    this.code,
    this.title,
    this.description,
    this.expiryDate,
    this.discountPercent,
    this.maxDiscount,
    this.type,
    this.discountType,
    this.isActive,
    this.minAmountToApply,
    this.createdAt,
    this.updatedAt,
    this.usedBy,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        code: json["code"],
        title: json["title"],
        description: json["description"],
        expiryDate: json["expiryDate"],
        discountPercent: json["discountPercent"],
        maxDiscount: json["maxDiscount"],
        type: json["type"],
        discountType: json["discountType"],
        isActive: json["isActive"],
        minAmountToApply: json["minAmountToApply"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
        usedBy: json["usedBy"] == null ? [] : List<dynamic>.from(json["usedBy"]!.map((x) => x)),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "code": code,
        "title": title,
        "description": description,
        "expiryDate": expiryDate,
        "discountPercent": discountPercent,
        "maxDiscount": maxDiscount,
        "type": type,
        "discountType": discountType,
        "isActive": isActive,
        "minAmountToApply": minAmountToApply,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "usedBy": usedBy == null ? [] : List<dynamic>.from(usedBy!.map((x) => x)),
      };
}
