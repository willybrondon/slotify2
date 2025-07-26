// To parse this JSON data, do
//
//     final getProductDetailModel = getProductDetailModelFromJson(jsonString);

import 'dart:convert';

GetProductDetailModel getProductDetailModelFromJson(String str) => GetProductDetailModel.fromJson(json.decode(str));

String getProductDetailModelToJson(GetProductDetailModel data) => json.encode(data.toJson());

class GetProductDetailModel {
  bool? status;
  String? message;
  Product? product;
  List<PopularProduct>? popularProducts;
  List<Review>? reviews;

  GetProductDetailModel({
    this.status,
    this.message,
    this.product,
    this.popularProducts,
    this.reviews,
  });

  factory GetProductDetailModel.fromJson(Map<String, dynamic> json) => GetProductDetailModel(
        status: json["status"],
        message: json["message"],
        product: json["product"] == null ? null : Product.fromJson(json["product"]),
        popularProducts: json["popularProducts"] == null
            ? []
            : List<PopularProduct>.from(json["popularProducts"]!.map((x) => PopularProduct.fromJson(x))),
        reviews: json["reviews"] == null ? [] : List<Review>.from(json["reviews"]!.map((x) => Review.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "product": product?.toJson(),
        "popularProducts": popularProducts == null ? [] : List<dynamic>.from(popularProducts!.map((x) => x.toJson())),
        "reviews": reviews == null ? [] : List<dynamic>.from(reviews!.map((x) => x.toJson())),
      };
}

class PopularProduct {
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
  bool? isFollow;
  bool? isFavorite;

  PopularProduct({
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
    this.isFollow,
    this.isFavorite,
  });

  factory PopularProduct.fromJson(Map<String, dynamic> json) => PopularProduct(
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

class Product {
  String? id;
  String? productCode;
  num? price;
  num? mrp;
  num? shippingCharges;
  List<String>? images;
  num? sold;
  bool? isOutOfStock;
  bool? isNewCollection;
  Salon? salon;
  num? rating;
  String? createStatus;
  String? updateStatus;
  List<Attribute>? attributes;
  String? productName;
  String? description;
  String? brand;
  String? mainImage;
  bool? isFollow;
  bool? isFavourite;

  Product({
    this.id,
    this.productCode,
    this.price,
    this.mrp,
    this.shippingCharges,
    this.images,
    this.sold,
    this.isOutOfStock,
    this.isNewCollection,
    this.salon,
    this.rating,
    this.createStatus,
    this.updateStatus,
    this.attributes,
    this.productName,
    this.description,
    this.brand,
    this.mainImage,
    this.isFollow,
    this.isFavourite,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json["_id"],
        productCode: json["productCode"],
        price: json["price"],
        mrp: json["mrp"],
        shippingCharges: json["shippingCharges"],
        images: json["images"] == null ? [] : List<String>.from(json["images"]!.map((x) => x)),
        sold: json["sold"],
        isOutOfStock: json["isOutOfStock"],
        isNewCollection: json["isNewCollection"],
        salon: json["salon"] == null ? null : Salon.fromJson(json["salon"]),
        rating: json["rating"],
        createStatus: json["createStatus"],
        updateStatus: json["updateStatus"],
        attributes: json["attributes"] == null ? [] : List<Attribute>.from(json["attributes"]!.map((x) => Attribute.fromJson(x))),
        productName: json["productName"],
        description: json["description"],
        brand: json["brand"],
        mainImage: json["mainImage"],
        isFollow: json["isFollow"],
        isFavourite: json["isFavourite"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "productCode": productCode,
        "price": price,
        "mrp": mrp,
        "shippingCharges": shippingCharges,
        "images": images == null ? [] : List<dynamic>.from(images!.map((x) => x)),
        "sold": sold,
        "isOutOfStock": isOutOfStock,
        "isNewCollection": isNewCollection,
        "salon": salon?.toJson(),
        "rating": rating,
        "createStatus": createStatus,
        "updateStatus": updateStatus,
        "attributes": attributes == null ? [] : List<dynamic>.from(attributes!.map((x) => x.toJson())),
        "productName": productName,
        "description": description,
        "brand": brand,
        "mainImage": mainImage,
        "isFollow": isFollow,
        "isFavourite": isFavourite,
      };
}

class Salon {
  String? name;
  String? mainImage;
  bool? isBestSeller;

  Salon({
    this.name,
    this.mainImage,
    this.isBestSeller,
  });

  factory Salon.fromJson(Map<String, dynamic> json) => Salon(
        name: json["name"],
        mainImage: json["mainImage"],
        isBestSeller: json["isBestSeller"],
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "mainImage": mainImage,
        "isBestSeller": isBestSeller,
      };
}

class Review {
  String? id;
  UserId? userId;
  String? productId;
  String? salonId;
  String? review;
  num? rating;
  num? reviewType;
  DateTime? createdAt;
  DateTime? updatedAt;

  Review({
    this.id,
    this.userId,
    this.productId,
    this.salonId,
    this.review,
    this.rating,
    this.reviewType,
    this.createdAt,
    this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json["_id"],
        userId: json["userId"] == null ? null : UserId.fromJson(json["userId"]),
        productId: json["productId"],
        salonId: json["salonId"],
        review: json["review"],
        rating: json["rating"],
        reviewType: json["reviewType"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "userId": userId?.toJson(),
        "productId": productId,
        "salonId": salonId,
        "review": review,
        "rating": rating,
        "reviewType": reviewType,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}

class UserId {
  String? id;
  String? fname;
  String? lname;
  String? image;

  UserId({
    this.id,
    this.fname,
    this.lname,
    this.image,
  });

  factory UserId.fromJson(Map<String, dynamic> json) => UserId(
        id: json["_id"],
        fname: json["fname"],
        lname: json["lname"],
        image: json["image"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "fname": fname,
        "lname": lname,
        "image": image,
      };
}
