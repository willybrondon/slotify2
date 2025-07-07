import 'dart:convert';
GetAllCategoryModel getAllCategoryModelFromJson(String str) => GetAllCategoryModel.fromJson(json.decode(str));
String getAllCategoryModelToJson(GetAllCategoryModel data) => json.encode(data.toJson());
class GetAllCategoryModel {
  GetAllCategoryModel({
      bool? status, 
      String? message, 
      List<Data>? data,}){
    _status = status;
    _message = message;
    _data = data;
}

  GetAllCategoryModel.fromJson(dynamic json) {
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
GetAllCategoryModel copyWith({  bool? status,
  String? message,
  List<Data>? data,
}) => GetAllCategoryModel(  status: status ?? _status,
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
      bool? status, 
      String? name, 
      String? image,}){
    _id = id;
    _status = status;
    _name = name;
    _image = image;
}

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _status = json['status'];
    _name = json['name'];
    _image = json['image'];
  }
  String? _id;
  bool? _status;
  String? _name;
  String? _image;
Data copyWith({  String? id,
  bool? status,
  String? name,
  String? image,
}) => Data(  id: id ?? _id,
  status: status ?? _status,
  name: name ?? _name,
  image: image ?? _image,
);
  String? get id => _id;
  bool? get status => _status;
  String? get name => _name;
  String? get image => _image;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['status'] = _status;
    map['name'] = _name;
    map['image'] = _image;
    return map;
  }

}