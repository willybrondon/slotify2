import 'dart:convert';

DepositToWalletModel depositToWalletModelFromJson(String str) => DepositToWalletModel.fromJson(json.decode(str));
String depositToWalletModelToJson(DepositToWalletModel data) => json.encode(data.toJson());

class DepositToWalletModel {
  DepositToWalletModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  DepositToWalletModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  DepositToWalletModel copyWith({
    bool? status,
    String? message,
  }) =>
      DepositToWalletModel(
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
