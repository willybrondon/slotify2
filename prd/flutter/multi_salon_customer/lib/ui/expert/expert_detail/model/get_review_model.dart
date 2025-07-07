import 'dart:convert';

GetReviewModel getReviewModelFromJson(String str) => GetReviewModel.fromJson(json.decode(str));
String getReviewModelToJson(GetReviewModel data) => json.encode(data.toJson());

class GetReviewModel {
  GetReviewModel({
    bool? status,
    String? message,
    List<Data>? data,
    Expert? expert,
  }) {
    _status = status;
    _message = message;
    _data = data;
    _expert = expert;
  }

  GetReviewModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
    _expert = json['expert'] != null ? Expert.fromJson(json['expert']) : null;
  }
  bool? _status;
  String? _message;
  List<Data>? _data;
  Expert? _expert;
  GetReviewModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
    Expert? expert,
  }) =>
      GetReviewModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
        expert: expert ?? _expert,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Data>? get data => _data;
  Expert? get expert => _expert;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    if (_expert != null) {
      map['expert'] = _expert?.toJson();
    }
    return map;
  }
}

Expert expertFromJson(String str) => Expert.fromJson(json.decode(str));
String expertToJson(Expert data) => json.encode(data.toJson());

class Expert {
  Expert({
    String? id,
    List<ServiceId>? serviceId,
    String? fname,
    String? lname,
    String? email,
    num? age,
    String? mobile,
    String? image,
    num? reviewCount,
    num? review,
  }) {
    _id = id;
    _serviceId = serviceId;
    _fname = fname;
    _lname = lname;
    _email = email;
    _age = age;
    _mobile = mobile;
    _image = image;
    _reviewCount = reviewCount;
    _review = review;
  }

  Expert.fromJson(dynamic json) {
    _id = json['_id'];
    if (json['serviceId'] != null) {
      _serviceId = [];
      json['serviceId'].forEach((v) {
        _serviceId?.add(ServiceId.fromJson(v));
      });
    }
    _fname = json['fname'];
    _lname = json['lname'];
    _email = json['email'];
    _age = json['age'];
    _mobile = json['mobile'];
    _image = json['image'];
    _reviewCount = json['reviewCount'];
    _review = json['review'];
  }
  String? _id;
  List<ServiceId>? _serviceId;
  String? _fname;
  String? _lname;
  String? _email;
  num? _age;
  String? _mobile;
  String? _image;
  num? _reviewCount;
  num? _review;
  Expert copyWith({
    String? id,
    List<ServiceId>? serviceId,
    String? fname,
    String? lname,
    String? email,
    num? age,
    String? mobile,
    String? image,
    num? reviewCount,
    num? review,
  }) =>
      Expert(
        id: id ?? _id,
        serviceId: serviceId ?? _serviceId,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        email: email ?? _email,
        age: age ?? _age,
        mobile: mobile ?? _mobile,
        image: image ?? _image,
        reviewCount: reviewCount ?? _reviewCount,
        review: review ?? _review,
      );
  String? get id => _id;
  List<ServiceId>? get serviceId => _serviceId;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get email => _email;
  num? get age => _age;
  String? get mobile => _mobile;
  String? get image => _image;
  num? get reviewCount => _reviewCount;
  num? get review => _review;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    if (_serviceId != null) {
      map['serviceId'] = _serviceId?.map((v) => v.toJson()).toList();
    }
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['email'] = _email;
    map['age'] = _age;
    map['mobile'] = _mobile;
    map['image'] = _image;
    map['reviewCount'] = _reviewCount;
    map['review'] = _review;
    return map;
  }
}

ServiceId serviceIdFromJson(String str) => ServiceId.fromJson(json.decode(str));
String serviceIdToJson(ServiceId data) => json.encode(data.toJson());

class ServiceId {
  ServiceId({
    String? id,
    String? name,
  }) {
    _id = id;
    _name = name;
  }

  ServiceId.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
  }
  String? _id;
  String? _name;
  ServiceId copyWith({
    String? id,
    String? name,
  }) =>
      ServiceId(
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

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? id,
    num? rating,
    String? bookingId,
    UserId? userId,
    String? salonId,
    String? expertId,
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

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _rating = json['rating'];
    _bookingId = json['bookingId'];
    _userId = json['userId'] != null ? UserId.fromJson(json['userId']) : null;
    _salonId = json['salonId'];
    _expertId = json['expertId'];
    _review = json['review'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  num? _rating;
  String? _bookingId;
  UserId? _userId;
  String? _salonId;
  String? _expertId;
  String? _review;
  String? _createdAt;
  String? _updatedAt;
  Data copyWith({
    String? id,
    num? rating,
    String? bookingId,
    UserId? userId,
    String? salonId,
    String? expertId,
    String? review,
    String? createdAt,
    String? updatedAt,
  }) =>
      Data(
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
  String? get bookingId => _bookingId;
  UserId? get userId => _userId;
  String? get salonId => _salonId;
  String? get expertId => _expertId;
  String? get review => _review;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['rating'] = _rating;
    map['bookingId'] = _bookingId;
    if (_userId != null) {
      map['userId'] = _userId?.toJson();
    }
    map['salonId'] = _salonId;
    map['expertId'] = _expertId;
    map['review'] = _review;
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
