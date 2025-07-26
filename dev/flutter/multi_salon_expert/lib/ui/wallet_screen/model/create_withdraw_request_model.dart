import 'dart:convert';

CreateWithdrawRequestModel createWithdrawRequestModelFromJson(String str) =>
    CreateWithdrawRequestModel.fromJson(json.decode(str));
String createWithdrawRequestModelToJson(CreateWithdrawRequestModel data) => json.encode(data.toJson());

class CreateWithdrawRequestModel {
  CreateWithdrawRequestModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  CreateWithdrawRequestModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  CreateWithdrawRequestModel copyWith({
    bool? status,
    String? message,
  }) =>
      CreateWithdrawRequestModel(
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
