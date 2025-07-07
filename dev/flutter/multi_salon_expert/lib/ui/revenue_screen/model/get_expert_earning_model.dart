import 'dart:convert';

GetExpertEarningModel getExpertEarningModelFromJson(String str) =>
    GetExpertEarningModel.fromJson(json.decode(str));

String getExpertEarningModelToJson(GetExpertEarningModel data) => json.encode(data.toJson());

class GetExpertEarningModel {
  GetExpertEarningModel({
    this.status,
    this.message,
    this.bookingStats,
  });

  bool? status;
  String? message;
  BookingStats? bookingStats;

  factory GetExpertEarningModel.fromJson(Map<String, dynamic> json) => GetExpertEarningModel(
        status: json['status'],
        message: json['message'],
        bookingStats: json['bookingStats'] != null ? BookingStats.fromJson(json['bookingStats']) : null,
      );

  Map<String, dynamic> toJson() => {
        'status': status,
        'message': message,
        'bookingStats': bookingStats?.toJson(),
      };
}

class BookingStats {
  BookingStats({
    this.amount,
    this.pendingBooking,
    this.completedBooking,
    this.cancelBooking,
    this.pendingBookingsArray,
    this.completedBookingsArray,
    this.cancelledBookingsArray,
  });

  num? amount;
  num? pendingBooking;
  num? completedBooking;
  num? cancelBooking;
  List<PendingBookingsArray>? pendingBookingsArray;
  List<dynamic>? completedBookingsArray;
  List<dynamic>? cancelledBookingsArray;

  factory BookingStats.fromJson(Map<String, dynamic> json) => BookingStats(
        amount: json['amount'],
        pendingBooking: json['pendingBooking'],
        completedBooking: json['completedBooking'],
        cancelBooking: json['cancelBooking'],
        pendingBookingsArray: json['pendingBookingsArray'] != null
            ? List<PendingBookingsArray>.from(
                json['pendingBookingsArray'].map((x) => PendingBookingsArray.fromJson(x)))
            : null,
        completedBookingsArray: json['completedBookingsArray'] != null
            ? List<dynamic>.from(json['completedBookingsArray'].map((x) => x))
            : null,
        cancelledBookingsArray: json['cancelledBookingsArray'] != null
            ? List<dynamic>.from(json['cancelledBookingsArray'].map((x) => x))
            : null,
      );

  Map<String, dynamic> toJson() => {
        'amount': amount,
        'pendingBooking': pendingBooking,
        'completedBooking': completedBooking,
        'cancelBooking': cancelBooking,
        'pendingBookingsArray': pendingBookingsArray != null
            ? List<dynamic>.from(pendingBookingsArray!.map((x) => x.toJson()))
            : null,
        'completedBookingsArray': completedBookingsArray,
        'cancelledBookingsArray': cancelledBookingsArray,
      };
}

class PendingBookingsArray {
  PendingBookingsArray({
    this.id,
    this.time,
    this.serviceId,
    this.status,
    this.date,
    this.isReviewed,
    this.paymentStatus,
    this.paymentType,
    this.duration,
    this.amount,
    this.tax,
    this.withoutTax,
    this.platformFee,
    this.platformFeePercent,
    this.salonEarning,
    this.salonCommission,
    this.salonCommissionPercent,
    this.expertEarning,
    this.isDelete,
    this.isSettle,
    this.userId,
    this.expertId,
    this.startTime,
    this.salonId,
    this.bookingId,
    this.createdAt,
    this.updatedAt,
    this.analytic,
    this.services,
    this.user,
    this.category,
  });

  String? id;
  List<String>? time;
  List<String>? serviceId;
  String? status;
  String? date;
  bool? isReviewed;
  num? paymentStatus;
  String? paymentType;
  num? duration;
  num? amount;
  num? tax;
  num? withoutTax;
  num? platformFee;
  num? platformFeePercent;
  num? salonEarning;
  num? salonCommission;
  num? salonCommissionPercent;
  num? expertEarning;
  bool? isDelete;
  bool? isSettle;
  String? userId;
  String? expertId;
  String? startTime;
  String? salonId;
  String? bookingId;
  String? createdAt;
  String? updatedAt;
  String? analytic;
  List<dynamic>? services;
  dynamic user;
  dynamic category;

  factory PendingBookingsArray.fromJson(Map<String, dynamic> json) => PendingBookingsArray(
        id: json['_id'],
        time: List<String>.from(json['time'].map((x) => x)),
        serviceId: List<String>.from(json['serviceId'].map((x) => x)),
        status: json['status'],
        date: json['date'],
        isReviewed: json['isReviewed'],
        paymentStatus: json['paymentStatus'],
        paymentType: json['paymentType'],
        duration: json['duration'],
        amount: json['amount'],
        tax: json['tax'],
        withoutTax: json['withoutTax'],
        platformFee: json['platformFee'],
        platformFeePercent: json['platformFeePercent'],
        salonEarning: json['salonEarning'],
        salonCommission: json['salonCommission'],
        salonCommissionPercent: json['salonCommissionPercent'],
        expertEarning: json['expertEarning'],
        isDelete: json['isDelete'],
        isSettle: json['isSettle'],
        userId: json['userId'],
        expertId: json['expertId'],
        startTime: json['startTime'],
        salonId: json['salonId'],
        bookingId: json['bookingId'],
        createdAt: json['createdAt'],
        updatedAt: json['updatedAt'],
        analytic: json['analytic'],
        services: json['services'] != null ? List<dynamic>.from(json['services'].map((x) => x)) : null,
        user: json['user'],
        category: json['category'],
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'time': List<dynamic>.from(time!.map((x) => x)),
        'serviceId': List<dynamic>.from(serviceId!.map((x) => x)),
        'status': status,
        'date': date,
        'isReviewed': isReviewed,
        'paymentStatus': paymentStatus,
        'paymentType': paymentType,
        'duration': duration,
        'amount': amount,
        'tax': tax,
        'withoutTax': withoutTax,
        'platformFee': platformFee,
        'platformFeePercent': platformFeePercent,
        'salonEarning': salonEarning,
        'salonCommission': salonCommission,
        'salonCommissionPercent': salonCommissionPercent,
        'expertEarning': expertEarning,
        'isDelete': isDelete,
        'isSettle': isSettle,
        'userId': userId,
        'expertId': expertId,
        'startTime': startTime,
        'salonId': salonId,
        'bookingId': bookingId,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
        'analytic': analytic,
        'services': services,
        'user': user,
        'category': category,
      };
}
