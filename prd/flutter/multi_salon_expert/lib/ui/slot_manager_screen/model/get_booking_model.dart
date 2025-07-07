import 'dart:convert';

GetBookingModel getBookingModelFromJson(String str) => GetBookingModel.fromJson(json.decode(str));
String getBookingModelToJson(GetBookingModel data) => json.encode(data.toJson());

class GetBookingModel {
  GetBookingModel({
    bool? status,
    String? message,
    AllSlots? allSlots,
    List<String>? timeSlots,
    SalonTime? salonTime,
    bool? isOpen,
  }) {
    _status = status;
    _message = message;
    _allSlots = allSlots;
    _timeSlots = timeSlots;
    _salonTime = salonTime;
    _isOpen = isOpen;
  }

  GetBookingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _allSlots = json['allSlots'] != null ? AllSlots.fromJson(json['allSlots']) : null;
    _timeSlots = json['timeSlots'] != null ? json['timeSlots'].cast<String>() : [];
    _salonTime = json['salonTime'] != null ? SalonTime.fromJson(json['salonTime']) : null;
    _isOpen = json['isOpen'];
  }
  bool? _status;
  String? _message;
  AllSlots? _allSlots;
  List<String>? _timeSlots;
  SalonTime? _salonTime;
  bool? _isOpen;
  GetBookingModel copyWith({
    bool? status,
    String? message,
    AllSlots? allSlots,
    List<String>? timeSlots,
    SalonTime? salonTime,
    bool? isOpen,
  }) =>
      GetBookingModel(
        status: status ?? _status,
        message: message ?? _message,
        allSlots: allSlots ?? _allSlots,
        timeSlots: timeSlots ?? _timeSlots,
        salonTime: salonTime ?? _salonTime,
        isOpen: isOpen ?? _isOpen,
      );
  bool? get status => _status;
  String? get message => _message;
  AllSlots? get allSlots => _allSlots;
  List<String>? get timeSlots => _timeSlots;
  SalonTime? get salonTime => _salonTime;
  bool? get isOpen => _isOpen;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_allSlots != null) {
      map['allSlots'] = _allSlots?.toJson();
    }
    map['timeSlots'] = _timeSlots;
    if (_salonTime != null) {
      map['salonTime'] = _salonTime?.toJson();
    }
    map['isOpen'] = _isOpen;
    return map;
  }
}

SalonTime salonTimeFromJson(String str) => SalonTime.fromJson(json.decode(str));
String salonTimeToJson(SalonTime data) => json.encode(data.toJson());

class SalonTime {
  SalonTime({
    String? day,
    String? openTime,
    String? closedTime,
    bool? isActive,
    bool? isBreak,
    String? breakTime,
    String? breakStartTime,
    String? breakEndTime,
    num? time,
    String? id,
  }) {
    _day = day;
    _openTime = openTime;
    _closedTime = closedTime;
    _isActive = isActive;
    _isBreak = isBreak;
    _breakTime = breakTime;
    _breakStartTime = breakStartTime;
    _breakEndTime = breakEndTime;
    _time = time;
    _id = id;
  }

  SalonTime.fromJson(dynamic json) {
    _day = json['day'];
    _openTime = json['openTime'];
    _closedTime = json['closedTime'];
    _isActive = json['isActive'];
    _isBreak = json['isBreak'];
    _breakTime = json['breakTime'];
    _breakStartTime = json['breakStartTime'];
    _breakEndTime = json['breakEndTime'];
    _time = json['time'];
    _id = json['_id'];
  }
  String? _day;
  String? _openTime;
  String? _closedTime;
  bool? _isActive;
  bool? _isBreak;
  String? _breakTime;
  String? _breakStartTime;
  String? _breakEndTime;
  num? _time;
  String? _id;
  SalonTime copyWith({
    String? day,
    String? openTime,
    String? closedTime,
    bool? isActive,
    bool? isBreak,
    String? breakTime,
    String? breakStartTime,
    String? breakEndTime,
    num? time,
    String? id,
  }) =>
      SalonTime(
        day: day ?? _day,
        openTime: openTime ?? _openTime,
        closedTime: closedTime ?? _closedTime,
        isActive: isActive ?? _isActive,
        isBreak: isBreak ?? _isBreak,
        breakTime: breakTime ?? _breakTime,
        breakStartTime: breakStartTime ?? _breakStartTime,
        breakEndTime: breakEndTime ?? _breakEndTime,
        time: time ?? _time,
        id: id ?? _id,
      );
  String? get day => _day;
  String? get openTime => _openTime;
  String? get closedTime => _closedTime;
  bool? get isActive => _isActive;
  bool? get isBreak => _isBreak;
  String? get breakTime => _breakTime;
  String? get breakStartTime => _breakStartTime;
  String? get breakEndTime => _breakEndTime;
  num? get time => _time;
  String? get id => _id;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['day'] = _day;
    map['openTime'] = _openTime;
    map['closedTime'] = _closedTime;
    map['isActive'] = _isActive;
    map['isBreak'] = _isBreak;
    map['breakTime'] = _breakTime;
    map['breakStartTime'] = _breakStartTime;
    map['breakEndTime'] = _breakEndTime;
    map['time'] = _time;
    map['_id'] = _id;
    return map;
  }
}

AllSlots allSlotsFromJson(String str) => AllSlots.fromJson(json.decode(str));
String allSlotsToJson(AllSlots data) => json.encode(data.toJson());

class AllSlots {
  AllSlots({
    List<String>? morning,
    List<String>? evening,
  }) {
    _morning = morning;
    _evening = evening;
  }

  AllSlots.fromJson(dynamic json) {
    _morning = json['morning'] != null ? json['morning'].cast<String>() : [];
    _evening = json['evening'] != null ? json['evening'].cast<String>() : [];
  }
  List<String>? _morning;
  List<String>? _evening;
  AllSlots copyWith({
    List<String>? morning,
    List<String>? evening,
  }) =>
      AllSlots(
        morning: morning ?? _morning,
        evening: evening ?? _evening,
      );
  List<String>? get morning => _morning;
  List<String>? get evening => _evening;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['morning'] = _morning;
    map['evening'] = _evening;
    return map;
  }
}
