// To parse this JSON data, do
//
//     final getCategoryWiseProductModel = getCategoryWiseProductModelFromJson(jsonString);

import 'dart:convert';

GetCategoryWiseProductModel getCategoryWiseProductModelFromJson(String str) =>
    GetCategoryWiseProductModel.fromJson(json.decode(str));

String getCategoryWiseProductModelToJson(GetCategoryWiseProductModel data) => json.encode(data.toJson());

class GetCategoryWiseProductModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetCategoryWiseProductModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetCategoryWiseProductModel.fromJson(Map<String, dynamic> json) => GetCategoryWiseProductModel(
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
  String? productCode;
  num? price;
  num? mrp;
  num? shippingCharges;
  List<String>? images;
  num? review;
  num? sold;
  bool? isOutOfStock;
  bool? isNewCollection;
  String? salon;
  String? category;
  num? rating;
  String? createStatus;
  String? updateStatus;
  List<Attribute>? attributes;
  String? productName;
  String? description;
  String? brand;
  String? mainImage;
  bool? isBestSeller;
  bool? isFollow;
  bool? isFavorite;

  Datum({
    this.id,
    this.productCode,
    this.price,
    this.mrp,
    this.shippingCharges,
    this.images,
    this.review,
    this.sold,
    this.isOutOfStock,
    this.isNewCollection,
    this.salon,
    this.category,
    this.rating,
    this.createStatus,
    this.updateStatus,
    this.attributes,
    this.productName,
    this.description,
    this.brand,
    this.mainImage,
    this.isBestSeller,
    this.isFollow,
    this.isFavorite,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        productCode: json["productCode"],
        price: json["price"],
        mrp: json["mrp"],
        shippingCharges: json["shippingCharges"],
        images: json["images"] == null ? [] : List<String>.from(json["images"]!.map((x) => x)),
        review: json["review"],
        sold: json["sold"],
        isOutOfStock: json["isOutOfStock"],
        isNewCollection: json["isNewCollection"],
        salon: json["salon"],
        category: json["category"],
        rating: json["rating"],
        createStatus: json["createStatus"],
        updateStatus: json["updateStatus"],
        attributes: json["attributes"] == null ? [] : List<Attribute>.from(json["attributes"]!.map((x) => Attribute.fromJson(x))),
        productName: json["productName"],
        description: json["description"],
        brand: json["brand"],
        mainImage: json["mainImage"],
        isBestSeller: json["isBestSeller"],
        isFollow: json["isFollow"],
        isFavorite: json["isFavorite"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "productCode": productCode,
        "price": price,
        "mrp": mrp,
        "shippingCharges": shippingCharges,
        "images": images == null ? [] : List<dynamic>.from(images!.map((x) => x)),
        "review": review,
        "sold": sold,
        "isOutOfStock": isOutOfStock,
        "isNewCollection": isNewCollection,
        "salon": salon,
        "category": category,
        "rating": rating,
        "createStatus": createStatus,
        "updateStatus": updateStatus,
        "attributes": attributes == null ? [] : List<dynamic>.from(attributes!.map((x) => x.toJson())),
        "productName": productName,
        "description": description,
        "brand": brand,
        "mainImage": mainImage,
        "isBestSeller": isBestSeller,
        "isFollow": isFollow,
        "isFavorite": isFavorite,
      };
}

class Attribute {
  String? name;
  List<String>? value;
  String? id;

  Attribute({
    this.name,
    this.value,
    this.id,
  });

  factory Attribute.fromJson(Map<String, dynamic> json) => Attribute(
        name: json["name"],
        value: json["value"] == null ? [] : List<String>.from(json["value"]!.map((x) => x)),
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "value": value == null ? [] : List<dynamic>.from(value!.map((x) => x)),
        "_id": id,
      };
}
