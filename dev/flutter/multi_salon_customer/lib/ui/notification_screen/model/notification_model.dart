import 'dart:convert';

NotificationModel notificationModelFromJson(String str) => NotificationModel.fromJson(json.decode(str));
String notificationModelToJson(NotificationModel data) => json.encode(data.toJson());

class NotificationModel {
  NotificationModel({
    bool? status,
    String? message,
    List<Notification>? notification,
  }) {
    _status = status;
    _message = message;
    _notification = notification;
  }

  NotificationModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['notification'] != null) {
      _notification = [];
      json['notification'].forEach((v) {
        _notification?.add(Notification.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Notification>? _notification;
  NotificationModel copyWith({
    bool? status,
    String? message,
    List<Notification>? notification,
  }) =>
      NotificationModel(
        status: status ?? _status,
        message: message ?? _message,
        notification: notification ?? _notification,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Notification>? get notification => _notification;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_notification != null) {
      map['notification'] = _notification?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Notification notificationFromJson(String str) => Notification.fromJson(json.decode(str));
String notificationToJson(Notification data) => json.encode(data.toJson());

class Notification {
  Notification({
    String? id,
    String? userId,
    String? title,
    String? image,
    String? message,
    num? notificationType,
    String? date,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _userId = userId;
    _title = title;
    _image = image;
    _message = message;
    _notificationType = notificationType;
    _date = date;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Notification.fromJson(dynamic json) {
    _id = json['_id'];
    _userId = json['userId'];
    _title = json['title'];
    _image = json['image'];
    _message = json['message'];
    _notificationType = json['notificationType'];
    _date = json['date'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  String? _userId;
  String? _title;
  String? _image;
  String? _message;
  num? _notificationType;
  String? _date;
  String? _createdAt;
  String? _updatedAt;
  Notification copyWith({
    String? id,
    String? userId,
    String? title,
    String? image,
    String? message,
    num? notificationType,
    String? date,
    String? createdAt,
    String? updatedAt,
  }) =>
      Notification(
        id: id ?? _id,
        userId: userId ?? _userId,
        title: title ?? _title,
        image: image ?? _image,
        message: message ?? _message,
        notificationType: notificationType ?? _notificationType,
        date: date ?? _date,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  String? get userId => _userId;
  String? get title => _title;
  String? get image => _image;
  String? get message => _message;
  num? get notificationType => _notificationType;
  String? get date => _date;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['userId'] = _userId;
    map['title'] = _title;
    map['image'] = _image;
    map['message'] = _message;
    map['notificationType'] = _notificationType;
    map['date'] = _date;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}
