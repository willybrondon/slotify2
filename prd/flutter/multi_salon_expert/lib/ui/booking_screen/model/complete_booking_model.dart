import 'dart:convert';
CompleteBookingModel completeBookingModelFromJson(String str) => CompleteBookingModel.fromJson(json.decode(str));
String completeBookingModelToJson(CompleteBookingModel data) => json.encode(data.toJson());
class CompleteBookingModel {
  CompleteBookingModel({
      bool? status, 
      String? message, 
      Booking? booking,}){
    _status = status;
    _message = message;
    _booking = booking;
}

  CompleteBookingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _booking = json['booking'] != null ? Booking.fromJson(json['booking']) : null;
  }
  bool? _status;
  String? _message;
  Booking? _booking;
CompleteBookingModel copyWith({  bool? status,
  String? message,
  Booking? booking,
}) => CompleteBookingModel(  status: status ?? _status,
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
      num? salonCommission, 
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
      String? checkInTime, 
      String? checkOutTime,}){
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
    _salonCommission = salonCommission;
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
    _checkInTime = checkInTime;
    _checkOutTime = checkOutTime;
}

  Booking.fromJson(dynamic json) {
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
    _salonCommission = json['salonCommission'];
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
    _checkInTime = json['checkInTime'];
    _checkOutTime = json['checkOutTime'];
  }
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
  num? _salonCommission;
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
  String? _checkInTime;
  String? _checkOutTime;
Booking copyWith({  String? id,
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
  num? salonCommission,
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
  String? checkInTime,
  String? checkOutTime,
}) => Booking(  id: id ?? _id,
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
  salonCommission: salonCommission ?? _salonCommission,
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
  checkInTime: checkInTime ?? _checkInTime,
  checkOutTime: checkOutTime ?? _checkOutTime,
);
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
  num? get salonCommission => _salonCommission;
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
  String? get checkInTime => _checkInTime;
  String? get checkOutTime => _checkOutTime;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
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
    map['salonCommission'] = _salonCommission;
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
    map['checkInTime'] = _checkInTime;
    map['checkOutTime'] = _checkOutTime;
    return map;
  }

}