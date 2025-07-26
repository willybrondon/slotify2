import 'dart:convert';

OtpCreateModel otpCreateModelFromJson(String str) => OtpCreateModel.fromJson(json.decode(str));
String otpCreateModelToJson(OtpCreateModel data) => json.encode(data.toJson());

class OtpCreateModel {
  OtpCreateModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  OtpCreateModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  OtpCreateModel copyWith({
    bool? status,
    String? message,
  }) =>
      OtpCreateModel(
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
