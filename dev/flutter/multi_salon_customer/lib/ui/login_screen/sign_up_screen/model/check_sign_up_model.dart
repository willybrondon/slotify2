import 'dart:convert';

CheckSignUpModel checkSignUpModelFromJson(String str) => CheckSignUpModel.fromJson(json.decode(str));
String checkSignUpModelToJson(CheckSignUpModel data) => json.encode(data.toJson());

class CheckSignUpModel {
  CheckSignUpModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  CheckSignUpModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  CheckSignUpModel copyWith({
    bool? status,
    String? message,
  }) =>
      CheckSignUpModel(
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
