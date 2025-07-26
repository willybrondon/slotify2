import 'dart:convert';

ResetPasswordModel resetPasswordModelFromJson(String str) => ResetPasswordModel.fromJson(json.decode(str));
String resetPasswordModelToJson(ResetPasswordModel data) => json.encode(data.toJson());

class ResetPasswordModel {
  ResetPasswordModel({
    bool? status,
    String? message,
    User? user,
  }) {
    _status = status;
    _message = message;
    _user = user;
  }

  ResetPasswordModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _user = json['user'] != null ? User.fromJson(json['user']) : null;
  }
  bool? _status;
  String? _message;
  User? _user;
  ResetPasswordModel copyWith({
    bool? status,
    String? message,
    User? user,
  }) =>
      ResetPasswordModel(
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
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    String? fcmToken,
    bool? isDelete,
    bool? isUpdate,
    String? latitude,
    String? longitude,
    String? password,
    num? loginType,
    num? age,
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
    _gender = gender;
    _analyticDate = analyticDate;
    _isBlock = isBlock;
    _bio = bio;
    _fcmToken = fcmToken;
    _isDelete = isDelete;
    _isUpdate = isUpdate;
    _latitude = latitude;
    _longitude = longitude;
    _password = password;
    _loginType = loginType;
    _age = age;
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
    _gender = json['gender'];
    _analyticDate = json['analyticDate'];
    _isBlock = json['isBlock'];
    _bio = json['bio'];
    _fcmToken = json['fcmToken'];
    _isDelete = json['isDelete'];
    _isUpdate = json['isUpdate'];
    _latitude = json['latitude'];
    _longitude = json['longitude'];
    _password = json['password'];
    _loginType = json['loginType'];
    _age = json['age'];
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
  String? _gender;
  String? _analyticDate;
  bool? _isBlock;
  String? _bio;
  String? _fcmToken;
  bool? _isDelete;
  bool? _isUpdate;
  String? _latitude;
  String? _longitude;
  String? _password;
  num? _loginType;
  num? _age;
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
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    String? fcmToken,
    bool? isDelete,
    bool? isUpdate,
    String? latitude,
    String? longitude,
    String? password,
    num? loginType,
    num? age,
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
        gender: gender ?? _gender,
        analyticDate: analyticDate ?? _analyticDate,
        isBlock: isBlock ?? _isBlock,
        bio: bio ?? _bio,
        fcmToken: fcmToken ?? _fcmToken,
        isDelete: isDelete ?? _isDelete,
        isUpdate: isUpdate ?? _isUpdate,
        latitude: latitude ?? _latitude,
        longitude: longitude ?? _longitude,
        password: password ?? _password,
        loginType: loginType ?? _loginType,
        age: age ?? _age,
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
  String? get gender => _gender;
  String? get analyticDate => _analyticDate;
  bool? get isBlock => _isBlock;
  String? get bio => _bio;
  String? get fcmToken => _fcmToken;
  bool? get isDelete => _isDelete;
  bool? get isUpdate => _isUpdate;
  String? get latitude => _latitude;
  String? get longitude => _longitude;
  String? get password => _password;
  num? get loginType => _loginType;
  num? get age => _age;
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
    map['gender'] = _gender;
    map['analyticDate'] = _analyticDate;
    map['isBlock'] = _isBlock;
    map['bio'] = _bio;
    map['fcmToken'] = _fcmToken;
    map['isDelete'] = _isDelete;
    map['isUpdate'] = _isUpdate;
    map['latitude'] = _latitude;
    map['longitude'] = _longitude;
    map['password'] = _password;
    map['loginType'] = _loginType;
    map['age'] = _age;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
