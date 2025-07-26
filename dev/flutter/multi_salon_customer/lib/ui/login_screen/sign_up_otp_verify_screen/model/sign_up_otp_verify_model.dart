import 'dart:convert';
SignUpOtpVerifyModel signUpOtpVerifyModelFromJson(String str) => SignUpOtpVerifyModel.fromJson(json.decode(str));
String signUpOtpVerifyModelToJson(SignUpOtpVerifyModel data) => json.encode(data.toJson());
class SignUpOtpVerifyModel {
  SignUpOtpVerifyModel({
      bool? status, 
      String? message,}){
    _status = status;
    _message = message;
}

  SignUpOtpVerifyModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
SignUpOtpVerifyModel copyWith({  bool? status,
  String? message,
}) => SignUpOtpVerifyModel(  status: status ?? _status,
  message: message ?? _message,
);
  bool? get status => _status;
  String? get message => _message;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    return map;
  }

}