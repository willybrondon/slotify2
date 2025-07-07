// To parse this JSON data, do
//
//     final getProfileModel = getProfileModelFromJson(jsonString);

import 'dart:convert';

GetProfileModel getProfileModelFromJson(String str) => GetProfileModel.fromJson(json.decode(str));

String getProfileModelToJson(GetProfileModel data) => json.encode(data.toJson());

class GetProfileModel {
  bool? status;
  String? message;
  Tax? tax;
  Data? data;

  GetProfileModel({
    this.status,
    this.message,
    this.tax,
    this.data,
  });

  factory GetProfileModel.fromJson(Map<String, dynamic> json) => GetProfileModel(
        status: json["status"],
        message: json["message"],
        tax: json["tax"] == null ? null : Tax.fromJson(json["tax"]),
        data: json["data"] == null ? null : Data.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "tax": tax?.toJson(),
        "data": data?.toJson(),
      };
}

class Data {
  BankDetails? bankDetails;
  String? id;
  String? fname;
  String? lname;
  String? email;
  String? image;
  String? mobile;
  String? fcmToken;
  bool? isAttend;
  num? uniqueId;
  bool? showDialog;
  SalonId? salonId;
  List<ServiceId>? serviceId;
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

  Data({
    this.bankDetails,
    this.id,
    this.fname,
    this.lname,
    this.email,
    this.image,
    this.mobile,
    this.fcmToken,
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

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        bankDetails: json["bankDetails"] == null ? null : BankDetails.fromJson(json["bankDetails"]),
        id: json["_id"],
        fname: json["fname"],
        lname: json["lname"],
        email: json["email"],
        image: json["image"],
        mobile: json["mobile"],
        fcmToken: json["fcmToken"],
        isAttend: json["isAttend"],
        uniqueId: json["uniqueId"],
        showDialog: json["showDialog"],
        salonId: json["salonId"] == null ? null : SalonId.fromJson(json["salonId"]),
        serviceId: json["serviceId"] == null ? [] : List<ServiceId>.from(json["serviceId"]!.map((x) => ServiceId.fromJson(x))),
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
        "isAttend": isAttend,
        "uniqueId": uniqueId,
        "showDialog": showDialog,
        "salonId": salonId?.toJson(),
        "serviceId": serviceId == null ? [] : List<dynamic>.from(serviceId!.map((x) => x.toJson())),
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

class SalonId {
  AddressDetails? addressDetails;
  String? id;
  String? name;

  SalonId({
    this.addressDetails,
    this.id,
    this.name,
  });

  factory SalonId.fromJson(Map<String, dynamic> json) => SalonId(
        addressDetails: json["addressDetails"] == null ? null : AddressDetails.fromJson(json["addressDetails"]),
        id: json["_id"],
        name: json["name"],
      );

  Map<String, dynamic> toJson() => {
        "addressDetails": addressDetails?.toJson(),
        "_id": id,
        "name": name,
      };
}

class AddressDetails {
  String? addressLine1;
  String? landMark;
  String? city;
  String? state;
  String? country;

  AddressDetails({
    this.addressLine1,
    this.landMark,
    this.city,
    this.state,
    this.country,
  });

  factory AddressDetails.fromJson(Map<String, dynamic> json) => AddressDetails(
        addressLine1: json["addressLine1"],
        landMark: json["landMark"],
        city: json["city"],
        state: json["state"],
        country: json["country"],
      );

  Map<String, dynamic> toJson() => {
        "addressLine1": addressLine1,
        "landMark": landMark,
        "city": city,
        "state": state,
        "country": country,
      };
}

class ServiceId {
  String? id;
  bool? status;
  bool? isDelete;
  String? name;
  num? duration;
  String? categoryId;
  String? image;
  DateTime? createdAt;
  DateTime? updatedAt;

  ServiceId({
    this.id,
    this.status,
    this.isDelete,
    this.name,
    this.duration,
    this.categoryId,
    this.image,
    this.createdAt,
    this.updatedAt,
  });

  factory ServiceId.fromJson(Map<String, dynamic> json) => ServiceId(
        id: json["_id"],
        status: json["status"],
        isDelete: json["isDelete"],
        name: json["name"],
        duration: json["duration"],
        categoryId: json["categoryId"],
        image: json["image"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "status": status,
        "isDelete": isDelete,
        "name": name,
        "duration": duration,
        "categoryId": categoryId,
        "image": image,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}

class Tax {
  String? id;
  num? tax;

  Tax({
    this.id,
    this.tax,
  });

  factory Tax.fromJson(Map<String, dynamic> json) => Tax(
        id: json["_id"],
        tax: json["tax"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "tax": tax,
      };
}
