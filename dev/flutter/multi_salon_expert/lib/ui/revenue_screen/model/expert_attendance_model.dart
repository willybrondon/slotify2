import 'dart:convert';

ExpertAttendanceModel expertAttendanceModelFromJson(String str) => ExpertAttendanceModel.fromJson(json.decode(str));
String expertAttendanceModelToJson(ExpertAttendanceModel data) => json.encode(data.toJson());

class ExpertAttendanceModel {
  ExpertAttendanceModel({
    bool? status,
    String? message,
  }) {
    _status = status;
    _message = message;
  }

  ExpertAttendanceModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
  ExpertAttendanceModel copyWith({
    bool? status,
    String? message,
  }) =>
      ExpertAttendanceModel(
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
