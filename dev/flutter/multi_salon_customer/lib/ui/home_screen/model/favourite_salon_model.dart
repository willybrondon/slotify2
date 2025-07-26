import 'dart:convert';
FavouriteSalonModel favouriteSalonModelFromJson(String str) => FavouriteSalonModel.fromJson(json.decode(str));
String favouriteSalonModelToJson(FavouriteSalonModel data) => json.encode(data.toJson());
class FavouriteSalonModel {
  FavouriteSalonModel({
      bool? status, 
      String? message, 
      bool? isFavourite,}){
    _status = status;
    _message = message;
    _isFavourite = isFavourite;
}

  FavouriteSalonModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _isFavourite = json['isFavourite'];
  }
  bool? _status;
  String? _message;
  bool? _isFavourite;
FavouriteSalonModel copyWith({  bool? status,
  String? message,
  bool? isFavourite,
}) => FavouriteSalonModel(  status: status ?? _status,
  message: message ?? _message,
  isFavourite: isFavourite ?? _isFavourite,
);
  bool? get status => _status;
  String? get message => _message;
  bool? get isFavourite => _isFavourite;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['isFavourite'] = _isFavourite;
    return map;
  }

}