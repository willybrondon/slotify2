import 'dart:convert';

GetFavouriteSalonModel getFavouriteSalonModelFromJson(String str) => GetFavouriteSalonModel.fromJson(json.decode(str));
String getFavouriteSalonModelToJson(GetFavouriteSalonModel data) => json.encode(data.toJson());

class GetFavouriteSalonModel {
  GetFavouriteSalonModel({
    bool? status,
    String? message,
    List<Favourite>? favourite,
  }) {
    _status = status;
    _message = message;
    _favourite = favourite;
  }

  GetFavouriteSalonModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    if (json['favourite'] != null) {
      _favourite = [];
      json['favourite'].forEach((v) {
        _favourite?.add(Favourite.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  List<Favourite>? _favourite;
  GetFavouriteSalonModel copyWith({
    bool? status,
    String? message,
    List<Favourite>? favourite,
  }) =>
      GetFavouriteSalonModel(
        status: status ?? _status,
        message: message ?? _message,
        favourite: favourite ?? _favourite,
      );
  bool? get status => _status;
  String? get message => _message;
  List<Favourite>? get favourite => _favourite;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_favourite != null) {
      map['favourite'] = _favourite?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Favourite favouriteFromJson(String str) => Favourite.fromJson(json.decode(str));
String favouriteToJson(Favourite data) => json.encode(data.toJson());

class Favourite {
  Favourite({
    String? id,
    String? createdAt,
    String? salonName,
    String? mainImage,
    Address? address,
    num? review,
    num? reviewCount,
    LocationCoordinates? locationCoordinates,
    num? distance,
  }) {
    _id = id;
    _createdAt = createdAt;
    _salonName = salonName;
    _mainImage = mainImage;
    _address = address;
    _review = review;
    _reviewCount = reviewCount;
    _locationCoordinates = locationCoordinates;
    _distance = distance;
  }

  Favourite.fromJson(dynamic json) {
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _salonName = json['salonName'];
    _mainImage = json['mainImage'];
    _address = json['address'] != null ? Address.fromJson(json['address']) : null;
    _review = json['review'];
    _reviewCount = json['reviewCount'];
    _locationCoordinates = json['locationCoordinates'] != null ? LocationCoordinates.fromJson(json['locationCoordinates']) : null;
    _distance = json['distance'];
  }
  String? _id;
  String? _createdAt;
  String? _salonName;
  String? _mainImage;
  Address? _address;
  num? _review;
  num? _reviewCount;
  LocationCoordinates? _locationCoordinates;
  num? _distance;
  Favourite copyWith({
    String? id,
    String? createdAt,
    String? salonName,
    String? mainImage,
    Address? address,
    num? review,
    num? reviewCount,
    LocationCoordinates? locationCoordinates,
    num? distance,
  }) =>
      Favourite(
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        salonName: salonName ?? _salonName,
        mainImage: mainImage ?? _mainImage,
        address: address ?? _address,
        review: review ?? _review,
        reviewCount: reviewCount ?? _reviewCount,
        locationCoordinates: locationCoordinates ?? _locationCoordinates,
        distance: distance ?? _distance,
      );
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get salonName => _salonName;
  String? get mainImage => _mainImage;
  Address? get address => _address;
  num? get review => _review;
  num? get reviewCount => _reviewCount;
  LocationCoordinates? get locationCoordinates => _locationCoordinates;
  num? get distance => _distance;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['salonName'] = _salonName;
    map['mainImage'] = _mainImage;
    if (_address != null) {
      map['address'] = _address?.toJson();
    }
    map['review'] = _review;
    map['reviewCount'] = _reviewCount;
    if (_locationCoordinates != null) {
      map['locationCoordinates'] = _locationCoordinates?.toJson();
    }
    map['distance'] = _distance;
    return map;
  }
}

LocationCoordinates locationCoordinatesFromJson(String str) => LocationCoordinates.fromJson(json.decode(str));
String locationCoordinatesToJson(LocationCoordinates data) => json.encode(data.toJson());

class LocationCoordinates {
  LocationCoordinates({
    String? latitude,
    String? longitude,
  }) {
    _latitude = latitude;
    _longitude = longitude;
  }

  LocationCoordinates.fromJson(dynamic json) {
    _latitude = json['latitude'];
    _longitude = json['longitude'];
  }
  String? _latitude;
  String? _longitude;
  LocationCoordinates copyWith({
    String? latitude,
    String? longitude,
  }) =>
      LocationCoordinates(
        latitude: latitude ?? _latitude,
        longitude: longitude ?? _longitude,
      );
  String? get latitude => _latitude;
  String? get longitude => _longitude;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['latitude'] = _latitude;
    map['longitude'] = _longitude;
    return map;
  }
}

Address addressFromJson(String str) => Address.fromJson(json.decode(str));
String addressToJson(Address data) => json.encode(data.toJson());

class Address {
  Address({
    String? addressLine1,
    String? landMark,
    String? city,
    String? state,
    String? country,
  }) {
    _addressLine1 = addressLine1;
    _landMark = landMark;
    _city = city;
    _state = state;
    _country = country;
  }

  Address.fromJson(dynamic json) {
    _addressLine1 = json['addressLine1'];
    _landMark = json['landMark'];
    _city = json['city'];
    _state = json['state'];
    _country = json['country'];
  }
  String? _addressLine1;
  String? _landMark;
  String? _city;
  String? _state;
  String? _country;
  Address copyWith({
    String? addressLine1,
    String? landMark,
    String? city,
    String? state,
    String? country,
  }) =>
      Address(
        addressLine1: addressLine1 ?? _addressLine1,
        landMark: landMark ?? _landMark,
        city: city ?? _city,
        state: state ?? _state,
        country: country ?? _country,
      );
  String? get addressLine1 => _addressLine1;
  String? get landMark => _landMark;
  String? get city => _city;
  String? get state => _state;
  String? get country => _country;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['addressLine1'] = _addressLine1;
    map['landMark'] = _landMark;
    map['city'] = _city;
    map['state'] = _state;
    map['country'] = _country;
    return map;
  }
}
