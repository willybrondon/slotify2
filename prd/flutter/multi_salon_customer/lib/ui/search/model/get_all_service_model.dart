// To parse this JSON data, do
//
//     final getAllServiceModel = getAllServiceModelFromJson(jsonString);

import 'dart:convert';

GetAllServiceModel getAllServiceModelFromJson(String str) => GetAllServiceModel.fromJson(json.decode(str));

String getAllServiceModelToJson(GetAllServiceModel data) => json.encode(data.toJson());

class GetAllServiceModel {
  bool? status;
  String? message;
  int? total;
  List<Service>? services;
  int? tax;

  GetAllServiceModel({
    this.status,
    this.message,
    this.total,
    this.services,
    this.tax,
  });

  factory GetAllServiceModel.fromJson(Map<String, dynamic> json) => GetAllServiceModel(
        status: json["status"],
        message: json["message"],
        total: json["total"],
        services: json["services"] == null ? [] : List<Service>.from(json["services"]!.map((x) => Service.fromJson(x))),
        tax: json["tax"],
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "total": total,
        "services": services == null ? [] : List<dynamic>.from(services!.map((x) => x.toJson())),
        "tax": tax,
      };
}

class Service {
  String? id;
  bool? status;
  String? name;
  int? duration;
  String? image;
  DateTime? createdAt;
  String? categoryId;
  String? categoryname;

  Service({
    this.id,
    this.status,
    this.name,
    this.duration,
    this.image,
    this.createdAt,
    this.categoryId,
    this.categoryname,
  });

  factory Service.fromJson(Map<String, dynamic> json) => Service(
        id: json["_id"],
        status: json["status"],
        name: json["name"],
        duration: json["duration"],
        image: json["image"],
        createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
        categoryId: json["categoryId"],
        categoryname: json["categoryname"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "status": status,
        "name": name,
        "duration": duration,
        "image": image,
        "createdAt": createdAt?.toIso8601String(),
        "categoryId": categoryId,
        "categoryname": categoryname,
      };
}
