import 'dart:convert';

GetProfileModel getProfileModelFromJson(String str) => GetProfileModel.fromJson(json.decode(str));
String getProfileModelToJson(GetProfileModel data) => json.encode(data.toJson());

class GetProfileModel {
  GetProfileModel({
    bool? status,
    String? message,
    num? tax,
    Data? data,
  }) {
    _status = status;
    _message = message;
    _tax = tax;
    _data = data;
  }

  GetProfileModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _tax = json['tax'];
    _data = json['data'] != null ? Data.fromJson(json['data']) : null;
  }
  bool? _status;
  String? _message;
  num? _tax;
  Data? _data;
  GetProfileModel copyWith({
    bool? status,
    String? message,
    num? tax,
    Data? data,
  }) =>
      GetProfileModel(
        status: status ?? _status,
        message: message ?? _message,
        tax: tax ?? _tax,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  num? get tax => _tax;
  Data? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['tax'] = _tax;
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
    String? id,
    String? fname,
    String? lname,
    String? email,
    String? image,
    String? mobile,
    String? fcmToken,
    bool? isAttend,
    bool? showDialog,
    num? uniqueId,
    SalonId? salonId,
    List<ServiceId>? serviceId,
    num? earning,
    num? bookingCount,
    num? totalBookingCount,
    num? review,
    num? reviewCount,
    num? age,
    String? gender,
    num? commission,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _email = email;
    _image = image;
    _mobile = mobile;
    _fcmToken = fcmToken;
    _isAttend = isAttend;
    _showDialog = showDialog;
    _uniqueId = uniqueId;
    _salonId = salonId;
    _serviceId = serviceId;
    _earning = earning;
    _bookingCount = bookingCount;
    _totalBookingCount = totalBookingCount;
    _review = review;
    _reviewCount = reviewCount;
    _age = age;
    _gender = gender;
    _commission = commission;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _email = json['email'];
    _image = json['image'];
    _mobile = json['mobile'];
    _fcmToken = json['fcmToken'];
    _isAttend = json['isAttend'];
    _showDialog = json['showDialog'];
    _uniqueId = json['uniqueId'];
    _salonId = json['salonId'] != null ? SalonId.fromJson(json['salonId']) : null;
    if (json['serviceId'] != null) {
      _serviceId = [];
      json['serviceId'].forEach((v) {
        _serviceId?.add(ServiceId.fromJson(v));
      });
    }
    _earning = json['earning'];
    _bookingCount = json['bookingCount'];
    _totalBookingCount = json['totalBookingCount'];
    _review = json['review'];
    _reviewCount = json['reviewCount'];
    _age = json['age'];
    _gender = json['gender'];
    _commission = json['commission'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _email;
  String? _image;
  String? _mobile;
  String? _fcmToken;
  bool? _isAttend;
  bool? _showDialog;
  num? _uniqueId;
  SalonId? _salonId;
  List<ServiceId>? _serviceId;
  num? _earning;
  num? _bookingCount;
  num? _totalBookingCount;
  num? _review;
  num? _reviewCount;
  num? _age;
  String? _gender;
  num? _commission;
  String? _createdAt;
  String? _updatedAt;
  Data copyWith({
    String? id,
    String? fname,
    String? lname,
    String? email,
    String? image,
    String? mobile,
    String? fcmToken,
    bool? isAttend,
    bool? showDialog,
    num? uniqueId,
    SalonId? salonId,
    List<ServiceId>? serviceId,
    num? earning,
    num? bookingCount,
    num? totalBookingCount,
    num? review,
    num? reviewCount,
    num? age,
    String? gender,
    num? commission,
    String? createdAt,
    String? updatedAt,
  }) =>
      Data(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        email: email ?? _email,
        image: image ?? _image,
        mobile: mobile ?? _mobile,
        fcmToken: fcmToken ?? _fcmToken,
        isAttend: isAttend ?? _isAttend,
        showDialog: showDialog ?? _showDialog,
        uniqueId: uniqueId ?? _uniqueId,
        salonId: salonId ?? _salonId,
        serviceId: serviceId ?? _serviceId,
        earning: earning ?? _earning,
        bookingCount: bookingCount ?? _bookingCount,
        totalBookingCount: totalBookingCount ?? _totalBookingCount,
        review: review ?? _review,
        reviewCount: reviewCount ?? _reviewCount,
        age: age ?? _age,
        gender: gender ?? _gender,
        commission: commission ?? _commission,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get email => _email;
  String? get image => _image;
  String? get mobile => _mobile;
  String? get fcmToken => _fcmToken;
  bool? get isAttend => _isAttend;
  bool? get showDialog => _showDialog;
  num? get uniqueId => _uniqueId;
  SalonId? get salonId => _salonId;
  List<ServiceId>? get serviceId => _serviceId;
  num? get earning => _earning;
  num? get bookingCount => _bookingCount;
  num? get totalBookingCount => _totalBookingCount;
  num? get review => _review;
  num? get reviewCount => _reviewCount;
  num? get age => _age;
  String? get gender => _gender;
  num? get commission => _commission;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['email'] = _email;
    map['image'] = _image;
    map['mobile'] = _mobile;
    map['fcmToken'] = _fcmToken;
    map['isAttend'] = _isAttend;
    map['showDialog'] = _showDialog;
    map['uniqueId'] = _uniqueId;
    if (_salonId != null) {
      map['salonId'] = _salonId?.toJson();
    }
    if (_serviceId != null) {
      map['serviceId'] = _serviceId?.map((v) => v.toJson()).toList();
    }
    map['earning'] = _earning;
    map['bookingCount'] = _bookingCount;
    map['totalBookingCount'] = _totalBookingCount;
    map['review'] = _review;
    map['reviewCount'] = _reviewCount;
    map['age'] = _age;
    map['gender'] = _gender;
    map['commission'] = _commission;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

ServiceId serviceIdFromJson(String str) => ServiceId.fromJson(json.decode(str));
String serviceIdToJson(ServiceId data) => json.encode(data.toJson());

class ServiceId {
  ServiceId({
    String? id,
    bool? status,
    bool? isDelete,
    String? name,
    num? duration,
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

  ServiceId.fromJson(dynamic json) {
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
  num? _duration;
  String? _categoryId;
  String? _image;
  String? _createdAt;
  String? _updatedAt;
  ServiceId copyWith({
    String? id,
    bool? status,
    bool? isDelete,
    String? name,
    num? duration,
    String? categoryId,
    String? image,
    String? createdAt,
    String? updatedAt,
  }) =>
      ServiceId(
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
  num? get duration => _duration;
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

SalonId salonIdFromJson(String str) => SalonId.fromJson(json.decode(str));
String salonIdToJson(SalonId data) => json.encode(data.toJson());

class SalonId {
  SalonId({
    AddressDetails? addressDetails,
    String? id,
    String? name,
  }) {
    _addressDetails = addressDetails;
    _id = id;
    _name = name;
  }

  SalonId.fromJson(dynamic json) {
    _addressDetails = json['addressDetails'] != null ? AddressDetails.fromJson(json['addressDetails']) : null;
    _id = json['_id'];
    _name = json['name'];
  }
  AddressDetails? _addressDetails;
  String? _id;
  String? _name;
  SalonId copyWith({
    AddressDetails? addressDetails,
    String? id,
    String? name,
  }) =>
      SalonId(
        addressDetails: addressDetails ?? _addressDetails,
        id: id ?? _id,
        name: name ?? _name,
      );
  AddressDetails? get addressDetails => _addressDetails;
  String? get id => _id;
  String? get name => _name;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_addressDetails != null) {
      map['addressDetails'] = _addressDetails?.toJson();
    }
    map['_id'] = _id;
    map['name'] = _name;
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
