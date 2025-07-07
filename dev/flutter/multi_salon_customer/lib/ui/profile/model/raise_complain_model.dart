import 'dart:convert';
RaiseComplainModel raiseComplainModelFromJson(String str) => RaiseComplainModel.fromJson(json.decode(str));
String raiseComplainModelToJson(RaiseComplainModel data) => json.encode(data.toJson());
class RaiseComplainModel {
  RaiseComplainModel({
      bool? status, 
      String? message, 
      Complain? complain,}){
    _status = status;
    _message = message;
    _complain = complain;
}

  RaiseComplainModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _complain = json['complain'] != null ? Complain.fromJson(json['complain']) : null;
  }
  bool? _status;
  String? _message;
  Complain? _complain;
RaiseComplainModel copyWith({  bool? status,
  String? message,
  Complain? complain,
}) => RaiseComplainModel(  status: status ?? _status,
  message: message ?? _message,
  complain: complain ?? _complain,
);
  bool? get status => _status;
  String? get message => _message;
  Complain? get complain => _complain;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_complain != null) {
      map['complain'] = _complain?.toJson();
    }
    return map;
  }

}

Complain complainFromJson(String str) => Complain.fromJson(json.decode(str));
String complainToJson(Complain data) => json.encode(data.toJson());
class Complain {
  Complain({
      num? bookingId, 
      String? details, 
      String? image, 
      num? type, 
      String? date, 
      String? id, 
      String? userId, 
      num? person, 
      String? bookingData,}){
    _bookingId = bookingId;
    _details = details;
    _image = image;
    _type = type;
    _date = date;
    _id = id;
    _userId = userId;
    _person = person;
    _bookingData = bookingData;
}

  Complain.fromJson(dynamic json) {
    _bookingId = json['bookingId'];
    _details = json['details'];
    _image = json['image'];
    _type = json['type'];
    _date = json['date'];
    _id = json['_id'];
    _userId = json['userId'];
    _person = json['person'];
    _bookingData = json['bookingData'];
  }
  num? _bookingId;
  String? _details;
  String? _image;
  num? _type;
  String? _date;
  String? _id;
  String? _userId;
  num? _person;
  String? _bookingData;
Complain copyWith({  num? bookingId,
  String? details,
  String? image,
  num? type,
  String? date,
  String? id,
  String? userId,
  num? person,
  String? bookingData,
}) => Complain(  bookingId: bookingId ?? _bookingId,
  details: details ?? _details,
  image: image ?? _image,
  type: type ?? _type,
  date: date ?? _date,
  id: id ?? _id,
  userId: userId ?? _userId,
  person: person ?? _person,
  bookingData: bookingData ?? _bookingData,
);
  num? get bookingId => _bookingId;
  String? get details => _details;
  String? get image => _image;
  num? get type => _type;
  String? get date => _date;
  String? get id => _id;
  String? get userId => _userId;
  num? get person => _person;
  String? get bookingData => _bookingData;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['bookingId'] = _bookingId;
    map['details'] = _details;
    map['image'] = _image;
    map['type'] = _type;
    map['date'] = _date;
    map['_id'] = _id;
    map['userId'] = _userId;
    map['person'] = _person;
    map['bookingData'] = _bookingData;
    return map;
  }

}