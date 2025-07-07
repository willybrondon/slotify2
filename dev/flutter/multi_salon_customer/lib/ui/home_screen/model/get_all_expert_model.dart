import 'dart:convert';

GetAllExpertModel getAllExpertModelFromJson(String str) => GetAllExpertModel.fromJson(json.decode(str));
String getAllExpertModelToJson(GetAllExpertModel data) => json.encode(data.toJson());

class GetAllExpertModel {
  GetAllExpertModel({
    bool? status,
    String? message,
    List<Data>? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  GetAllExpertModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Data>? _data;
  GetAllExpertModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
  }) =>
      GetAllExpertModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Data>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? reviewCount,
    num? review,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
    _reviewCount = reviewCount;
    _review = review;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
    _reviewCount = json['reviewCount'];
    _review = json['review'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  num? _reviewCount;
  num? _review;
  Data copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
    num? reviewCount,
    num? review,
  }) =>
      Data(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
        reviewCount: reviewCount ?? _reviewCount,
        review: review ?? _review,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;
  num? get reviewCount => _reviewCount;
  num? get review => _review;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    map['reviewCount'] = _reviewCount;
    map['review'] = _review;
    return map;
  }
}
