import 'dart:convert';

class GetComplainModel {
  bool? status;
  String? message;
  List<Complain>? complain;

  GetComplainModel({
    this.status,
    this.message,
    this.complain,
  });

  factory GetComplainModel.fromRawJson(String str) => GetComplainModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory GetComplainModel.fromJson(Map<String, dynamic> json) => GetComplainModel(
    status: json["status"],
    message: json["message"],
    complain: json["complain"] == null ? [] : List<Complain>.from(json["complain"]!.map((x) => Complain.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "message": message,
    "complain": complain == null ? [] : List<dynamic>.from(complain!.map((x) => x.toJson())),
  };
}

class Complain {
  String? id;
  int? bookingId;
  String? details;
  String? image;
  int? type;
  String? date;
  String? userId;
  int? person;
  String? bookingData;
  String? solvedDate;

  Complain({
    this.id,
    this.bookingId,
    this.details,
    this.image,
    this.type,
    this.date,
    this.userId,
    this.person,
    this.bookingData,
    this.solvedDate,
  });

  factory Complain.fromRawJson(String str) => Complain.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Complain.fromJson(Map<String, dynamic> json) => Complain(
    id: json["_id"],
    bookingId: json["bookingId"],
    details: json["details"],
    image: json["image"],
    type: json["type"],
    date: json["date"],
    userId: json["userId"],
    person: json["person"],
    bookingData: json["bookingData"],
    solvedDate: json["solvedDate"],
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "bookingId": bookingId,
    "details": details,
    "image": image,
    "type": type,
    "date": date,
    "userId": userId,
    "person": person,
    "bookingData": bookingData,
    "solvedDate": solvedDate,
  };
}
