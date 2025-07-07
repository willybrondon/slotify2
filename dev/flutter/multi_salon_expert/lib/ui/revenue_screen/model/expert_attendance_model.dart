// To parse this JSON data, do
//
//     final expertAttendanceModel = expertAttendanceModelFromJson(jsonString);

import 'dart:convert';

ExpertAttendanceModel expertAttendanceModelFromJson(String str) =>
    ExpertAttendanceModel.fromJson(json.decode(str));

String expertAttendanceModelToJson(ExpertAttendanceModel data) => json.encode(data.toJson());

class ExpertAttendanceModel {
  bool? status;
  String? message;
  Data? data;

  ExpertAttendanceModel({
    this.status,
    this.message,
    this.data,
  });

  factory ExpertAttendanceModel.fromJson(Map<String, dynamic> json) => ExpertAttendanceModel(
        status: json["status"],
        message: json["message"],
        data: json["data"] == null ? null : Data.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "data": data?.toJson(),
      };
}

class Data {
  String? id;
  String? month;
  num? attendCount;
  num? absentCount;
  List<DateTime>? attendDates;
  List<DateTime>? absentDates;
  num? totalDays;
  String? checkInTime;
  ExpertId? expertId;
  DateTime? createdAt;
  DateTime? updatedAt;
  String? salonId;

  Data({
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
    this.salonId,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        id: json["_id"],
        month: json["month"],
        attendCount: json["attendCount"],
        absentCount: json["absentCount"],
        attendDates: json["attendDates"] == null
            ? []
            : List<DateTime>.from(json["attendDates"]!.map((x) => DateTime.parse(x))),
        absentDates: json["absentDates"] == null
            ? []
            : List<DateTime>.from(json["absentDates"]!.map((x) => DateTime.parse(x))),
        totalDays: json["totalDays"],
        checkInTime: json["checkInTime"],
        expertId: json["expertId"] == null ? null : ExpertId.fromJson(json["expertId"]),
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
        salonId: json["salonId"],
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
        "absentDates": absentDates == null
            ? []
            : List<dynamic>.from(absentDates!.map((x) =>
                "${x.year.toString().padLeft(4, '0')}-${x.month.toString().padLeft(2, '0')}-${x.day.toString().padLeft(2, '0')}")),
        "totalDays": totalDays,
        "checkInTime": checkInTime,
        "expertId": expertId?.toJson(),
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "salonId": salonId,
      };
}

class ExpertId {
  BankDetails? bankDetails;
  String? id;
  String? fname;
  String? lname;
  String? email;
  String? image;
  String? mobile;
  String? fcmToken;
  bool? isBlock;
  String? password;
  bool? isDelete;
  bool? isAttend;
  num? uniqueId;
  bool? showDialog;
  String? salonId;
  List<String>? serviceId;
  num? earning;
  num? currentEarning;
  num? bookingCount;
  num? totalBookingCount;
  num? paymentType;
  String? upiId;
  num? review;
  num? reviewCount;
  num? age;
  String? gender;
  num? commission;
  DateTime? createdAt;
  DateTime? updatedAt;

  ExpertId({
    this.bankDetails,
    this.id,
    this.fname,
    this.lname,
    this.email,
    this.image,
    this.mobile,
    this.fcmToken,
    this.isBlock,
    this.password,
    this.isDelete,
    this.isAttend,
    this.uniqueId,
    this.showDialog,
    this.salonId,
    this.serviceId,
    this.earning,
    this.currentEarning,
    this.bookingCount,
    this.totalBookingCount,
    this.paymentType,
    this.upiId,
    this.review,
    this.reviewCount,
    this.age,
    this.gender,
    this.commission,
    this.createdAt,
    this.updatedAt,
  });

  factory ExpertId.fromJson(Map<String, dynamic> json) => ExpertId(
        bankDetails: json["bankDetails"] == null ? null : BankDetails.fromJson(json["bankDetails"]),
        id: json["_id"],
        fname: json["fname"],
        lname: json["lname"],
        email: json["email"],
        image: json["image"],
        mobile: json["mobile"],
        fcmToken: json["fcmToken"],
        isBlock: json["isBlock"],
        password: json["password"],
        isDelete: json["isDelete"],
        isAttend: json["isAttend"],
        uniqueId: json["uniqueId"],
        showDialog: json["showDialog"],
        salonId: json["salonId"],
        serviceId: json["serviceId"] == null ? [] : List<String>.from(json["serviceId"]!.map((x) => x)),
        earning: json["earning"],
        currentEarning: json["currentEarning"],
        bookingCount: json["bookingCount"],
        totalBookingCount: json["totalBookingCount"],
        paymentType: json["paymentType"],
        upiId: json["upiId"],
        review: json["review"],
        reviewCount: json["reviewCount"],
        age: json["age"],
        gender: json["gender"],
        commission: json["commission"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "bankDetails": bankDetails?.toJson(),
        "_id": id,
        "fname": fname,
        "lname": lname,
        "email": email,
        "image": image,
        "mobile": mobile,
        "fcmToken": fcmToken,
        "isBlock": isBlock,
        "password": password,
        "isDelete": isDelete,
        "isAttend": isAttend,
        "uniqueId": uniqueId,
        "showDialog": showDialog,
        "salonId": salonId,
        "serviceId": serviceId == null ? [] : List<dynamic>.from(serviceId!.map((x) => x)),
        "earning": earning,
        "currentEarning": currentEarning,
        "bookingCount": bookingCount,
        "totalBookingCount": totalBookingCount,
        "paymentType": paymentType,
        "upiId": upiId,
        "review": review,
        "reviewCount": reviewCount,
        "age": age,
        "gender": gender,
        "commission": commission,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}

class BankDetails {
  String? bankName;
  String? accountNumber;
  String? ifscCode;
  String? branchName;

  BankDetails({
    this.bankName,
    this.accountNumber,
    this.ifscCode,
    this.branchName,
  });

  factory BankDetails.fromJson(Map<String, dynamic> json) => BankDetails(
        bankName: json["bankName"],
        accountNumber: json["accountNumber"],
        ifscCode: json["IFSCCode"],
        branchName: json["branchName"],
      );

  Map<String, dynamic> toJson() => {
        "bankName": bankName,
        "accountNumber": accountNumber,
        "IFSCCode": ifscCode,
        "branchName": branchName,
      };
}
