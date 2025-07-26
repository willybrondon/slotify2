// To parse this JSON data, do
//
//     final addCartModel = addCartModelFromJson(jsonString);

import 'dart:convert';

AddCartModel addCartModelFromJson(String str) => AddCartModel.fromJson(json.decode(str));

String addCartModelToJson(AddCartModel data) => json.encode(data.toJson());

class AddCartModel {
  bool? status;
  String? message;
  Data? data;

  AddCartModel({
    this.status,
    this.message,
    this.data,
  });

  factory AddCartModel.fromJson(Map<String, dynamic> json) => AddCartModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? null : Data.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data?.toJson(),
      };
}

class Data {
  int? totalShippingCharges;
  int? subTotal;
  int? total;
  int? finalTotal;
  int? totalItems;
  String? id;
  List<Item>? items;
  String? userId;

  Data({
    this.totalShippingCharges,
    this.subTotal,
    this.total,
    this.finalTotal,
    this.totalItems,
    this.id,
    this.items,
    this.userId,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        totalShippingCharges: json["totalShippingCharges"],
        subTotal: json["subTotal"],
        total: json["total"],
        finalTotal: json["finalTotal"],
        totalItems: json["totalItems"],
        id: json["_id"],
        items: json["items"] == null ? [] : List<Item>.from(json["items"]!.map((x) => Item.fromJson(x))),
        userId: json["userId"],
      );

  Map<String, dynamic> toJson() => {
        "totalShippingCharges": totalShippingCharges,
        "subTotal": subTotal,
        "total": total,
        "finalTotal": finalTotal,
        "totalItems": totalItems,
        "_id": id,
        "items": items == null ? [] : List<dynamic>.from(items!.map((x) => x.toJson())),
        "userId": userId,
      };
}

class Item {
  Product? product;
  String? salon;
  int? purchasedTimeProductPrice;
  int? purchasedTimeShippingCharges;
  String? productCode;
  int? productQuantity;
  List<AttributesArray>? attributesArray;
  String? id;

  Item({
    this.product,
    this.salon,
    this.purchasedTimeProductPrice,
    this.purchasedTimeShippingCharges,
    this.productCode,
    this.productQuantity,
    this.attributesArray,
    this.id,
  });

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        product: json["product"] == null ? null : Product.fromJson(json["product"]),
        salon: json["salon"],
        purchasedTimeProductPrice: json["purchasedTimeProductPrice"],
        purchasedTimeShippingCharges: json["purchasedTimeShippingCharges"],
        productCode: json["productCode"],
        productQuantity: json["productQuantity"],
        attributesArray: json["attributesArray"] == null
            ? []
            : List<AttributesArray>.from(json["attributesArray"]!.map((x) => AttributesArray.fromJson(x))),
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "product": product?.toJson(),
        "salon": salon,
        "purchasedTimeProductPrice": purchasedTimeProductPrice,
        "purchasedTimeShippingCharges": purchasedTimeShippingCharges,
        "productCode": productCode,
        "productQuantity": productQuantity,
        "attributesArray": attributesArray == null ? [] : List<dynamic>.from(attributesArray!.map((x) => x.toJson())),
        "_id": id,
      };
}

class AttributesArray {
  String? name;
  String? value;
  String? id;

  AttributesArray({
    this.name,
    this.value,
    this.id,
  });

  factory AttributesArray.fromJson(Map<String, dynamic> json) => AttributesArray(
        name: json["name"],
        value: json["value"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "value": value,
        "_id": id,
      };
}

class Product {
  String? id;
  String? productName;
  String? mainImage;

  Product({
    this.id,
    this.productName,
    this.mainImage,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json["_id"],
        productName: json["productName"],
        mainImage: json["mainImage"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "productName": productName,
        "mainImage": mainImage,
      };
}
