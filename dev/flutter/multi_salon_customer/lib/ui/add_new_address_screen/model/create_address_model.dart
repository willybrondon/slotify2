import 'dart:convert';

CreateAddressModel createAddressModelFromJson(String str) => CreateAddressModel.fromJson(json.decode(str));
String createAddressModelToJson(CreateAddressModel data) => json.encode(data.toJson());

class CreateAddressModel {
  CreateAddressModel({
    bool? status,
    String? message,
    Address? address,
  }) {
    _status = status;
    _message = message;
    _address = address;
  }

  CreateAddressModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _address = json['address'] != null ? Address.fromJson(json['address']) : null;
  }
  bool? _status;
  String? _message;
  Address? _address;
  CreateAddressModel copyWith({
    bool? status,
    String? message,
    Address? address,
  }) =>
      CreateAddressModel(
        status: status ?? _status,
        message: message ?? _message,
        address: address ?? _address,
      );
  bool? get status => _status;
  String? get message => _message;
  Address? get address => _address;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_address != null) {
      map['address'] = _address?.toJson();
    }
    return map;
  }
}

Address addressFromJson(String str) => Address.fromJson(json.decode(str));
String addressToJson(Address data) => json.encode(data.toJson());

class Address {
  Address({
    String? userId,
    String? name,
    String? country,
    String? state,
    String? city,
    num? zipCode,
    String? address,
    bool? isSelect,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) {
    _userId = userId;
    _name = name;
    _country = country;
    _state = state;
    _city = city;
    _zipCode = zipCode;
    _address = address;
    _isSelect = isSelect;
    _id = id;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Address.fromJson(dynamic json) {
    _userId = json['userId'];
    _name = json['name'];
    _country = json['country'];
    _state = json['state'];
    _city = json['city'];
    _zipCode = json['zipCode'];
    _address = json['address'];
    _isSelect = json['isSelect'];
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _userId;
  String? _name;
  String? _country;
  String? _state;
  String? _city;
  num? _zipCode;
  String? _address;
  bool? _isSelect;
  String? _id;
  String? _createdAt;
  String? _updatedAt;
  Address copyWith({
    String? userId,
    String? name,
    String? country,
    String? state,
    String? city,
    num? zipCode,
    String? address,
    bool? isSelect,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) =>
      Address(
        userId: userId ?? _userId,
        name: name ?? _name,
        country: country ?? _country,
        state: state ?? _state,
        city: city ?? _city,
        zipCode: zipCode ?? _zipCode,
        address: address ?? _address,
        isSelect: isSelect ?? _isSelect,
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get userId => _userId;
  String? get name => _name;
  String? get country => _country;
  String? get state => _state;
  String? get city => _city;
  num? get zipCode => _zipCode;
  String? get address => _address;
  bool? get isSelect => _isSelect;
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['userId'] = _userId;
    map['name'] = _name;
    map['country'] = _country;
    map['state'] = _state;
    map['city'] = _city;
    map['zipCode'] = _zipCode;
    map['address'] = _address;
    map['isSelect'] = _isSelect;
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
