import 'dart:convert';

GetAllServiceModel getAllServiceModelFromJson(String str) => GetAllServiceModel.fromJson(json.decode(str));
String getAllServiceModelToJson(GetAllServiceModel data) => json.encode(data.toJson());

class GetAllServiceModel {
  GetAllServiceModel({
    bool? status,
    String? message,
    num? total,
    List<Services>? services,
    Tax? tax,
  }) {
    _status = status;
    _message = message;
    _total = total;
    _services = services;
    _tax = tax;
  }

  GetAllServiceModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _total = json['total'];
    if (json['services'] != null) {
      _services = [];
      json['services'].forEach((v) {
        _services?.add(Services.fromJson(v));
      });
    }
    _tax = json['tax'] != null ? Tax.fromJson(json['tax']) : null;
  }
  bool? _status;
  String? _message;
  num? _total;
  List<Services>? _services;
  Tax? _tax;
  GetAllServiceModel copyWith({
    bool? status,
    String? message,
    num? total,
    List<Services>? services,
    Tax? tax,
  }) =>
      GetAllServiceModel(
        status: status ?? _status,
        message: message ?? _message,
        total: total ?? _total,
        services: services ?? _services,
        tax: tax ?? _tax,
      );
  bool? get status => _status;
  String? get message => _message;
  num? get total => _total;
  List<Services>? get services => _services;
  Tax? get tax => _tax;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['total'] = _total;
    if (_services != null) {
      map['services'] = _services?.map((v) => v.toJson()).toList();
    }
    if (_tax != null) {
      map['tax'] = _tax?.toJson();
    }
    return map;
  }
}

Tax taxFromJson(String str) => Tax.fromJson(json.decode(str));
String taxToJson(Tax data) => json.encode(data.toJson());

class Tax {
  Tax({
    String? id,
    num? tax,
  }) {
    _id = id;
    _tax = tax;
  }

  Tax.fromJson(dynamic json) {
    _id = json['_id'];
    _tax = json['tax'];
  }
  String? _id;
  num? _tax;
  Tax copyWith({
    String? id,
    num? tax,
  }) =>
      Tax(
        id: id ?? _id,
        tax: tax ?? _tax,
      );
  String? get id => _id;
  num? get tax => _tax;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['tax'] = _tax;
    return map;
  }
}

Services servicesFromJson(String str) => Services.fromJson(json.decode(str));
String servicesToJson(Services data) => json.encode(data.toJson());

class Services {
  Services({
    String? id,
    bool? status,
    String? name,
    int? duration,
    String? image,
    String? createdAt,
    String? categoryId,
    String? categoryname,
  }) {
    _id = id;
    _status = status;
    _name = name;
    _duration = duration;
    _image = image;
    _createdAt = createdAt;
    _categoryId = categoryId;
    _categoryname = categoryname;
  }

  Services.fromJson(dynamic json) {
    _id = json['_id'];
    _status = json['status'];
    _name = json['name'];
    _duration = json['duration'];
    _image = json['image'];
    _createdAt = json['createdAt'];
    _categoryId = json['categoryId'];
    _categoryname = json['categoryname'];
  }
  String? _id;
  bool? _status;
  String? _name;
  int? _duration;
  String? _image;
  String? _createdAt;
  String? _categoryId;
  String? _categoryname;
  Services copyWith({
    String? id,
    bool? status,
    String? name,
    int? duration,
    String? image,
    String? createdAt,
    String? categoryId,
    String? categoryname,
  }) =>
      Services(
        id: id ?? _id,
        status: status ?? _status,
        name: name ?? _name,
        duration: duration ?? _duration,
        image: image ?? _image,
        createdAt: createdAt ?? _createdAt,
        categoryId: categoryId ?? _categoryId,
        categoryname: categoryname ?? _categoryname,
      );
  String? get id => _id;
  bool? get status => _status;
  String? get name => _name;
  int? get duration => _duration;
  String? get image => _image;
  String? get createdAt => _createdAt;
  String? get categoryId => _categoryId;
  String? get categoryname => _categoryname;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['status'] = _status;
    map['name'] = _name;
    map['duration'] = _duration;
    map['image'] = _image;
    map['createdAt'] = _createdAt;
    map['categoryId'] = _categoryId;
    map['categoryname'] = _categoryname;
    return map;
  }
}
