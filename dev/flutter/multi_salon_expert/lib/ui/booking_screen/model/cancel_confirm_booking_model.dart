import 'dart:convert';

CancelConfirmBookingModel cancelConfirmBookingModelFromJson(String str) => CancelConfirmBookingModel.fromJson(json.decode(str));
String cancelConfirmBookingModelToJson(CancelConfirmBookingModel data) => json.encode(data.toJson());

class CancelConfirmBookingModel {
  CancelConfirmBookingModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  CancelConfirmBookingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  CancelConfirmBookingModel copyWith({
    bool? status,
    String? message,
  }) =>
      CancelConfirmBookingModel(
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
