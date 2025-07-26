// To parse this JSON data, do
//
//     final getSearchProductModel = getSearchProductModelFromJson(jsonString);

import 'dart:convert';

GetSearchProductModel getSearchProductModelFromJson(String str) => GetSearchProductModel.fromJson(json.decode(str));

String getSearchProductModelToJson(GetSearchProductModel data) => json.encode(data.toJson());

class GetSearchProductModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetSearchProductModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetSearchProductModel.fromJson(Map<String, dynamic> json) => GetSearchProductModel(
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
  int? price;
  int? mrp;
  int? shippingCharges;
  List<String>? images;
  int? quantity;
  int? review;
  int? sold;
  bool? isOutOfStock;
  bool? isBestSeller;
  String? salon;
  Category? category;
  double? rating;
  AteStatus? createStatus;
  AteStatus? updateStatus;
  String? productName;
  String? description;
  String? brand;
  String? mainImage;
  bool? isFavourite;

  Datum({
    this.id,
    this.productCode,
    this.price,
    this.mrp,
    this.shippingCharges,
    this.images,
    this.quantity,
    this.review,
    this.sold,
    this.isOutOfStock,
    this.isBestSeller,
    this.salon,
    this.category,
    this.rating,
    this.createStatus,
    this.updateStatus,
    this.productName,
    this.description,
    this.brand,
    this.mainImage,
    this.isFavourite,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        productCode: json["productCode"],
        price: json["price"],
        mrp: json["mrp"],
        shippingCharges: json["shippingCharges"],
        images: json["images"] == null ? [] : List<String>.from(json["images"]!.map((x) => x)),
        quantity: json["quantity"],
        review: json["review"],
        sold: json["sold"],
        isOutOfStock: json["isOutOfStock"],
    isBestSeller: json["isBestSeller"],
        salon: json["salon"],
        category: json["category"] == null ? null : Category.fromJson(json["category"]),
        rating: json["rating"]?.toDouble(),
        createStatus: ateStatusValues.map[json["createStatus"]]!,
        updateStatus: ateStatusValues.map[json["updateStatus"]]!,
        productName: json["productName"],
        description: json["description"],
        brand: json["brand"],
        mainImage: json["mainImage"],
        isFavourite: json["isFavourite"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "productCode": productCode,
        "price": price,
        "mrp": mrp,
        "shippingCharges": shippingCharges,
        "images": images == null ? [] : List<dynamic>.from(images!.map((x) => x)),
        "quantity": quantity,
        "review": review,
        "sold": sold,
        "isOutOfStock": isOutOfStock,
        "isBestSeller": isBestSeller,
        "salon": salon,
        "category": category?.toJson(),
        "rating": rating,
        "createStatus": ateStatusValues.reverse[createStatus],
        "updateStatus": ateStatusValues.reverse[updateStatus],
        "productName": productName,
        "description": description,
        "brand": brand,
        "mainImage": mainImage,
        "isFavourite": isFavourite,
      };
}

class Category {
  String? name;

  Category({
    this.name,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        name: json["name"],
      );

  Map<String, dynamic> toJson() => {
        "name": name,
      };
}

enum AteStatus { APPROVED }

final ateStatusValues = EnumValues({"Approved": AteStatus.APPROVED});

class EnumValues<T> {
  Map<String, T> map;
  late Map<T, String> reverseMap;

  EnumValues(this.map);

  Map<T, String> get reverse {
    reverseMap = map.map((k, v) => MapEntry(v, k));
    return reverseMap;
  }
}
