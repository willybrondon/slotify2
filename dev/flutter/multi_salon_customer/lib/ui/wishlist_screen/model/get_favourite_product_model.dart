import 'dart:convert';

GetFavouriteProductModel getFavouriteProductModelFromJson(String str) => GetFavouriteProductModel.fromJson(json.decode(str));
String getFavouriteProductModelToJson(GetFavouriteProductModel data) => json.encode(data.toJson());

class GetFavouriteProductModel {
  GetFavouriteProductModel({
    bool? status,
    String? message,
    List<Favourite>? favourite,
  }) {
    _status = status;
    _message = message;
    _favourite = favourite;
  }

  GetFavouriteProductModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['favourite'] != null) {
      _favourite = [];
      json['favourite'].forEach((v) {
        _favourite?.add(Favourite.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Favourite>? _favourite;
  GetFavouriteProductModel copyWith({
    bool? status,
    String? message,
    List<Favourite>? favourite,
  }) =>
      GetFavouriteProductModel(
        status: status ?? _status,
        message: message ?? _message,
        favourite: favourite ?? _favourite,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Favourite>? get favourite => _favourite;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_favourite != null) {
      map['favourite'] = _favourite?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Favourite favouriteFromJson(String str) => Favourite.fromJson(json.decode(str));
String favouriteToJson(Favourite data) => json.encode(data.toJson());

class Favourite {
  Favourite({
    String? id,
    String? userId,
    String? productId,
    String? categoryId,
    num? type,
    Product? product,
  }) {
    _id = id;
    _userId = userId;
    _productId = productId;
    _categoryId = categoryId;
    _type = type;
    _product = product;
  }

  Favourite.fromJson(dynamic json) {
    _id = json['_id'];
    _userId = json['userId'];
    _productId = json['productId'];
    _categoryId = json['categoryId'];
    _type = json['type'];
    _product = json['product'] != null ? Product.fromJson(json['product']) : null;
  }
  String? _id;
  String? _userId;
  String? _productId;
  String? _categoryId;
  num? _type;
  Product? _product;
  Favourite copyWith({
    String? id,
    String? userId,
    String? productId,
    String? categoryId,
    num? type,
    Product? product,
  }) =>
      Favourite(
        id: id ?? _id,
        userId: userId ?? _userId,
        productId: productId ?? _productId,
        categoryId: categoryId ?? _categoryId,
        type: type ?? _type,
        product: product ?? _product,
      );
  String? get id => _id;
  String? get userId => _userId;
  String? get productId => _productId;
  String? get categoryId => _categoryId;
  num? get type => _type;
  Product? get product => _product;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['userId'] = _userId;
    map['productId'] = _productId;
    map['categoryId'] = _categoryId;
    map['type'] = _type;
    if (_product != null) {
      map['product'] = _product?.toJson();
    }
    return map;
  }
}

Product productFromJson(String str) => Product.fromJson(json.decode(str));
String productToJson(Product data) => json.encode(data.toJson());

class Product {
  Product({
    String? id,
    num? price,
    String? productName,
    String? mainImage,
    String? category,
  }) {
    _id = id;
    _price = price;
    _productName = productName;
    _mainImage = mainImage;
    _category = category;
  }

  Product.fromJson(dynamic json) {
    _id = json['_id'];
    _price = json['price'];
    _productName = json['productName'];
    _mainImage = json['mainImage'];
    _category = json['category'];
  }
  String? _id;
  num? _price;
  String? _productName;
  String? _mainImage;
  String? _category;
  Product copyWith({
    String? id,
    num? price,
    String? productName,
    String? mainImage,
    String? category,
  }) =>
      Product(
        id: id ?? _id,
        price: price ?? _price,
        productName: productName ?? _productName,
        mainImage: mainImage ?? _mainImage,
        category: category ?? _category,
      );
  String? get id => _id;
  num? get price => _price;
  String? get productName => _productName;
  String? get mainImage => _mainImage;
  String? get category => _category;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['price'] = _price;
    map['productName'] = _productName;
    map['mainImage'] = _mainImage;
    map['category'] = _category;
    return map;
  }
}
