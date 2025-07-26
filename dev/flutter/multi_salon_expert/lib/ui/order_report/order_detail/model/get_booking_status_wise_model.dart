import 'dart:convert';

GetBookingStatusWiseModel getBookingStatusWiseModelFromJson(String str) => GetBookingStatusWiseModel.fromJson(json.decode(str));
String getBookingStatusWiseModelToJson(GetBookingStatusWiseModel data) => json.encode(data.toJson());

class GetBookingStatusWiseModel {
  GetBookingStatusWiseModel({
    bool? status,
    String? message,
    List<Data>? data,
    List<Reviews>? reviews,
  }) {
    _status = status;
    _message = message;
    _data = data;
    _reviews = reviews;
  }

  GetBookingStatusWiseModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
    if (json['reviews'] != null) {
      _reviews = [];
      json['reviews'].forEach((v) {
        _reviews?.add(Reviews.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Data>? _data;
  List<Reviews>? _reviews;
  GetBookingStatusWiseModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
    List<Reviews>? reviews,
  }) =>
      GetBookingStatusWiseModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
        reviews: reviews ?? _reviews,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Data>? get data => _data;
  List<Reviews>? get reviews => _reviews;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    if (_reviews != null) {
      map['reviews'] = _reviews?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Reviews reviewsFromJson(String str) => Reviews.fromJson(json.decode(str));
String reviewsToJson(Reviews data) => json.encode(data.toJson());

class Reviews {
  Reviews({
    String? id,
    UserId? userId,
    String? salonId,
    String? review,
    num? rating,
    String? bookingId,
    String? expertId,
    num? reviewType,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _userId = userId;
    _salonId = salonId;
    _review = review;
    _rating = rating;
    _bookingId = bookingId;
    _expertId = expertId;
    _reviewType = reviewType;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Reviews.fromJson(dynamic json) {
    _id = json['_id'];
    _userId = json['userId'] != null ? UserId.fromJson(json['userId']) : null;
    _salonId = json['salonId'];
    _review = json['review'];
    _rating = json['rating'];
    _bookingId = json['bookingId'];
    _expertId = json['expertId'];
    _reviewType = json['reviewType'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  UserId? _userId;
  String? _salonId;
  String? _review;
  num? _rating;
  String? _bookingId;
  String? _expertId;
  num? _reviewType;
  String? _createdAt;
  String? _updatedAt;
  Reviews copyWith({
    String? id,
    UserId? userId,
    String? salonId,
    String? review,
    num? rating,
    String? bookingId,
    String? expertId,
    num? reviewType,
    String? createdAt,
    String? updatedAt,
  }) =>
      Reviews(
        id: id ?? _id,
        userId: userId ?? _userId,
        salonId: salonId ?? _salonId,
        review: review ?? _review,
        rating: rating ?? _rating,
        bookingId: bookingId ?? _bookingId,
        expertId: expertId ?? _expertId,
        reviewType: reviewType ?? _reviewType,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  UserId? get userId => _userId;
  String? get salonId => _salonId;
  String? get review => _review;
  num? get rating => _rating;
  String? get bookingId => _bookingId;
  String? get expertId => _expertId;
  num? get reviewType => _reviewType;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    if (_userId != null) {
      map['userId'] = _userId?.toJson();
    }
    map['salonId'] = _salonId;
    map['review'] = _review;
    map['rating'] = _rating;
    map['bookingId'] = _bookingId;
    map['expertId'] = _expertId;
    map['reviewType'] = _reviewType;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
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
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
  }

  UserId.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  UserId copyWith({
    String? id,
    String? fname,
    String? lname,
  }) =>
      UserId(
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

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? id,
    String? status,
    String? date,
    bool? isReviewed,
    num? withoutTax,
    num? amount,
    num? expertEarning,
    String? startTime,
    String? bookingId,
    String? createdAt,
    String? checkInTime,
    String? checkOutTime,
    List<String>? service,
    List<String>? serviceImage,
    String? userLname,
    String? userFname,
  }) {
    _id = id;
    _status = status;
    _date = date;
    _isReviewed = isReviewed;
    _withoutTax = withoutTax;
    _amount = amount;
    _expertEarning = expertEarning;
    _startTime = startTime;
    _bookingId = bookingId;
    _createdAt = createdAt;
    _checkInTime = checkInTime;
    _checkOutTime = checkOutTime;
    _service = service;
    _serviceImage = serviceImage;
    _userLname = userLname;
    _userFname = userFname;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _status = json['status'];
    _date = json['date'];
    _isReviewed = json['isReviewed'];
    _withoutTax = json['withoutTax'];
    _amount = json['amount'];
    _expertEarning = json['expertEarning'];
    _startTime = json['startTime'];
    _bookingId = json['bookingId'];
    _createdAt = json['createdAt'];
    _checkInTime = json['checkInTime'];
    _checkOutTime = json['checkOutTime'];
    _service = json['service'] != null ? json['service'].cast<String>() : [];
    _serviceImage = json['serviceImage'] != null ? json['serviceImage'].cast<String>() : [];
    _userLname = json['userLname'];
    _userFname = json['userFname'];
  }
  String? _id;
  String? _status;
  String? _date;
  bool? _isReviewed;
  num? _withoutTax;
  num? _amount;
  num? _expertEarning;
  String? _startTime;
  String? _bookingId;
  String? _createdAt;
  String? _checkInTime;
  String? _checkOutTime;
  List<String>? _service;
  List<String>? _serviceImage;
  String? _userLname;
  String? _userFname;
  Data copyWith({
    String? id,
    String? status,
    String? date,
    bool? isReviewed,
    num? withoutTax,
    num? amount,
    num? expertEarning,
    String? startTime,
    String? bookingId,
    String? createdAt,
    String? checkInTime,
    String? checkOutTime,
    List<String>? service,
    List<String>? serviceImage,
    String? userLname,
    String? userFname,
  }) =>
      Data(
        id: id ?? _id,
        status: status ?? _status,
        date: date ?? _date,
        isReviewed: isReviewed ?? _isReviewed,
        withoutTax: withoutTax ?? _withoutTax,
        amount: amount ?? _amount,
        expertEarning: expertEarning ?? _expertEarning,
        startTime: startTime ?? _startTime,
        bookingId: bookingId ?? _bookingId,
        createdAt: createdAt ?? _createdAt,
        checkInTime: checkInTime ?? _checkInTime,
        checkOutTime: checkOutTime ?? _checkOutTime,
        service: service ?? _service,
        serviceImage: serviceImage ?? _serviceImage,
        userLname: userLname ?? _userLname,
        userFname: userFname ?? _userFname,
      );
  String? get id => _id;
  String? get status => _status;
  String? get date => _date;
  bool? get isReviewed => _isReviewed;
  num? get withoutTax => _withoutTax;
  num? get amount => _amount;
  num? get expertEarning => _expertEarning;
  String? get startTime => _startTime;
  String? get bookingId => _bookingId;
  String? get createdAt => _createdAt;
  String? get checkInTime => _checkInTime;
  String? get checkOutTime => _checkOutTime;
  List<String>? get service => _service;
  List<String>? get serviceImage => _serviceImage;
  String? get userLname => _userLname;
  String? get userFname => _userFname;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['status'] = _status;
    map['date'] = _date;
    map['isReviewed'] = _isReviewed;
    map['withoutTax'] = _withoutTax;
    map['amount'] = _amount;
    map['expertEarning'] = _expertEarning;
    map['startTime'] = _startTime;
    map['bookingId'] = _bookingId;
    map['createdAt'] = _createdAt;
    map['checkInTime'] = _checkInTime;
    map['checkOutTime'] = _checkOutTime;
    map['service'] = _service;
    map['serviceImage'] = _serviceImage;
    map['userLname'] = _userLname;
    map['userFname'] = _userFname;
    return map;
  }
}
