import 'dart:convert';
CheckUserModel checkUserModelFromJson(String str) => CheckUserModel.fromJson(json.decode(str));
String checkUserModelToJson(CheckUserModel data) => json.encode(data.toJson());
class CheckUserModel {
  CheckUserModel({
      bool? status, 
      String? message, 
      bool? isLogin,}){
    _status = status;
    _message = message;
    _isLogin = isLogin;
}

  CheckUserModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _isLogin = json['isLogin'];
  }
  bool? _status;
  String? _message;
  bool? _isLogin;
CheckUserModel copyWith({  bool? status,
  String? message,
  bool? isLogin,
}) => CheckUserModel(  status: status ?? _status,
  message: message ?? _message,
  isLogin: isLogin ?? _isLogin,
);
  bool? get status => _status;
  String? get message => _message;
  bool? get isLogin => _isLogin;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['isLogin'] = _isLogin;
    return map;
  }

}