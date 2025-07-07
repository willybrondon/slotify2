// To parse this JSON data, do
//
//     final getBookingInformationModel = getBookingInformationModelFromJson(jsonString);

import 'dart:convert';

GetBookingInformationModel getBookingInformationModelFromJson(String str) => GetBookingInformationModel.fromJson(json.decode(str));

String getBookingInformationModelToJson(GetBookingInformationModel data) => json.encode(data.toJson());

class GetBookingInformationModel {
  bool? status;
  String? message;
  Booking? booking;

  GetBookingInformationModel({
    this.status,
    this.message,
    this.booking,
  });

  factory GetBookingInformationModel.fromJson(Map<String, dynamic> json) => GetBookingInformationModel(
    status: json["status"],
    message: json["message"],
    booking: json["booking"] == null ? null : Booking.fromJson(json["booking"]),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "message": message,
    "booking": booking?.toJson(),
  };
}

class Booking {
  Cancel? cancel;
  String? id;
  List<String>? time;
  List<Id>? serviceId;
  String? status;
  DateTime? date;
  bool? isReviewed;
  int? paymentStatus;
  String? paymentType;
  int? duration;
  double? amount;
  double? tax;
  int? withoutTax;
  int? platformFee;
  int? platformFeePercent;
  int? salonEarning;
  double? salonCommission;
  int? salonCommissionPercent;
  double? expertEarning;
  bool? isDelete;
  bool? isSettle;
  UserId? userId;
  ExpertId? expertId;
  String? startTime;
  SalonId? salonId;
  String? bookingId;
  DateTime? createdAt;
  DateTime? updatedAt;

  Booking({
    this.cancel,
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
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
    cancel: json["cancel"] == null ? null : Cancel.fromJson(json["cancel"]),
    id: json["_id"],
    time: json["time"] == null ? [] : List<String>.from(json["time"]!.map((x) => x)),
    serviceId: json["serviceId"] == null ? [] : List<Id>.from(json["serviceId"]!.map((x) => Id.fromJson(x))),
    status: json["status"],
    date: json["date"] == null ? null : DateTime.parse(json["date"]),
    isReviewed: json["isReviewed"],
    paymentStatus: json["paymentStatus"],
    paymentType: json["paymentType"],
    duration: json["duration"],
    amount: json["amount"]?.toDouble(),
    tax: json["tax"]?.toDouble(),
    withoutTax: json["withoutTax"],
    platformFee: json["platformFee"],
    platformFeePercent: json["platformFeePercent"],
    salonEarning: json["salonEarning"],
    salonCommission: json["salonCommission"]?.toDouble(),
    salonCommissionPercent: json["salonCommissionPercent"],
    expertEarning: json["expertEarning"]?.toDouble(),
    isDelete: json["isDelete"],
    isSettle: json["isSettle"],
    userId: json["userId"] == null ? null : UserId.fromJson(json["userId"]),
    expertId: json["expertId"] == null ? null : ExpertId.fromJson(json["expertId"]),
    startTime: json["startTime"],
    salonId: json["salonId"] == null ? null : SalonId.fromJson(json["salonId"]),
    bookingId: json["bookingId"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "cancel": cancel?.toJson(),
    "_id": id,
    "time": time == null ? [] : List<dynamic>.from(time!.map((x) => x)),
    "serviceId": serviceId == null ? [] : List<dynamic>.from(serviceId!.map((x) => x.toJson())),
    "status": status,
    "date": "${date!.year.toString().padLeft(4, '0')}-${date!.month.toString().padLeft(2, '0')}-${date!.day.toString().padLeft(2, '0')}",
    "isReviewed": isReviewed,
    "paymentStatus": paymentStatus,
    "paymentType": paymentType,
    "duration": duration,
    "amount": amount,
    "tax": tax,
    "withoutTax": withoutTax,
    "platformFee": platformFee,
    "platformFeePercent": platformFeePercent,
    "salonEarning": salonEarning,
    "salonCommission": salonCommission,
    "salonCommissionPercent": salonCommissionPercent,
    "expertEarning": expertEarning,
    "isDelete": isDelete,
    "isSettle": isSettle,
    "userId": userId?.toJson(),
    "expertId": expertId?.toJson(),
    "startTime": startTime,
    "salonId": salonId?.toJson(),
    "bookingId": bookingId,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

class Cancel {
  DateTime? date;
  String? reason;
  String? time;
  String? person;

  Cancel({
    this.date,
    this.reason,
    this.time,
    this.person,
  });

  factory Cancel.fromJson(Map<String, dynamic> json) => Cancel(
    date: json["date"] == null ? null : DateTime.parse(json["date"]),
    reason: json["reason"],
    time: json["time"],
    person: json["person"],
  );

  Map<String, dynamic> toJson() => {
    "date": "${date!.year.toString().padLeft(4, '0')}-${date!.month.toString().padLeft(2, '0')}-${date!.day.toString().padLeft(2, '0')}",
    "reason": reason,
    "time": time,
    "person": person,
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
  int? uniqueId;
  bool? showDialog;
  String? salonId;
  List<String>? serviceId;
  int? earning;
  int? currentEarning;
  int? bookingCount;
  int? totalBookingCount;
  int? paymentType;
  String? upiId;
  int? review;
  int? reviewCount;
  int? age;
  String? gender;
  int? commission;
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

class SalonId {
  AddressDetails? addressDetails;
  LocationCoordinates? locationCoordinates;
  String? id;
  String? name;
  String? mobile;

  SalonId({
    this.addressDetails,
    this.locationCoordinates,
    this.id,
    this.name,
    this.mobile,
  });

  factory SalonId.fromJson(Map<String, dynamic> json) => SalonId(
    addressDetails: json["addressDetails"] == null ? null : AddressDetails.fromJson(json["addressDetails"]),
    locationCoordinates: json["locationCoordinates"] == null ? null : LocationCoordinates.fromJson(json["locationCoordinates"]),
    id: json["_id"],
    name: json["name"],
    mobile: json["mobile"],
  );

  Map<String, dynamic> toJson() => {
    "addressDetails": addressDetails?.toJson(),
    "locationCoordinates": locationCoordinates?.toJson(),
    "_id": id,
    "name": name,
    "mobile": mobile,
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

class LocationCoordinates {
  String? latitude;
  String? longitude;

  LocationCoordinates({
    this.latitude,
    this.longitude,
  });

  factory LocationCoordinates.fromJson(Map<String, dynamic> json) => LocationCoordinates(
    latitude: json["latitude"],
    longitude: json["longitude"],
  );

  Map<String, dynamic> toJson() => {
    "latitude": latitude,
    "longitude": longitude,
  };
}

class Id {
  String? id;
  bool? status;
  bool? isDelete;
  String? name;
  int? duration;
  Id? categoryId;
  String? image;
  DateTime? createdAt;
  DateTime? updatedAt;

  Id({
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

  factory Id.fromJson(Map<String, dynamic> json) => Id(
    id: json["_id"],
    status: json["status"],
    isDelete: json["isDelete"],
    name: json["name"],
    duration: json["duration"],
    categoryId: json["categoryId"] == null ? null : Id.fromJson(json["categoryId"]),
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
    "categoryId": categoryId?.toJson(),
    "image": image,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

class UserId {
  String? id;
  int? uniqueId;
  String? fname;
  String? lname;
  String? image;
  String? email;
  String? mobile;
  String? gender;
  String? analyticDate;
  bool? isBlock;
  String? bio;
  String? fcmToken;
  bool? isDelete;
  bool? isUpdate;
  String? latitude;
  String? longitude;
  String? password;
  int? loginType;
  int? age;
  DateTime? createdAt;
  DateTime? updatedAt;

  UserId({
    this.id,
    this.uniqueId,
    this.fname,
    this.lname,
    this.image,
    this.email,
    this.mobile,
    this.gender,
    this.analyticDate,
    this.isBlock,
    this.bio,
    this.fcmToken,
    this.isDelete,
    this.isUpdate,
    this.latitude,
    this.longitude,
    this.password,
    this.loginType,
    this.age,
    this.createdAt,
    this.updatedAt,
  });

  factory UserId.fromJson(Map<String, dynamic> json) => UserId(
    id: json["_id"],
    uniqueId: json["uniqueId"],
    fname: json["fname"],
    lname: json["lname"],
    image: json["image"],
    email: json["email"],
    mobile: json["mobile"],
    gender: json["gender"],
    analyticDate: json["analyticDate"],
    isBlock: json["isBlock"],
    bio: json["bio"],
    fcmToken: json["fcmToken"],
    isDelete: json["isDelete"],
    isUpdate: json["isUpdate"],
    latitude: json["latitude"],
    longitude: json["longitude"],
    password: json["password"],
    loginType: json["loginType"],
    age: json["age"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "uniqueId": uniqueId,
    "fname": fname,
    "lname": lname,
    "image": image,
    "email": email,
    "mobile": mobile,
    "gender": gender,
    "analyticDate": analyticDate,
    "isBlock": isBlock,
    "bio": bio,
    "fcmToken": fcmToken,
    "isDelete": isDelete,
    "isUpdate": isUpdate,
    "latitude": latitude,
    "longitude": longitude,
    "password": password,
    "loginType": loginType,
    "age": age,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}
