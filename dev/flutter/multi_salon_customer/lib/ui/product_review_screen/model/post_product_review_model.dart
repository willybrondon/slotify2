import 'dart:convert';

PostProductReviewModel postProductReviewModelFromJson(String str) => PostProductReviewModel.fromJson(json.decode(str));
String postProductReviewModelToJson(PostProductReviewModel data) => json.encode(data.toJson());

class PostProductReviewModel {
  PostProductReviewModel({
    bool? status,
    String? message,
    Review? review,
  }) {
    _status = status;
    _message = message;
    _review = review;
  }

  PostProductReviewModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _review = json['review'] != null ? Review.fromJson(json['review']) : null;
  }
  bool? _status;
  String? _message;
  Review? _review;
  PostProductReviewModel copyWith({
    bool? status,
    String? message,
    Review? review,
  }) =>
      PostProductReviewModel(
        status: status ?? _status,
        message: message ?? _message,
        review: review ?? _review,
      );
  bool? get status => _status;
  String? get message => _message;
  Review? get review => _review;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_review != null) {
      map['review'] = _review?.toJson();
    }
    return map;
  }
}

Review reviewFromJson(String str) => Review.fromJson(json.decode(str));
String reviewToJson(Review data) => json.encode(data.toJson());

class Review {
  Review({
    String? id,
    UserId? userId,
    ProductId? productId,
    SalonId? salonId,
    String? review,
    num? rating,
    num? reviewType,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _userId = userId;
    _productId = productId;
    _salonId = salonId;
    _review = review;
    _rating = rating;
    _reviewType = reviewType;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Review.fromJson(dynamic json) {
    _id = json['_id'];
    _userId = json['userId'] != null ? UserId.fromJson(json['userId']) : null;
    _productId = json['productId'] != null ? ProductId.fromJson(json['productId']) : null;
    _salonId = json['salonId'] != null ? SalonId.fromJson(json['salonId']) : null;
    _review = json['review'];
    _rating = json['rating'];
    _reviewType = json['reviewType'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  UserId? _userId;
  ProductId? _productId;
  SalonId? _salonId;
  String? _review;
  num? _rating;
  num? _reviewType;
  String? _createdAt;
  String? _updatedAt;
  Review copyWith({
    String? id,
    UserId? userId,
    ProductId? productId,
    SalonId? salonId,
    String? review,
    num? rating,
    num? reviewType,
    String? createdAt,
    String? updatedAt,
  }) =>
      Review(
        id: id ?? _id,
        userId: userId ?? _userId,
        productId: productId ?? _productId,
        salonId: salonId ?? _salonId,
        review: review ?? _review,
        rating: rating ?? _rating,
        reviewType: reviewType ?? _reviewType,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  UserId? get userId => _userId;
  ProductId? get productId => _productId;
  SalonId? get salonId => _salonId;
  String? get review => _review;
  num? get rating => _rating;
  num? get reviewType => _reviewType;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    if (_userId != null) {
      map['userId'] = _userId?.toJson();
    }
    if (_productId != null) {
      map['productId'] = _productId?.toJson();
    }
    if (_salonId != null) {
      map['salonId'] = _salonId?.toJson();
    }
    map['review'] = _review;
    map['rating'] = _rating;
    map['reviewType'] = _reviewType;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

SalonId salonIdFromJson(String str) => SalonId.fromJson(json.decode(str));
String salonIdToJson(SalonId data) => json.encode(data.toJson());

class SalonId {
  SalonId({
    String? id,
    String? name,
  }) {
    _id = id;
    _name = name;
  }

  SalonId.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
  }
  String? _id;
  String? _name;
  SalonId copyWith({
    String? id,
    String? name,
  }) =>
      SalonId(
        id: id ?? _id,
        name: name ?? _name,
      );
  String? get id => _id;
  String? get name => _name;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    return map;
  }
}

ProductId productIdFromJson(String str) => ProductId.fromJson(json.decode(str));
String productIdToJson(ProductId data) => json.encode(data.toJson());

class ProductId {
  ProductId({
    String? id,
  }) {
    _id = id;
  }

  ProductId.fromJson(dynamic json) {
    _id = json['_id'];
  }
  String? _id;
  ProductId copyWith({
    String? id,
  }) =>
      ProductId(
        id: id ?? _id,
      );
  String? get id => _id;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    return map;
  }
}

UserId userIdFromJson(String str) => UserId.fromJson(json.decode(str));
String userIdToJson(UserId data) => json.encode(data.toJson());

class UserId {
  UserId({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
  }

  UserId.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  UserId copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) =>
      UserId(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    return map;
  }
}
