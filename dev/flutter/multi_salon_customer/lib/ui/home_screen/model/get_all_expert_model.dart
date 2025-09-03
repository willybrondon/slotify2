import 'dart:convert';

GetAllExpertModel getAllExpertModelFromJson(String str) =>
    GetAllExpertModel.fromJson(json.decode(str));
String getAllExpertModelToJson(GetAllExpertModel data) =>
    json.encode(data.toJson());

class GetAllExpertModel {
  GetAllExpertModel({
    bool? status,
    String? message,
    List<Data>? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  GetAllExpertModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Data>? _data;
  GetAllExpertModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
  }) =>
      GetAllExpertModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Data>? get data => _data;

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

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? reviewCount,
    num? review,
    SalonInfo? salonInfo,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
    _reviewCount = reviewCount;
    _review = review;
    _salonInfo = salonInfo;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
    _reviewCount = json['reviewCount'];
    _review = json['review'];
    _salonInfo = json['salonInfo'] != null
        ? SalonInfo.fromJson(json['salonInfo'])
        : null;
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  num? _reviewCount;
  num? _review;
  SalonInfo? _salonInfo;
  Data copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? reviewCount,
    num? review,
    SalonInfo? salonInfo,
  }) =>
      Data(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
        reviewCount: reviewCount ?? _reviewCount,
        review: review ?? _review,
        salonInfo: salonInfo ?? _salonInfo,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;
  num? get reviewCount => _reviewCount;
  num? get review => _review;
  SalonInfo? get salonInfo => _salonInfo;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    map['reviewCount'] = _reviewCount;
    map['review'] = _review;
    if (_salonInfo != null) {
      map['salonInfo'] = _salonInfo?.toJson();
    }
    return map;
  }
}

class SalonInfo {
  SalonInfo({
    String? id,
    String? name,
    AddressDetails? addressDetails,
  }) {
    _id = id;
    _name = name;
    _addressDetails = addressDetails;
  }

  SalonInfo.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _addressDetails = json['addressDetails'] != null
        ? AddressDetails.fromJson(json['addressDetails'])
        : null;
  }
  String? _id;
  String? _name;
  AddressDetails? _addressDetails;

  SalonInfo copyWith({
    String? id,
    String? name,
    AddressDetails? addressDetails,
  }) =>
      SalonInfo(
        id: id ?? _id,
        name: name ?? _name,
        addressDetails: addressDetails ?? _addressDetails,
      );
  String? get id => _id;
  String? get name => _name;
  AddressDetails? get addressDetails => _addressDetails;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    if (_addressDetails != null) {
      map['addressDetails'] = _addressDetails?.toJson();
    }
    return map;
  }
}

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
