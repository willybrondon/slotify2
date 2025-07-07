import 'dart:convert';

GetServiceModel getServiceModelFromJson(String str) => GetServiceModel.fromJson(json.decode(str));
String getServiceModelToJson(GetServiceModel data) => json.encode(data.toJson());

class GetServiceModel {
  GetServiceModel({
    bool? status,
    String? message,
    List<Services>? services,
    num? tax,
  }) {
    _status = status;
    _message = message;
    _services = services;
    _tax = tax;
  }

  GetServiceModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['services'] != null) {
      _services = [];
      json['services'].forEach((v) {
        _services?.add(Services.fromJson(v));
      });
    }
    _tax = json['tax'];
  }
  bool? _status;
  String? _message;
  List<Services>? _services;
  num? _tax;
  GetServiceModel copyWith({
    bool? status,
    String? message,
    List<Services>? services,
    num? tax,
  }) =>
      GetServiceModel(
        status: status ?? _status,
        message: message ?? _message,
        services: services ?? _services,
        tax: tax ?? _tax,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Services>? get services => _services;
  num? get tax => _tax;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_services != null) {
      map['services'] = _services?.map((v) => v.toJson()).toList();
    }
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
    bool? isDelete,
    String? name,
    int? duration,
    String? categoryId,
    String? image,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _status = status;
    _isDelete = isDelete;
    _name = name;
    _duration = duration;
    _categoryId = categoryId;
    _image = image;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Services.fromJson(dynamic json) {
    _id = json['_id'];
    _status = json['status'];
    _isDelete = json['isDelete'];
    _name = json['name'];
    _duration = json['duration'];
    _categoryId = json['categoryId'];
    _image = json['image'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  bool? _status;
  bool? _isDelete;
  String? _name;
  int? _duration;
  String? _categoryId;
  String? _image;
  String? _createdAt;
  String? _updatedAt;
  Services copyWith({
    String? id,
    bool? status,
    bool? isDelete,
    String? name,
    int? duration,
    String? categoryId,
    String? image,
    String? createdAt,
    String? updatedAt,
  }) =>
      Services(
        id: id ?? _id,
        status: status ?? _status,
        isDelete: isDelete ?? _isDelete,
        name: name ?? _name,
        duration: duration ?? _duration,
        categoryId: categoryId ?? _categoryId,
        image: image ?? _image,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  bool? get status => _status;
  bool? get isDelete => _isDelete;
  String? get name => _name;
  int? get duration => _duration;
  String? get categoryId => _categoryId;
  String? get image => _image;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['status'] = _status;
    map['isDelete'] = _isDelete;
    map['name'] = _name;
    map['duration'] = _duration;
    map['categoryId'] = _categoryId;
    map['image'] = _image;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
