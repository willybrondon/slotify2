import 'dart:convert';

GetWithdrawMethodModel getWithdrawMethodModelFromJson(String str) => GetWithdrawMethodModel.fromJson(json.decode(str));
String getWithdrawMethodModelToJson(GetWithdrawMethodModel data) => json.encode(data.toJson());

class GetWithdrawMethodModel {
  GetWithdrawMethodModel({
    bool? status,
    String? message,
    List<GetWithdrawMethod>? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  GetWithdrawMethodModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(GetWithdrawMethod.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<GetWithdrawMethod>? _data;
  GetWithdrawMethodModel copyWith({
    bool? status,
    String? message,
    List<GetWithdrawMethod>? data,
  }) =>
      GetWithdrawMethodModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  List<GetWithdrawMethod>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

GetWithdrawMethod dataFromJson(String str) => GetWithdrawMethod.fromJson(json.decode(str));
String dataToJson(GetWithdrawMethod data) => json.encode(data.toJson());

class GetWithdrawMethod {
  GetWithdrawMethod({
    String? id,
    String? name,
    String? image,
    List<String>? details,
    bool? isEnabled,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _name = name;
    _image = image;
    _details = details;
    _isEnabled = isEnabled;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  GetWithdrawMethod.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _image = json['image'];
    _details = json['details'] != null ? json['details'].cast<String>() : [];
    _isEnabled = json['isEnabled'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  String? _name;
  String? _image;
  List<String>? _details;
  bool? _isEnabled;
  String? _createdAt;
  String? _updatedAt;
  GetWithdrawMethod copyWith({
    String? id,
    String? name,
    String? image,
    List<String>? details,
    bool? isEnabled,
    String? createdAt,
    String? updatedAt,
  }) =>
      GetWithdrawMethod(
        id: id ?? _id,
        name: name ?? _name,
        image: image ?? _image,
        details: details ?? _details,
        isEnabled: isEnabled ?? _isEnabled,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  String? get name => _name;
  String? get image => _image;
  List<String>? get details => _details;
  bool? get isEnabled => _isEnabled;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    map['image'] = _image;
    map['details'] = _details;
    map['isEnabled'] = _isEnabled;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
