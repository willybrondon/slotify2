import 'dart:convert';

ExpertBusyScheduleModel expertBusyScheduleModelFromJson(String str) =>
    ExpertBusyScheduleModel.fromJson(json.decode(str));
String expertBusyScheduleModelToJson(ExpertBusyScheduleModel data) => json.encode(data.toJson());

class ExpertBusyScheduleModel {
  ExpertBusyScheduleModel({
    bool? status,
    String? message,
    Expert? expert,
  }) {
    _status = status;
    _message = message;
    _expert = expert;
  }

  ExpertBusyScheduleModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _expert = json['expert'] != null ? Expert.fromJson(json['expert']) : null;
  }
  bool? _status;
  String? _message;
  Expert? _expert;
  ExpertBusyScheduleModel copyWith({
    bool? status,
    String? message,
    Expert? expert,
  }) =>
      ExpertBusyScheduleModel(
        status: status ?? _status,
        message: message ?? _message,
        expert: expert ?? _expert,
      );
  bool? get status => _status;
  String? get message => _message;
  Expert? get expert => _expert;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_expert != null) {
      map['expert'] = _expert?.toJson();
    }
    return map;
  }
}

Expert expertFromJson(String str) => Expert.fromJson(json.decode(str));
String expertToJson(Expert data) => json.encode(data.toJson());

class Expert {
  Expert({
    String? expertId,
    List<String>? time,
    String? date,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) {
    _expertId = expertId;
    _time = time;
    _date = date;
    _id = id;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Expert.fromJson(dynamic json) {
    _expertId = json['expertId'];
    _time = json['time'] != null ? json['time'].cast<String>() : [];
    _date = json['date'];
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _expertId;
  List<String>? _time;
  String? _date;
  String? _id;
  String? _createdAt;
  String? _updatedAt;
  Expert copyWith({
    String? expertId,
    List<String>? time,
    String? date,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) =>
      Expert(
        expertId: expertId ?? _expertId,
        time: time ?? _time,
        date: date ?? _date,
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get expertId => _expertId;
  List<String>? get time => _time;
  String? get date => _date;
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['expertId'] = _expertId;
    map['time'] = _time;
    map['date'] = _date;
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
