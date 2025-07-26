import 'dart:convert';

ProfileModel profileModelFromJson(String str) => ProfileModel.fromJson(json.decode(str));
String profileModelToJson(ProfileModel data) => json.encode(data.toJson());

class ProfileModel {
  ProfileModel({
    bool? status,
    String? message,
    User? user,
  }) {
    _status = status;
    _message = message;
    _user = user;
  }

  ProfileModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _user = json['user'] != null ? User.fromJson(json['user']) : null;
  }
  bool? _status;
  String? _message;
  User? _user;
  ProfileModel copyWith({
    bool? status,
    String? message,
    User? user,
  }) =>
      ProfileModel(
        status: status ?? _status,
        message: message ?? _message,
        user: user ?? _user,
      );
  bool? get status => _status;
  String? get message => _message;
  User? get user => _user;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_user != null) {
      map['user'] = _user?.toJson();
    }
    return map;
  }
}

User userFromJson(String str) => User.fromJson(json.decode(str));
String userToJson(User data) => json.encode(data.toJson());

class User {
  User({
    String? id,
    num? uniqueId,
    String? fname,
    String? lname,
    String? image,
    String? email,
    String? mobile,
    int? age,
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    String? fcmToken,
    bool? isDelete,
    bool? isUpdate,
    String? latitude,
    String? longitude,
    bool? salonRequestSent,
    num? amount,
    num? loginType,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _uniqueId = uniqueId;
    _fname = fname;
    _lname = lname;
    _image = image;
    _email = email;
    _mobile = mobile;
    _age = age;
    _gender = gender;
    _analyticDate = analyticDate;
    _isBlock = isBlock;
    _bio = bio;
    _fcmToken = fcmToken;
    _isDelete = isDelete;
    _isUpdate = isUpdate;
    _latitude = latitude;
    _longitude = longitude;
    _salonRequestSent = salonRequestSent;
    _amount = amount;
    _loginType = loginType;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  User.fromJson(dynamic json) {
    _id = json['_id'];
    _uniqueId = json['uniqueId'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
    _email = json['email'];
    _mobile = json['mobile'];
    _age = json['age'];
    _gender = json['gender'];
    _analyticDate = json['analyticDate'];
    _isBlock = json['isBlock'];
    _bio = json['bio'];
    _fcmToken = json['fcmToken'];
    _isDelete = json['isDelete'];
    _isUpdate = json['isUpdate'];
    _latitude = json['latitude'];
    _longitude = json['longitude'];
    _salonRequestSent = json['salonRequestSent'];
    _amount = json['amount'];
    _loginType = json['loginType'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  num? _uniqueId;
  String? _fname;
  String? _lname;
  String? _image;
  String? _email;
  String? _mobile;
  int? _age;
  String? _gender;
  String? _analyticDate;
  bool? _isBlock;
  String? _bio;
  String? _fcmToken;
  bool? _isDelete;
  bool? _isUpdate;
  String? _latitude;
  String? _longitude;
  bool? _salonRequestSent;
  num? _amount;
  num? _loginType;
  String? _createdAt;
  String? _updatedAt;
  User copyWith({
    String? id,
    num? uniqueId,
    String? fname,
    String? lname,
    String? image,
    String? email,
    String? mobile,
    int? age,
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    String? fcmToken,
    bool? isDelete,
    bool? isUpdate,
    String? latitude,
    String? longitude,
    bool? salonRequestSent,
    num? amount,
    num? loginType,
    String? createdAt,
    String? updatedAt,
  }) =>
      User(
        id: id ?? _id,
        uniqueId: uniqueId ?? _uniqueId,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
        email: email ?? _email,
        mobile: mobile ?? _mobile,
        age: age ?? _age,
        gender: gender ?? _gender,
        analyticDate: analyticDate ?? _analyticDate,
        isBlock: isBlock ?? _isBlock,
        bio: bio ?? _bio,
        fcmToken: fcmToken ?? _fcmToken,
        isDelete: isDelete ?? _isDelete,
        isUpdate: isUpdate ?? _isUpdate,
        latitude: latitude ?? _latitude,
        longitude: longitude ?? _longitude,
        salonRequestSent: salonRequestSent ?? _salonRequestSent,
        amount: amount ?? _amount,
        loginType: loginType ?? _loginType,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  num? get uniqueId => _uniqueId;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;
  String? get email => _email;
  String? get mobile => _mobile;
  int? get age => _age;
  String? get gender => _gender;
  String? get analyticDate => _analyticDate;
  bool? get isBlock => _isBlock;
  String? get bio => _bio;
  String? get fcmToken => _fcmToken;
  bool? get isDelete => _isDelete;
  bool? get isUpdate => _isUpdate;
  String? get latitude => _latitude;
  String? get longitude => _longitude;
  bool? get salonRequestSent => _salonRequestSent;
  num? get amount => _amount;
  num? get loginType => _loginType;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['uniqueId'] = _uniqueId;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    map['email'] = _email;
    map['mobile'] = _mobile;
    map['age'] = _age;
    map['gender'] = _gender;
    map['analyticDate'] = _analyticDate;
    map['isBlock'] = _isBlock;
    map['bio'] = _bio;
    map['fcmToken'] = _fcmToken;
    map['isDelete'] = _isDelete;
    map['isUpdate'] = _isUpdate;
    map['latitude'] = _latitude;
    map['longitude'] = _longitude;
    map['salonRequestSent'] = _salonRequestSent;
    map['amount'] = _amount;
    map['loginType'] = _loginType;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
