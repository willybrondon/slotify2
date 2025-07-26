// To parse this JSON data, do
//
//     final getProductCategoryModel = getProductCategoryModelFromJson(jsonString);

import 'dart:convert';

GetProductCategoryModel getProductCategoryModelFromJson(String str) => GetProductCategoryModel.fromJson(json.decode(str));

String getProductCategoryModelToJson(GetProductCategoryModel data) => json.encode(data.toJson());

class GetProductCategoryModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetProductCategoryModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetProductCategoryModel.fromJson(Map<String, dynamic> json) => GetProductCategoryModel(
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
  String? name;
  String? image;
  int? productCount;
  List<dynamic>? product;
  bool? isActive;
  DateTime? createdAt;
  DateTime? updatedAt;

  Datum({
    this.id,
    this.name,
    this.image,
    this.productCount,
    this.product,
    this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        name: json["name"],
        image: json["image"],
        productCount: json["productCount"],
        product: json["product"] == null ? [] : List<dynamic>.from(json["product"]!.map((x) => x)),
        isActive: json["isActive"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "name": name,
        "image": image,
        "productCount": productCount,
        "product": product == null ? [] : List<dynamic>.from(product!.map((x) => x)),
        "isActive": isActive,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}
