import 'dart:convert';

UserSubmitReviewModel userSubmitReviewModelFromJson(String str) =>
    UserSubmitReviewModel.fromJson(json.decode(str));
String userSubmitReviewModelToJson(UserSubmitReviewModel data) => json.encode(data.toJson());

class UserSubmitReviewModel {
  UserSubmitReviewModel({
    bool? status,
    String? message,
    Review? review,
  }) {
    _status = status;
    _message = message;
    _review = review;
  }

  UserSubmitReviewModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _review = json['review'] != null ? Review.fromJson(json['review']) : null;
  }
  bool? _status;
  String? _message;
  Review? _review;
  UserSubmitReviewModel copyWith({
    bool? status,
    String? message,
    Review? review,
  }) =>
      UserSubmitReviewModel(
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
    num? rating,
    BookingId? bookingId,
    UserId? userId,
    SalonId? salonId,
    ExpertId? expertId,
    String? review,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _rating = rating;
    _bookingId = bookingId;
    _userId = userId;
    _salonId = salonId;
    _expertId = expertId;
    _review = review;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Review.fromJson(dynamic json) {
    _id = json['_id'];
    _rating = json['rating'];
    _bookingId = json['bookingId'] != null ? BookingId.fromJson(json['bookingId']) : null;
    _userId = json['userId'] != null ? UserId.fromJson(json['userId']) : null;
    _salonId = json['salonId'] != null ? SalonId.fromJson(json['salonId']) : null;
    _expertId = json['expertId'] != null ? ExpertId.fromJson(json['expertId']) : null;
    _review = json['review'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  num? _rating;
  BookingId? _bookingId;
  UserId? _userId;
  SalonId? _salonId;
  ExpertId? _expertId;
  String? _review;
  String? _createdAt;
  String? _updatedAt;
  Review copyWith({
    String? id,
    num? rating,
    BookingId? bookingId,
    UserId? userId,
    SalonId? salonId,
    ExpertId? expertId,
    String? review,
    String? createdAt,
    String? updatedAt,
  }) =>
      Review(
        id: id ?? _id,
        rating: rating ?? _rating,
        bookingId: bookingId ?? _bookingId,
        userId: userId ?? _userId,
        salonId: salonId ?? _salonId,
        expertId: expertId ?? _expertId,
        review: review ?? _review,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  num? get rating => _rating;
  BookingId? get bookingId => _bookingId;
  UserId? get userId => _userId;
  SalonId? get salonId => _salonId;
  ExpertId? get expertId => _expertId;
  String? get review => _review;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['rating'] = _rating;
    if (_bookingId != null) {
      map['bookingId'] = _bookingId?.toJson();
    }
    if (_userId != null) {
      map['userId'] = _userId?.toJson();
    }
    if (_salonId != null) {
      map['salonId'] = _salonId?.toJson();
    }
    if (_expertId != null) {
      map['expertId'] = _expertId?.toJson();
    }
    map['review'] = _review;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

ExpertId expertIdFromJson(String str) => ExpertId.fromJson(json.decode(str));
String expertIdToJson(ExpertId data) => json.encode(data.toJson());

class ExpertId {
  ExpertId({
    String? id,
    String? fname,
    String? lname,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
  }

  ExpertId.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  ExpertId copyWith({
    String? id,
    String? fname,
    String? lname,
  }) =>
      ExpertId(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
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

BookingId bookingIdFromJson(String str) => BookingId.fromJson(json.decode(str));
String bookingIdToJson(BookingId data) => json.encode(data.toJson());

class BookingId {
  BookingId({
    String? id,
    List<String>? time,
    List<String>? serviceId,
    bool? isReviewed,
    num? paymentStatus,
    num? amount,
  }) {
    _id = id;
    _time = time;
    _serviceId = serviceId;
    _isReviewed = isReviewed;
    _paymentStatus = paymentStatus;
    _amount = amount;
  }

  BookingId.fromJson(dynamic json) {
    _id = json['_id'];
    _time = json['time'] != null ? json['time'].cast<String>() : [];
    _serviceId = json['serviceId'] != null ? json['serviceId'].cast<String>() : [];
    _isReviewed = json['isReviewed'];
    _paymentStatus = json['paymentStatus'];
    _amount = json['amount'];
  }
  String? _id;
  List<String>? _time;
  List<String>? _serviceId;
  bool? _isReviewed;
  num? _paymentStatus;
  num? _amount;
  BookingId copyWith({
    String? id,
    List<String>? time,
    List<String>? serviceId,
    bool? isReviewed,
    num? paymentStatus,
    num? amount,
  }) =>
      BookingId(
        id: id ?? _id,
        time: time ?? _time,
        serviceId: serviceId ?? _serviceId,
        isReviewed: isReviewed ?? _isReviewed,
        paymentStatus: paymentStatus ?? _paymentStatus,
        amount: amount ?? _amount,
      );
  String? get id => _id;
  List<String>? get time => _time;
  List<String>? get serviceId => _serviceId;
  bool? get isReviewed => _isReviewed;
  num? get paymentStatus => _paymentStatus;
  num? get amount => _amount;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['time'] = _time;
    map['serviceId'] = _serviceId;
    map['isReviewed'] = _isReviewed;
    map['paymentStatus'] = _paymentStatus;
    map['amount'] = _amount;
    return map;
  }
}
