import 'dart:convert';

SignUpOtpLoginModel signUpOtpLoginModelFromJson(String str) => SignUpOtpLoginModel.fromJson(json.decode(str));
String signUpOtpLoginModelToJson(SignUpOtpLoginModel data) => json.encode(data.toJson());

class SignUpOtpLoginModel {
  SignUpOtpLoginModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  SignUpOtpLoginModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  SignUpOtpLoginModel copyWith({
    bool? status,
    String? message,
  }) =>
      SignUpOtpLoginModel(
        status: status ?? _status,
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
