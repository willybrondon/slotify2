import 'dart:convert';

PaymentHistoryModel paymentHistoryModelFromJson(String str) => PaymentHistoryModel.fromJson(json.decode(str));
String paymentHistoryModelToJson(PaymentHistoryModel data) => json.encode(data.toJson());

class PaymentHistoryModel {
  PaymentHistoryModel({
    bool? status,
    String? message,
    num? total,
    List<Settlements>? settlements,
  }) {
    _status = status;
    _message = message;
    _total = total;
    _settlements = settlements;
  }

  PaymentHistoryModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _total = json['total'];
    if (json['settlements'] != null) {
      _settlements = [];
      json['settlements'].forEach((v) {
        _settlements?.add(Settlements.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  num? _total;
  List<Settlements>? _settlements;
  PaymentHistoryModel copyWith({
    bool? status,
    String? message,
    num? total,
    List<Settlements>? settlements,
  }) =>
      PaymentHistoryModel(
        status: status ?? _status,
        message: message ?? _message,
        total: total ?? _total,
        settlements: settlements ?? _settlements,
      );
  bool? get status => _status;
  String? get message => _message;
  num? get total => _total;
  List<Settlements>? get settlements => _settlements;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['total'] = _total;
    if (_settlements != null) {
      map['settlements'] = _settlements?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Settlements settlementsFromJson(String str) => Settlements.fromJson(json.decode(str));
String settlementsToJson(Settlements data) => json.encode(data.toJson());

class Settlements {
  Settlements({
    String? id,
    String? expertId,
    num? bonus,
    List<BookingId>? bookingId,
    String? createdAt,
    String? date,
    num? expertEarning,
    num? finalAmount,
    String? salonId,
    num? statusOfTransaction,
    String? updatedAt,
  }) {
    _id = id;
    _expertId = expertId;
    _bonus = bonus;
    _bookingId = bookingId;
    _createdAt = createdAt;
    _date = date;
    _expertEarning = expertEarning;
    _finalAmount = finalAmount;
    _salonId = salonId;
    _statusOfTransaction = statusOfTransaction;
    _updatedAt = updatedAt;
  }

  Settlements.fromJson(dynamic json) {
    _id = json['_id'];
    _expertId = json['expertId'];
    _bonus = json['bonus'];
    if (json['bookingId'] != null) {
      _bookingId = [];
      json['bookingId'].forEach((v) {
        _bookingId?.add(BookingId.fromJson(v));
      });
    }
    _createdAt = json['createdAt'];
    _date = json['date'];
    _expertEarning = json['expertEarning'];
    _finalAmount = json['finalAmount'];
    _salonId = json['salonId'];
    _statusOfTransaction = json['statusOfTransaction'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  String? _expertId;
  num? _bonus;
  List<BookingId>? _bookingId;
  String? _createdAt;
  String? _date;
  num? _expertEarning;
  num? _finalAmount;
  String? _salonId;
  num? _statusOfTransaction;
  String? _updatedAt;
  Settlements copyWith({
    String? id,
    String? expertId,
    num? bonus,
    List<BookingId>? bookingId,
    String? createdAt,
    String? date,
    num? expertEarning,
    num? finalAmount,
    String? salonId,
    num? statusOfTransaction,
    String? updatedAt,
  }) =>
      Settlements(
        id: id ?? _id,
        expertId: expertId ?? _expertId,
        bonus: bonus ?? _bonus,
        bookingId: bookingId ?? _bookingId,
        createdAt: createdAt ?? _createdAt,
        date: date ?? _date,
        expertEarning: expertEarning ?? _expertEarning,
        finalAmount: finalAmount ?? _finalAmount,
        salonId: salonId ?? _salonId,
        statusOfTransaction: statusOfTransaction ?? _statusOfTransaction,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  String? get expertId => _expertId;
  num? get bonus => _bonus;
  List<BookingId>? get bookingId => _bookingId;
  String? get createdAt => _createdAt;
  String? get date => _date;
  num? get expertEarning => _expertEarning;
  num? get finalAmount => _finalAmount;
  String? get salonId => _salonId;
  num? get statusOfTransaction => _statusOfTransaction;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['expertId'] = _expertId;
    map['bonus'] = _bonus;
    if (_bookingId != null) {
      map['bookingId'] = _bookingId?.map((v) => v.toJson()).toList();
    }
    map['createdAt'] = _createdAt;
    map['date'] = _date;
    map['expertEarning'] = _expertEarning;
    map['finalAmount'] = _finalAmount;
    map['salonId'] = _salonId;
    map['statusOfTransaction'] = _statusOfTransaction;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

BookingId bookingIdFromJson(String str) => BookingId.fromJson(json.decode(str));
String bookingIdToJson(BookingId data) => json.encode(data.toJson());

class BookingId {
  BookingId({
    String? id,
    List<ServiceId>? serviceId,
    String? status,
    String? date,
    num? expertEarning,
    UserId? userId,
    String? startTime,
  }) {
    _id = id;
    _serviceId = serviceId;
    _status = status;
    _date = date;
    _expertEarning = expertEarning;
    _userId = userId;
    _startTime = startTime;
  }

  BookingId.fromJson(dynamic json) {
    _id = json['_id'];
    if (json['serviceId'] != null) {
      _serviceId = [];
      json['serviceId'].forEach((v) {
        _serviceId?.add(ServiceId.fromJson(v));
      });
    }
    _status = json['status'];
    _date = json['date'];
    _expertEarning = json['expertEarning'];
    _userId = json['userId'] != null ? UserId.fromJson(json['userId']) : null;
    _startTime = json['startTime'];
  }
  String? _id;
  List<ServiceId>? _serviceId;
  String? _status;
  String? _date;
  num? _expertEarning;
  UserId? _userId;
  String? _startTime;
  BookingId copyWith({
    String? id,
    List<ServiceId>? serviceId,
    String? status,
    String? date,
    num? expertEarning,
    UserId? userId,
    String? startTime,
  }) =>
      BookingId(
        id: id ?? _id,
        serviceId: serviceId ?? _serviceId,
        status: status ?? _status,
        date: date ?? _date,
        expertEarning: expertEarning ?? _expertEarning,
        userId: userId ?? _userId,
        startTime: startTime ?? _startTime,
      );
  String? get id => _id;
  List<ServiceId>? get serviceId => _serviceId;
  String? get status => _status;
  String? get date => _date;
  num? get expertEarning => _expertEarning;
  UserId? get userId => _userId;
  String? get startTime => _startTime;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    if (_serviceId != null) {
      map['serviceId'] = _serviceId?.map((v) => v.toJson()).toList();
    }
    map['status'] = _status;
    map['date'] = _date;
    map['expertEarning'] = _expertEarning;
    if (_userId != null) {
      map['userId'] = _userId?.toJson();
    }
    map['startTime'] = _startTime;
    return map;
  }
}

UserId userIdFromJson(String str) => UserId.fromJson(json.decode(str));
String userIdToJson(UserId data) => json.encode(data.toJson());

class UserId {
  UserId({
    String? id,
    String? fname,
    String? lname,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
  }

  UserId.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  UserId copyWith({
    String? id,
    String? fname,
    String? lname,
  }) =>
      UserId(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    return map;
  }
}

ServiceId serviceIdFromJson(String str) => ServiceId.fromJson(json.decode(str));
String serviceIdToJson(ServiceId data) => json.encode(data.toJson());

class ServiceId {
  ServiceId({
    String? id,
    String? name,
  }) {
    _id = id;
    _name = name;
  }

  ServiceId.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
  }
  String? _id;
  String? _name;
  ServiceId copyWith({
    String? id,
    String? name,
  }) =>
      ServiceId(
        id: id ?? _id,
        name: name ?? _name,
      );
  String? get id => _id;
  String? get name => _name;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    return map;
  }
}
