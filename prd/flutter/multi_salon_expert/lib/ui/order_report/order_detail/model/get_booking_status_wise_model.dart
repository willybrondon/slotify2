// To parse this JSON data, do
//
//     final getBookingStatusWiseModel = getBookingStatusWiseModelFromJson(jsonString);

import 'dart:convert';

GetBookingStatusWiseModel getBookingStatusWiseModelFromJson(String str) => GetBookingStatusWiseModel.fromJson(json.decode(str));

String getBookingStatusWiseModelToJson(GetBookingStatusWiseModel data) => json.encode(data.toJson());

class GetBookingStatusWiseModel {
  bool? status;
  String? message;
  List<Data>? data;

  GetBookingStatusWiseModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetBookingStatusWiseModel.fromJson(Map<String, dynamic> json) => GetBookingStatusWiseModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? [] : List<Data>.from(json["data"]!.map((x) => Data.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
      };
}

class Data {
  String? id;
  String? status;
  DateTime? date;
  String? paymentType;
  double? amount;
  int? withoutTax;
  double? expertEarning;
  String? startTime;
  String? bookingId;
  String? checkInTime;
  String? checkOutTime;
  List<String>? service;
  String? userLname;
  String? userFname;
  Cancel? cancel;

  Data({
    this.id,
    this.status,
    this.date,
    this.paymentType,
    this.amount,
    this.withoutTax,
    this.expertEarning,
    this.startTime,
    this.bookingId,
    this.checkInTime,
    this.checkOutTime,
    this.service,
    this.userLname,
    this.userFname,
    this.cancel,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        id: json["_id"],
        status: json["status"],
        date: json["date"] == null ? null : DateTime.parse(json["date"]),
        paymentType: json["paymentType"],
        amount: json["amount"]?.toDouble(),
        withoutTax: json["withoutTax"],
        expertEarning: json["expertEarning"]?.toDouble(),
        startTime: json["startTime"],
        bookingId: json["bookingId"],
        checkInTime: json["checkInTime"],
        checkOutTime: json["checkOutTime"],
        service: json["service"] == null ? [] : List<String>.from(json["service"]!.map((x) => x)),
        userLname: json["userLname"],
        userFname: json["userFname"],
        cancel: json["cancel"] == null ? null : Cancel.fromJson(json["cancel"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "status": status,
        "date":
            "${date!.year.toString().padLeft(4, '0')}-${date!.month.toString().padLeft(2, '0')}-${date!.day.toString().padLeft(2, '0')}",
        "paymentType": paymentType,
        "amount": amount,
        "withoutTax": withoutTax,
        "expertEarning": expertEarning,
        "startTime": startTime,
        "bookingId": bookingId,
        "checkInTime": checkInTime,
        "checkOutTime": checkOutTime,
        "service": service == null ? [] : List<dynamic>.from(service!.map((x) => x)),
        "userLname": userLname,
        "userFname": userFname,
        "cancel": cancel?.toJson(),
      };
}

class Cancel {
  DateTime? date;
  String? reason;
  String? time;

  Cancel({
    this.date,
    this.reason,
    this.time,
  });

  factory Cancel.fromJson(Map<String, dynamic> json) => Cancel(
        date: json["date"] == null ? null : DateTime.parse(json["date"]),
        reason: json["reason"],
        time: json["time"],
      );

  Map<String, dynamic> toJson() => {
        "date":
            "${date!.year.toString().padLeft(4, '0')}-${date!.month.toString().padLeft(2, '0')}-${date!.day.toString().padLeft(2, '0')}",
        "reason": reason,
        "time": time,
      };
}
