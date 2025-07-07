import 'dart:convert';

ServiceWiseExpertModel serviceWiseExpertModelFromJson(String str) =>
    ServiceWiseExpertModel.fromJson(json.decode(str));
String serviceWiseExpertModelToJson(ServiceWiseExpertModel data) => json.encode(data.toJson());

class ServiceWiseExpertModel {
  ServiceWiseExpertModel({
    bool? status,
    String? message,
    List<Experts>? experts,
  }) {
    _status = status;
    _message = message;
    _experts = experts;
  }

  ServiceWiseExpertModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['experts'] != null) {
      _experts = [];
      json['experts'].forEach((v) {
        _experts?.add(Experts.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Experts>? _experts;
  ServiceWiseExpertModel copyWith({
    bool? status,
    String? message,
    List<Experts>? experts,
  }) =>
      ServiceWiseExpertModel(
        status: status ?? _status,
        message: message ?? _message,
        experts: experts ?? _experts,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Experts>? get experts => _experts;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_experts != null) {
      map['experts'] = _experts?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Experts expertsFromJson(String str) => Experts.fromJson(json.decode(str));
String expertsToJson(Experts data) => json.encode(data.toJson());

class Experts {
  Experts({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? averageRating,
    List<ServiceData>? serviceData,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
    _averageRating = averageRating;
    _serviceData = serviceData;
  }

  Experts.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
    _averageRating = json['averageRating'];
    if (json['serviceData'] != null) {
      _serviceData = [];
      json['serviceData'].forEach((v) {
        _serviceData?.add(ServiceData.fromJson(v));
      });
    }
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  num? _averageRating;
  List<ServiceData>? _serviceData;
  Experts copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? averageRating,
    List<ServiceData>? serviceData,
  }) =>
      Experts(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
        averageRating: averageRating ?? _averageRating,
        serviceData: serviceData ?? _serviceData,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;
  num? get averageRating => _averageRating;
  List<ServiceData>? get serviceData => _serviceData;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    map['averageRating'] = _averageRating;
    if (_serviceData != null) {
      map['serviceData'] = _serviceData?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

ServiceData serviceDataFromJson(String str) => ServiceData.fromJson(json.decode(str));
String serviceDataToJson(ServiceData data) => json.encode(data.toJson());

class ServiceData {
  ServiceData({
    String? id,
    String? name,
    int? price,
    String? image,
    int? duration,
    String? categoryId,
    String? subcategoryId,
    String? createdAt,
    String? updatedAt,
    bool? status,
  }) {
    _id = id;
    _name = name;
    _price = price;
    _image = image;
    _duration = duration;
    _categoryId = categoryId;
    _subcategoryId = subcategoryId;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _status = status;
  }

  ServiceData.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _price = json['price'];
    _image = json['image'];
    _duration = json['duration'];
    _categoryId = json['categoryId'];
    _subcategoryId = json['subcategoryId'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _status = json['status'];
  }
  String? _id;
  String? _name;
  int? _price;
  String? _image;
  int? _duration;
  String? _categoryId;
  String? _subcategoryId;
  String? _createdAt;
  String? _updatedAt;
  bool? _status;
  ServiceData copyWith({
    String? id,
    String? name,
    int? price,
    String? image,
    int? duration,
    String? categoryId,
    String? subcategoryId,
    String? createdAt,
    String? updatedAt,
    bool? status,
  }) =>
      ServiceData(
        id: id ?? _id,
        name: name ?? _name,
        price: price ?? _price,
        image: image ?? _image,
        duration: duration ?? _duration,
        categoryId: categoryId ?? _categoryId,
        subcategoryId: subcategoryId ?? _subcategoryId,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        status: status ?? _status,
      );
  String? get id => _id;
  String? get name => _name;
  int? get price => _price;
  String? get image => _image;
  int? get duration => _duration;
  String? get categoryId => _categoryId;
  String? get subcategoryId => _subcategoryId;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  bool? get status => _status;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    map['price'] = _price;
    map['image'] = _image;
    map['duration'] = _duration;
    map['categoryId'] = _categoryId;
    map['subcategoryId'] = _subcategoryId;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['status'] = _status;
    return map;
  }
}
