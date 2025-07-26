// To parse this JSON data, do
//
//     final getBookingModel = getBookingModelFromJson(jsonString);

import 'dart:convert';

GetBookingModel getBookingModelFromJson(String str) => GetBookingModel.fromJson(json.decode(str));

String getBookingModelToJson(GetBookingModel data) => json.encode(data.toJson());

class GetBookingModel {
  bool? status;
  String? message;
  AllSlots? allSlots;
  List<String>? timeSlots;
  SalonTime? salonTime;
  bool? isOpen;

  GetBookingModel({
    this.status,
    this.message,
    this.allSlots,
    this.timeSlots,
    this.salonTime,
    this.isOpen,
  });

  factory GetBookingModel.fromJson(Map<String, dynamic> json) => GetBookingModel(
        status: json["status"],
        message: json["message"],
        allSlots: json["allSlots"] == null ? null : AllSlots.fromJson(json["allSlots"]),
        timeSlots: json["timeSlots"] == null ? [] : List<String>.from(json["timeSlots"]!.map((x) => x)),
        salonTime: json["salonTime"] == null ? null : SalonTime.fromJson(json["salonTime"]),
        isOpen: json["isOpen"],
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "allSlots": allSlots?.toJson(),
        "timeSlots": timeSlots == null ? [] : List<dynamic>.from(timeSlots!.map((x) => x)),
        "salonTime": salonTime?.toJson(),
        "isOpen": isOpen,
      };
}

class AllSlots {
  List<String>? morning;
  List<String>? evening;

  AllSlots({
    this.morning,
    this.evening,
  });

  factory AllSlots.fromJson(Map<String, dynamic> json) => AllSlots(
        morning: json["morning"] == null ? [] : List<String>.from(json["morning"]!.map((x) => x)),
        evening: json["evening"] == null ? [] : List<String>.from(json["evening"]!.map((x) => x)),
      );

  Map<String, dynamic> toJson() => {
        "morning": morning == null ? [] : List<dynamic>.from(morning!.map((x) => x)),
        "evening": evening == null ? [] : List<dynamic>.from(evening!.map((x) => x)),
      };
}

class SalonTime {
  String? day;
  String? openTime;
  String? closedTime;
  bool? isActive;
  String? breakStartTime;
  String? breakEndTime;
  int? time;
  bool? isBreak;
  String? id;

  SalonTime({
    this.day,
    this.openTime,
    this.closedTime,
    this.isActive,
    this.breakStartTime,
    this.breakEndTime,
    this.time,
    this.isBreak,
    this.id,
  });

  factory SalonTime.fromJson(Map<String, dynamic> json) => SalonTime(
        day: json["day"],
        openTime: json["openTime"],
        closedTime: json["closedTime"],
        isActive: json["isActive"],
        breakStartTime: json["breakStartTime"],
        breakEndTime: json["breakEndTime"],
        time: json["time"],
        isBreak: json["isBreak"],
        id: json["_id"],
      );

  Map<String, dynamic> toJson() => {
        "day": day,
        "openTime": openTime,
        "closedTime": closedTime,
        "isActive": isActive,
        "breakStartTime": breakStartTime,
        "breakEndTime": breakEndTime,
        "time": time,
        "isBreak": isBreak,
        "_id": id,
      };
}
