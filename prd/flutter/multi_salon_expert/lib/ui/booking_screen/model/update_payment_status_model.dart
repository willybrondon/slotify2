import 'dart:convert';

UpdatePaymentStatusModel updatePaymentStatusModelFromJson(String str) =>
    UpdatePaymentStatusModel.fromJson(json.decode(str));
String updatePaymentStatusModelToJson(UpdatePaymentStatusModel data) => json.encode(data.toJson());

class UpdatePaymentStatusModel {
  UpdatePaymentStatusModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  UpdatePaymentStatusModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  UpdatePaymentStatusModel copyWith({
    bool? status,
    String? message,
  }) =>
      UpdatePaymentStatusModel(
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
