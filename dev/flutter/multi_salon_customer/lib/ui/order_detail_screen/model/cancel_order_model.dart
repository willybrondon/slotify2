import 'dart:convert';

CancelOrderModel cancelOrderModelFromJson(String str) => CancelOrderModel.fromJson(json.decode(str));
String cancelOrderModelToJson(CancelOrderModel data) => json.encode(data.toJson());

class CancelOrderModel {
  CancelOrderModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  CancelOrderModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  CancelOrderModel copyWith({
    bool? status,
    String? message,
  }) =>
      CancelOrderModel(
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
