import 'dart:convert';
GetCheckBookingModel getCheckBookingModelFromJson(String str) => GetCheckBookingModel.fromJson(json.decode(str));
String getCheckBookingModelToJson(GetCheckBookingModel data) => json.encode(data.toJson());
class GetCheckBookingModel {
  GetCheckBookingModel({
      bool? status, 
      String? message,}){
    _status = status;
    _message = message;
}

  GetCheckBookingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
  }
  bool? _status;
  String? _message;
GetCheckBookingModel copyWith({  bool? status,
  String? message,
}) => GetCheckBookingModel(  status: status ?? _status,
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