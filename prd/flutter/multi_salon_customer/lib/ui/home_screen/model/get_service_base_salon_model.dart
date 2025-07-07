import 'dart:convert';

GetServiceBaseSalonModel getServiceBaseSalonModelFromJson(String str) =>
    GetServiceBaseSalonModel.fromJson(json.decode(str));
String getServiceBaseSalonModelToJson(GetServiceBaseSalonModel data) => json.encode(data.toJson());

class GetServiceBaseSalonModel {
  GetServiceBaseSalonModel({
    bool? status,
    List<Data>? data,
  }) {
    _status = status;
    _data = data;
  }

  GetServiceBaseSalonModel.fromJson(dynamic json) {
    _status = json['status'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
  }
  bool? _status;
  List<Data>? _data;
  GetServiceBaseSalonModel copyWith({
    bool? status,
    List<Data>? data,
  }) =>
      GetServiceBaseSalonModel(
        status: status ?? _status,
        data: data ?? _data,
      );
  bool? get status => _status;
  List<Data>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? id,
    String? name,
    AddressDetails? addressDetails,
    String? image,
    String? mobile,
    num? rating,
    num? ratingCount,
    num? distance,
  }) {
    _id = id;
    _name = name;
    _addressDetails = addressDetails;
    _image = image;
    _mobile = mobile;
    _rating = rating;
    _ratingCount = ratingCount;
    _distance = distance;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _addressDetails = json['addressDetails'] != null ? AddressDetails.fromJson(json['addressDetails']) : null;
    _image = json['image'];
    _mobile = json['mobile'];
    _rating = json['rating'];
    _ratingCount = json['ratingCount'];
    _distance = json['distance'];
  }
  String? _id;
  String? _name;
  AddressDetails? _addressDetails;
  String? _image;
  String? _mobile;
  num? _rating;
  num? _ratingCount;
  num? _distance;
  Data copyWith({
    String? id,
    String? name,
    AddressDetails? addressDetails,
    String? image,
    String? mobile,
    num? rating,
    num? ratingCount,
    num? distance,
  }) =>
      Data(
        id: id ?? _id,
        name: name ?? _name,
        addressDetails: addressDetails ?? _addressDetails,
        image: image ?? _image,
        mobile: mobile ?? _mobile,
        rating: rating ?? _rating,
        ratingCount: ratingCount ?? _ratingCount,
        distance: distance ?? _distance,
      );
  String? get id => _id;
  String? get name => _name;
  AddressDetails? get addressDetails => _addressDetails;
  String? get image => _image;
  String? get mobile => _mobile;
  num? get rating => _rating;
  num? get ratingCount => _ratingCount;
  num? get distance => _distance;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    if (_addressDetails != null) {
      map['addressDetails'] = _addressDetails?.toJson();
    }
    map['image'] = _image;
    map['mobile'] = _mobile;
    map['rating'] = _rating;
    map['ratingCount'] = _ratingCount;
    map['distance'] = _distance;
    return map;
  }
}

AddressDetails addressDetailsFromJson(String str) => AddressDetails.fromJson(json.decode(str));
String addressDetailsToJson(AddressDetails data) => json.encode(data.toJson());

class AddressDetails {
  AddressDetails({
    String? addressLine1,
    String? landMark,
    String? city,
    String? state,
    String? country,
  }) {
    _addressLine1 = addressLine1;
    _landMark = landMark;
    _city = city;
    _state = state;
    _country = country;
  }

  AddressDetails.fromJson(dynamic json) {
    _addressLine1 = json['addressLine1'];
    _landMark = json['landMark'];
    _city = json['city'];
    _state = json['state'];
    _country = json['country'];
  }
  String? _addressLine1;
  String? _landMark;
  String? _city;
  String? _state;
  String? _country;
  AddressDetails copyWith({
    String? addressLine1,
    String? landMark,
    String? city,
    String? state,
    String? country,
  }) =>
      AddressDetails(
        addressLine1: addressLine1 ?? _addressLine1,
        landMark: landMark ?? _landMark,
        city: city ?? _city,
        state: state ?? _state,
        country: country ?? _country,
      );
  String? get addressLine1 => _addressLine1;
  String? get landMark => _landMark;
  String? get city => _city;
  String? get state => _state;
  String? get country => _country;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['addressLine1'] = _addressLine1;
    map['landMark'] = _landMark;
    map['city'] = _city;
    map['state'] = _state;
    map['country'] = _country;
    return map;
  }
}
