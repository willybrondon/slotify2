import 'dart:convert';

SalonRegistrationModel salonRegistrationModelFromJson(String str) => SalonRegistrationModel.fromJson(json.decode(str));
String salonRegistrationModelToJson(SalonRegistrationModel data) => json.encode(data.toJson());

class SalonRegistrationModel {
  SalonRegistrationModel({
    bool? status,
    String? message,
    Data? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  SalonRegistrationModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _data = json['data'] != null ? Data.fromJson(json['data']) : null;
  }
  bool? _status;
  String? _message;
  Data? _data;
  SalonRegistrationModel copyWith({
    bool? status,
    String? message,
    Data? data,
  }) =>
      SalonRegistrationModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  Data? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.toJson();
    }
    return map;
  }
}

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? name,
    String? email,
    String? address,
    LocationCoordinates? locationCoordinates,
    String? mobile,
    String? about,
    num? expertCount,
    String? image,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) {
    _name = name;
    _email = email;
    _address = address;
    _locationCoordinates = locationCoordinates;
    _mobile = mobile;
    _about = about;
    _expertCount = expertCount;
    _image = image;
    _id = id;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Data.fromJson(dynamic json) {
    _name = json['name'];
    _email = json['email'];
    _address = json['address'];
    _locationCoordinates = json['locationCoordinates'] != null ? LocationCoordinates.fromJson(json['locationCoordinates']) : null;
    _mobile = json['mobile'];
    _about = json['about'];
    _expertCount = json['expertCount'];
    _image = json['image'];
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _name;
  String? _email;
  String? _address;
  LocationCoordinates? _locationCoordinates;
  String? _mobile;
  String? _about;
  num? _expertCount;
  String? _image;
  String? _id;
  String? _createdAt;
  String? _updatedAt;
  Data copyWith({
    String? name,
    String? email,
    String? address,
    LocationCoordinates? locationCoordinates,
    String? mobile,
    String? about,
    num? expertCount,
    String? image,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) =>
      Data(
        name: name ?? _name,
        email: email ?? _email,
        address: address ?? _address,
        locationCoordinates: locationCoordinates ?? _locationCoordinates,
        mobile: mobile ?? _mobile,
        about: about ?? _about,
        expertCount: expertCount ?? _expertCount,
        image: image ?? _image,
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get name => _name;
  String? get email => _email;
  String? get address => _address;
  LocationCoordinates? get locationCoordinates => _locationCoordinates;
  String? get mobile => _mobile;
  String? get about => _about;
  num? get expertCount => _expertCount;
  String? get image => _image;
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['name'] = _name;
    map['email'] = _email;
    map['address'] = _address;
    if (_locationCoordinates != null) {
      map['locationCoordinates'] = _locationCoordinates?.toJson();
    }
    map['mobile'] = _mobile;
    map['about'] = _about;
    map['expertCount'] = _expertCount;
    map['image'] = _image;
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

LocationCoordinates locationCoordinatesFromJson(String str) => LocationCoordinates.fromJson(json.decode(str));
String locationCoordinatesToJson(LocationCoordinates data) => json.encode(data.toJson());

class LocationCoordinates {
  LocationCoordinates({
    String? latitude,
    String? longitude,
  }) {
    _latitude = latitude;
    _longitude = longitude;
  }

  LocationCoordinates.fromJson(dynamic json) {
    _latitude = json['latitude'];
    _longitude = json['longitude'];
  }
  String? _latitude;
  String? _longitude;
  LocationCoordinates copyWith({
    String? latitude,
    String? longitude,
  }) =>
      LocationCoordinates(
        latitude: latitude ?? _latitude,
        longitude: longitude ?? _longitude,
      );
  String? get latitude => _latitude;
  String? get longitude => _longitude;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['latitude'] = _latitude;
    map['longitude'] = _longitude;
    return map;
  }
}
