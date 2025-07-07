// To parse this JSON data, do
//
//     final getAttendanceMonthModel = getAttendanceMonthModelFromJson(jsonString);

import 'dart:convert';

GetAttendanceMonthModel getAttendanceMonthModelFromJson(String str) =>
    GetAttendanceMonthModel.fromJson(json.decode(str));

String getAttendanceMonthModelToJson(GetAttendanceMonthModel data) => json.encode(data.toJson());

class GetAttendanceMonthModel {
  bool? status;
  String? message;
  List<Datum>? data;

  GetAttendanceMonthModel({
    this.status,
    this.message,
    this.data,
  });

  factory GetAttendanceMonthModel.fromJson(Map<String, dynamic> json) => GetAttendanceMonthModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? [] : List<Datum>.from(json["data"]!.map((x) => Datum.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
      };
}

class Datum {
  String? id;
  String? month;
  int? attendCount;
  int? absentCount;
  List<DateTime>? attendDates;
  List<dynamic>? absentDates;
  int? totalDays;
  String? checkInTime;
  String? expertId;
  DateTime? createdAt;
  DateTime? updatedAt;

  Datum({
    this.id,
    this.month,
    this.attendCount,
    this.absentCount,
    this.attendDates,
    this.absentDates,
    this.totalDays,
    this.checkInTime,
    this.expertId,
    this.createdAt,
    this.updatedAt,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["_id"],
        month: json["month"],
        attendCount: json["attendCount"],
        absentCount: json["absentCount"],
        attendDates: json["attendDates"] == null
            ? []
            : List<DateTime>.from(json["attendDates"]!.map((x) => DateTime.parse(x))),
        absentDates:
            json["absentDates"] == null ? [] : List<dynamic>.from(json["absentDates"]!.map((x) => x)),
        totalDays: json["totalDays"],
        checkInTime: json["checkInTime"],
        expertId: json["expertId"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "month": month,
        "attendCount": attendCount,
        "absentCount": absentCount,
        "attendDates": attendDates == null
            ? []
            : List<dynamic>.from(attendDates!.map((x) =>
                "${x.year.toString().padLeft(4, '0')}-${x.month.toString().padLeft(2, '0')}-${x.day.toString().padLeft(2, '0')}")),
        "absentDates": absentDates == null ? [] : List<dynamic>.from(absentDates!.map((x) => x)),
        "totalDays": totalDays,
        "checkInTime": checkInTime,
        "expertId": expertId,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}
