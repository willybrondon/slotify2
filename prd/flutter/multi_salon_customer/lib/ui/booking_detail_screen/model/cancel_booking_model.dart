import 'dart:convert';

CancelBookingModel cancelBookingModelFromJson(String str) => CancelBookingModel.fromJson(json.decode(str));
String cancelBookingModelToJson(CancelBookingModel data) => json.encode(data.toJson());

class CancelBookingModel {
  CancelBookingModel({
    bool? status,
    String? message,
    Booking? booking,
  }) {
    _status = status;
    _message = message;
    _booking = booking;
  }

  CancelBookingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _booking = json['booking'] != null ? Booking.fromJson(json['booking']) : null;
  }
  bool? _status;
  String? _message;
  Booking? _booking;
  CancelBookingModel copyWith({
    bool? status,
    String? message,
    Booking? booking,
  }) =>
      CancelBookingModel(
        status: status ?? _status,
        message: message ?? _message,
        booking: booking ?? _booking,
      );
  bool? get status => _status;
  String? get message => _message;
  Booking? get booking => _booking;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_booking != null) {
      map['booking'] = _booking?.toJson();
    }
    return map;
  }
}

Booking bookingFromJson(String str) => Booking.fromJson(json.decode(str));
String bookingToJson(Booking data) => json.encode(data.toJson());

class Booking {
  Booking({
    Cancel? cancel,
    String? id,
    List<String>? time,
    List<String>? serviceId,
    String? status,
    String? date,
    bool? isReviewed,
    num? paymentStatus,
    String? paymentType,
    num? duration,
    num? amount,
    num? tax,
    num? withoutTax,
    num? platformFee,
    num? platformFeePercent,
    num? salonEarning,
    num? salonCommissionPercent,
    num? expertEarning,
    bool? isDelete,
    String? userId,
    String? expertId,
    String? startTime,
    String? salonId,
    String? bookingId,
    String? createdAt,
    String? updatedAt,
    num? salonCommission,
  }) {
    _cancel = cancel;
    _id = id;
    _time = time;
    _serviceId = serviceId;
    _status = status;
    _date = date;
    _isReviewed = isReviewed;
    _paymentStatus = paymentStatus;
    _paymentType = paymentType;
    _duration = duration;
    _amount = amount;
    _tax = tax;
    _withoutTax = withoutTax;
    _platformFee = platformFee;
    _platformFeePercent = platformFeePercent;
    _salonEarning = salonEarning;
    _salonCommissionPercent = salonCommissionPercent;
    _expertEarning = expertEarning;
    _isDelete = isDelete;
    _userId = userId;
    _expertId = expertId;
    _startTime = startTime;
    _salonId = salonId;
    _bookingId = bookingId;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _salonCommission = salonCommission;
  }

  Booking.fromJson(dynamic json) {
    _cancel = json['cancel'] != null ? Cancel.fromJson(json['cancel']) : null;
    _id = json['_id'];
    _time = json['time'] != null ? json['time'].cast<String>() : [];
    _serviceId = json['serviceId'] != null ? json['serviceId'].cast<String>() : [];
    _status = json['status'];
    _date = json['date'];
    _isReviewed = json['isReviewed'];
    _paymentStatus = json['paymentStatus'];
    _paymentType = json['paymentType'];
    _duration = json['duration'];
    _amount = json['amount'];
    _tax = json['tax'];
    _withoutTax = json['withoutTax'];
    _platformFee = json['platformFee'];
    _platformFeePercent = json['platformFeePercent'];
    _salonEarning = json['salonEarning'];
    _salonCommissionPercent = json['salonCommissionPercent'];
    _expertEarning = json['expertEarning'];
    _isDelete = json['isDelete'];
    _userId = json['userId'];
    _expertId = json['expertId'];
    _startTime = json['startTime'];
    _salonId = json['salonId'];
    _bookingId = json['bookingId'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _salonCommission = json['salonCommission'];
  }
  Cancel? _cancel;
  String? _id;
  List<String>? _time;
  List<String>? _serviceId;
  String? _status;
  String? _date;
  bool? _isReviewed;
  num? _paymentStatus;
  String? _paymentType;
  num? _duration;
  num? _amount;
  num? _tax;
  num? _withoutTax;
  num? _platformFee;
  num? _platformFeePercent;
  num? _salonEarning;
  num? _salonCommissionPercent;
  num? _expertEarning;
  bool? _isDelete;
  String? _userId;
  String? _expertId;
  String? _startTime;
  String? _salonId;
  String? _bookingId;
  String? _createdAt;
  String? _updatedAt;
  num? _salonCommission;
  Booking copyWith({
    Cancel? cancel,
    String? id,
    List<String>? time,
    List<String>? serviceId,
    String? status,
    String? date,
    bool? isReviewed,
    num? paymentStatus,
    String? paymentType,
    num? duration,
    num? amount,
    num? tax,
    num? withoutTax,
    num? platformFee,
    num? platformFeePercent,
    num? salonEarning,
    num? salonCommissionPercent,
    num? expertEarning,
    bool? isDelete,
    String? userId,
    String? expertId,
    String? startTime,
    String? salonId,
    String? bookingId,
    String? createdAt,
    String? updatedAt,
    num? salonCommission,
  }) =>
      Booking(
        cancel: cancel ?? _cancel,
        id: id ?? _id,
        time: time ?? _time,
        serviceId: serviceId ?? _serviceId,
        status: status ?? _status,
        date: date ?? _date,
        isReviewed: isReviewed ?? _isReviewed,
        paymentStatus: paymentStatus ?? _paymentStatus,
        paymentType: paymentType ?? _paymentType,
        duration: duration ?? _duration,
        amount: amount ?? _amount,
        tax: tax ?? _tax,
        withoutTax: withoutTax ?? _withoutTax,
        platformFee: platformFee ?? _platformFee,
        platformFeePercent: platformFeePercent ?? _platformFeePercent,
        salonEarning: salonEarning ?? _salonEarning,
        salonCommissionPercent: salonCommissionPercent ?? _salonCommissionPercent,
        expertEarning: expertEarning ?? _expertEarning,
        isDelete: isDelete ?? _isDelete,
        userId: userId ?? _userId,
        expertId: expertId ?? _expertId,
        startTime: startTime ?? _startTime,
        salonId: salonId ?? _salonId,
        bookingId: bookingId ?? _bookingId,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        salonCommission: salonCommission ?? _salonCommission,
      );
  Cancel? get cancel => _cancel;
  String? get id => _id;
  List<String>? get time => _time;
  List<String>? get serviceId => _serviceId;
  String? get status => _status;
  String? get date => _date;
  bool? get isReviewed => _isReviewed;
  num? get paymentStatus => _paymentStatus;
  String? get paymentType => _paymentType;
  num? get duration => _duration;
  num? get amount => _amount;
  num? get tax => _tax;
  num? get withoutTax => _withoutTax;
  num? get platformFee => _platformFee;
  num? get platformFeePercent => _platformFeePercent;
  num? get salonEarning => _salonEarning;
  num? get salonCommissionPercent => _salonCommissionPercent;
  num? get expertEarning => _expertEarning;
  bool? get isDelete => _isDelete;
  String? get userId => _userId;
  String? get expertId => _expertId;
  String? get startTime => _startTime;
  String? get salonId => _salonId;
  String? get bookingId => _bookingId;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  num? get salonCommission => _salonCommission;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_cancel != null) {
      map['cancel'] = _cancel?.toJson();
    }
    map['_id'] = _id;
    map['time'] = _time;
    map['serviceId'] = _serviceId;
    map['status'] = _status;
    map['date'] = _date;
    map['isReviewed'] = _isReviewed;
    map['paymentStatus'] = _paymentStatus;
    map['paymentType'] = _paymentType;
    map['duration'] = _duration;
    map['amount'] = _amount;
    map['tax'] = _tax;
    map['withoutTax'] = _withoutTax;
    map['platformFee'] = _platformFee;
    map['platformFeePercent'] = _platformFeePercent;
    map['salonEarning'] = _salonEarning;
    map['salonCommissionPercent'] = _salonCommissionPercent;
    map['expertEarning'] = _expertEarning;
    map['isDelete'] = _isDelete;
    map['userId'] = _userId;
    map['expertId'] = _expertId;
    map['startTime'] = _startTime;
    map['salonId'] = _salonId;
    map['bookingId'] = _bookingId;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['salonCommission'] = _salonCommission;
    return map;
  }
}

Cancel cancelFromJson(String str) => Cancel.fromJson(json.decode(str));
String cancelToJson(Cancel data) => json.encode(data.toJson());

class Cancel {
  Cancel({
    String? date,
    String? reason,
    String? time,
  }) {
    _date = date;
    _reason = reason;
    _time = time;
  }

  Cancel.fromJson(dynamic json) {
    _date = json['date'];
    _reason = json['reason'];
    _time = json['time'];
  }
  String? _date;
  String? _reason;
  String? _time;
  Cancel copyWith({
    String? date,
    String? reason,
    String? time,
  }) =>
      Cancel(
        date: date ?? _date,
        reason: reason ?? _reason,
        time: time ?? _time,
      );
  String? get date => _date;
  String? get reason => _reason;
  String? get time => _time;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['date'] = _date;
    map['reason'] = _reason;
    map['time'] = _time;
    return map;
  }
}
