import 'dart:convert';

UpdateUserModel updateUserModelFromJson(String str) =>
    UpdateUserModel.fromJson(json.decode(str));

String updateUserModelToJson(UpdateUserModel data) =>
    json.encode(data.toJson());

class UpdateUserModel {
  UpdateUserModel({
    bool? status,
    String? message,
    User? user,
  }) {
    _status = status;
    _message = message;
    _user = user;
  }

  UpdateUserModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _user = json['user'] != null ? User.fromJson(json['user']) : null;
  }

  bool? _status;
  String? _message;
  User? _user;

  UpdateUserModel copyWith({
    bool? status,
    String? message,
    User? user,
  }) =>
      UpdateUserModel(
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
    int? uniqueId,
    dynamic age,
    String? mobile,
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    dynamic fcmToken,
    int? loginType,
    String? createdAt,
    String? updatedAt,
    String? fname,
    String? lname,
    String? email,
  }) {
    _id = id;
    _uniqueId = uniqueId;
    _age = age;
    _mobile = mobile;
    _gender = gender;
    _analyticDate = analyticDate;
    _isBlock = isBlock;
    _bio = bio;
    _fcmToken = fcmToken;
    _loginType = loginType;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _fname = fname;
    _lname = lname;
    _email = email;
  }

  User.fromJson(dynamic json) {
    _id = json['_id'];
    _uniqueId = json['uniqueId'];
    _age = json['age'];
    _mobile = json['mobile'];
    _gender = json['gender'];
    _analyticDate = json['analyticDate'];
    _isBlock = json['isBlock'];
    _bio = json['bio'];
    _fcmToken = json['fcmToken'];
    _loginType = json['loginType'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _fname = json['fname'];
    _lname = json['lname'];
    _email = json['email'];
  }

  String? _id;
  int? _uniqueId;
  dynamic _age;
  String? _mobile;
  String? _gender;
  String? _analyticDate;
  bool? _isBlock;
  String? _bio;
  dynamic _fcmToken;
  int? _loginType;
  String? _createdAt;
  String? _updatedAt;
  String? _fname;
  String? _lname;
  String? _email;

  User copyWith({
    String? id,
    int? uniqueId,
    dynamic age,
    String? mobile,
    String? gender,
    String? analyticDate,
    bool? isBlock,
    String? bio,
    dynamic fcmToken,
    int? loginType,
    String? createdAt,
    String? updatedAt,
    String? fname,
    String? lname,
    String? email,
  }) =>
      User(
        id: id ?? _id,
        uniqueId: uniqueId ?? _uniqueId,
        age: age ?? _age,
        mobile: mobile ?? _mobile,
        gender: gender ?? _gender,
        analyticDate: analyticDate ?? _analyticDate,
        isBlock: isBlock ?? _isBlock,
        bio: bio ?? _bio,
        fcmToken: fcmToken ?? _fcmToken,
        loginType: loginType ?? _loginType,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        email: email ?? _email,
      );

  String? get id => _id;

  int? get uniqueId => _uniqueId;

  dynamic get age => _age;

  String? get mobile => _mobile;

  String? get gender => _gender;

  String? get analyticDate => _analyticDate;

  bool? get isBlock => _isBlock;

  String? get bio => _bio;

  dynamic get fcmToken => _fcmToken;

  int? get loginType => _loginType;

  String? get createdAt => _createdAt;

  String? get updatedAt => _updatedAt;

  String? get fname => _fname;

  String? get lname => _lname;

  String? get email => _email;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['uniqueId'] = _uniqueId;
    map['age'] = _age;
    map['mobile'] = _mobile;
    map['gender'] = _gender;
    map['analyticDate'] = _analyticDate;
    map['isBlock'] = _isBlock;
    map['bio'] = _bio;
    map['fcmToken'] = _fcmToken;
    map['loginType'] = _loginType;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['email'] = _email;
    return map;
  }
}
