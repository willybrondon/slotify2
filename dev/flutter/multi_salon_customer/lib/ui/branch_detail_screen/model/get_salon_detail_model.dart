// To parse this JSON data, do
//
//     final getSalonDetailModel = getSalonDetailModelFromJson(jsonString);

import 'dart:convert';

GetSalonDetailModel getSalonDetailModelFromJson(String str) =>
    GetSalonDetailModel.fromJson(json.decode(str));

String getSalonDetailModelToJson(GetSalonDetailModel data) =>
    json.encode(data.toJson());

Map<String, dynamic>? _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

String? _asString(dynamic value) {
  if (value == null) return null;
  if (value is String) return value;
  return value.toString();
}

num? _asNum(dynamic value) {
  if (value == null) return null;
  if (value is num) return value;
  if (value is String) return num.tryParse(value);
  return null;
}

int? _asInt(dynamic value) {
  return _asNum(value)?.toInt();
}

double? _asDouble(dynamic value) {
  return _asNum(value)?.toDouble();
}

bool? _asBool(dynamic value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final v = value.toLowerCase();
    if (v == 'true' || v == '1') return true;
    if (v == 'false' || v == '0') return false;
  }
  return null;
}

DateTime? _asDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String && value.isNotEmpty) return DateTime.tryParse(value);
  return null;
}

List<String> _asStringList(dynamic value) {
  if (value is! List) return [];
  return value
      .map((x) {
        if (x == null) return '';
        if (x is String) return x;
        if (x is Map && x['_id'] != null) return x['_id'].toString();
        return x.toString();
      })
      .where((s) => s.isNotEmpty && s != 'null')
      .toList();
}

List<T> _mapList<T>(dynamic value, T? Function(Map<String, dynamic>) parse) {
  if (value is! List) return [];
  final out = <T>[];
  for (final item in value) {
    final map = _asMap(item);
    if (map == null) continue;
    try {
      final parsed = parse(map);
      if (parsed != null) out.add(parsed);
    } catch (_) {}
  }
  return out;
}

class GetSalonDetailModel {
  bool? status;
  String? message;
  Salon? salon;
  List<Product>? product;
  List<dynamic>? reviews;
  List<Expert>? experts;
  num? tax;

  GetSalonDetailModel({
    this.status,
    this.message,
    this.salon,
    this.product,
    this.reviews,
    this.experts,
    this.tax,
  });

  factory GetSalonDetailModel.fromJson(Map<String, dynamic> json) {
    Salon? salon;
    try {
      final salonMap = _asMap(json["salon"]);
      if (salonMap != null) salon = Salon.fromJson(salonMap);
    } catch (_) {}

    return GetSalonDetailModel(
      status: _asBool(json["status"]),
      message: _asString(json["message"]),
      salon: salon,
      product: _mapList(json["product"], Product.fromJson),
      reviews: json["reviews"] is List ? List<dynamic>.from(json["reviews"]) : [],
      experts: _mapList(json["experts"], Expert.fromJson),
      tax: _asNum(json["tax"]),
    );
  }

  Map<String, dynamic> toJson() => {
        "status": status,
        "message": message,
        "salon": salon?.toJson(),
        "product": product == null
            ? []
            : List<dynamic>.from(product!.map((x) => x.toJson())),
        "reviews": reviews == null ? [] : List<dynamic>.from(reviews!),
        "experts": experts == null
            ? []
            : List<dynamic>.from(experts!.map((x) => x.toJson())),
        "tax": tax,
      };
}

class Expert {
  String? id;
  String? fname;
  String? lname;
  String? image;
  List<String>? serviceId;
  double? review;
  int? reviewCount;

  Expert({
    this.id,
    this.fname,
    this.lname,
    this.image,
    this.serviceId,
    this.review,
    this.reviewCount,
  });

  factory Expert.fromJson(Map<String, dynamic> json) => Expert(
        id: _asString(json["_id"] ?? json["id"]),
        fname: _asString(json["fname"]),
        lname: _asString(json["lname"]),
        image: _asString(json["image"]),
        serviceId: _asStringList(json["serviceId"]),
        review: _asDouble(json["review"]),
        reviewCount: _asInt(json["reviewCount"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "fname": fname,
        "lname": lname,
        "image": image,
        "serviceId": serviceId == null
            ? []
            : List<dynamic>.from(serviceId!),
        "review": review,
        "reviewCount": reviewCount,
      };
}

class Product {
  String? id;
  String? productCode;
  num? price;
  num? shippingCharges;
  List<String>? images;
  int? quantity;
  num? review;
  int? sold;
  bool? isOutOfStock;
  String? createStatus;
  String? updateStatus;
  String? productName;
  String? description;
  String? category;
  String? salon;
  String? mainImage;

  Product({
    this.id,
    this.productCode,
    this.price,
    this.shippingCharges,
    this.images,
    this.quantity,
    this.review,
    this.sold,
    this.isOutOfStock,
    this.createStatus,
    this.updateStatus,
    this.productName,
    this.description,
    this.category,
    this.salon,
    this.mainImage,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: _asString(json["_id"] ?? json["id"]),
        productCode: _asString(json["productCode"]),
        price: _asNum(json["price"]),
        shippingCharges: _asNum(json["shippingCharges"]),
        images: _asStringList(json["images"]),
        quantity: _asInt(json["quantity"]),
        review: _asNum(json["review"]),
        sold: _asInt(json["sold"]),
        isOutOfStock: _asBool(json["isOutOfStock"]),
        createStatus: _asString(json["createStatus"]),
        updateStatus: _asString(json["updateStatus"]),
        productName: _asString(json["productName"]),
        description: _asString(json["description"]),
        category: _asString(json["category"]),
        salon: _asString(json["salon"]),
        mainImage: _asString(json["mainImage"]),
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "productCode": productCode,
        "price": price,
        "shippingCharges": shippingCharges,
        "images": images == null ? [] : List<dynamic>.from(images!),
        "quantity": quantity,
        "review": review,
        "sold": sold,
        "isOutOfStock": isOutOfStock,
        "createStatus": createStatus,
        "updateStatus": updateStatus,
        "productName": productName,
        "description": description,
        "category": category,
        "salon": salon,
        "mainImage": mainImage,
      };
}

class Salon {
  AddressDetails? addressDetails;
  LocationCoordinates? locationCoordinates;
  bool? isBestSeller;
  String? id;
  String? name;
  String? email;
  String? mobile;
  String? about;
  num? platformFee;
  double? review;
  int? reviewCount;
  bool? isActive;
  bool? isDelete;
  List<String>? image;
  String? mainImage;
  bool? flag;
  List<SalonTime>? salonTime;
  List<ServiceId>? serviceIds;
  String? password;
  num? uniqueId;
  DateTime? createdAt;
  DateTime? updatedAt;
  double? distance;
  PaymentOptions? paymentOptions;

  Salon({
    this.addressDetails,
    this.locationCoordinates,
    this.isBestSeller,
    this.id,
    this.name,
    this.email,
    this.mobile,
    this.about,
    this.platformFee,
    this.review,
    this.reviewCount,
    this.isActive,
    this.isDelete,
    this.image,
    this.mainImage,
    this.flag,
    this.salonTime,
    this.serviceIds,
    this.password,
    this.uniqueId,
    this.createdAt,
    this.updatedAt,
    this.distance,
    this.paymentOptions,
  });

  factory Salon.fromJson(Map<String, dynamic> json) {
    AddressDetails? addressDetails;
    final addressMap = _asMap(json["addressDetails"]);
    if (addressMap != null) {
      try {
        addressDetails = AddressDetails.fromJson(addressMap);
      } catch (_) {}
    }

    LocationCoordinates? locationCoordinates;
    final locMap = _asMap(json["locationCoordinates"]);
    if (locMap != null) {
      try {
        locationCoordinates = LocationCoordinates.fromJson(locMap);
      } catch (_) {}
    }

    final image = _asStringList(json["image"]);
    var mainImage = _asString(json["mainImage"] ?? json["heroImage"]);
    if ((mainImage == null || mainImage.isEmpty) && image.isNotEmpty) {
      mainImage = image.first;
    }

    PaymentOptions? paymentOptions;
    final payMap = _asMap(json["paymentOptions"]);
    if (payMap != null) {
      try {
        paymentOptions = PaymentOptions.fromJson(payMap);
      } catch (_) {}
    }

    return Salon(
      addressDetails: addressDetails,
      locationCoordinates: locationCoordinates,
      isBestSeller: _asBool(json["isBestSeller"]),
      id: _asString(json["_id"] ?? json["id"]),
      name: _asString(json["name"]),
      email: _asString(json["email"]),
      mobile: _asString(json["mobile"]),
      about: _asString(json["about"]),
      platformFee: _asNum(json["platformFee"]),
      review: _asDouble(json["review"]),
      reviewCount: _asInt(json["reviewCount"]),
      isActive: _asBool(json["isActive"]),
      isDelete: _asBool(json["isDelete"]),
      image: image,
      mainImage: mainImage,
      flag: _asBool(json["flag"]),
      salonTime: _mapList(json["salonTime"], SalonTime.fromJson),
      serviceIds: _mapList(json["serviceIds"], ServiceId.fromJson),
      password: _asString(json["password"]),
      uniqueId: _asNum(json["uniqueId"]),
      createdAt: _asDate(json["createdAt"]),
      updatedAt: _asDate(json["updatedAt"]),
      distance: _asDouble(json["distance"]),
      paymentOptions: paymentOptions,
    );
  }

  Map<String, dynamic> toJson() => {
        "addressDetails": addressDetails?.toJson(),
        "locationCoordinates": locationCoordinates?.toJson(),
        "isBestSeller": isBestSeller,
        "_id": id,
        "name": name,
        "email": email,
        "mobile": mobile,
        "about": about,
        "platformFee": platformFee,
        "review": review,
        "reviewCount": reviewCount,
        "isActive": isActive,
        "isDelete": isDelete,
        "image": image == null ? [] : List<dynamic>.from(image!),
        "mainImage": mainImage,
        "flag": flag,
        "salonTime": salonTime == null
            ? []
            : List<dynamic>.from(salonTime!.map((x) => x.toJson())),
        "serviceIds": serviceIds == null
            ? []
            : List<dynamic>.from(serviceIds!.map((x) => x.toJson())),
        "password": password,
        "uniqueId": uniqueId,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "distance": distance,
        "paymentOptions": paymentOptions?.toJson(),
      };
}

class PaymentOptions {
  bool? acceptCash;
  bool? acceptStripe;
  bool? stripePreference;
  bool? stripeConnectReady;
  String? salonName;

  PaymentOptions({
    this.acceptCash,
    this.acceptStripe,
    this.stripePreference,
    this.stripeConnectReady,
    this.salonName,
  });

  factory PaymentOptions.fromJson(Map<String, dynamic> json) => PaymentOptions(
        acceptCash: json["acceptCash"],
        acceptStripe: json["acceptStripe"],
        stripePreference: json["stripePreference"],
        stripeConnectReady: json["stripeConnectReady"],
        salonName: json["salonName"],
      );

  Map<String, dynamic> toJson() => {
        "acceptCash": acceptCash,
        "acceptStripe": acceptStripe,
        "stripePreference": stripePreference,
        "stripeConnectReady": stripeConnectReady,
        "salonName": salonName,
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
        addressLine1: _asString(json["addressLine1"]),
        landMark: _asString(json["landMark"]),
        city: _asString(json["city"]),
        state: _asString(json["state"]),
        country: _asString(json["country"]),
      );

  String get formatted => [addressLine1, landMark, city, state, country]
      .whereType<String>()
      .map((p) => p.trim())
      .where((p) => p.isNotEmpty && p.toLowerCase() != 'null')
      .join(', ');

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

  factory LocationCoordinates.fromJson(Map<String, dynamic> json) =>
      LocationCoordinates(
        latitude: _asString(json["latitude"]),
        longitude: _asString(json["longitude"]),
      );

  Map<String, dynamic> toJson() => {
        "latitude": latitude,
        "longitude": longitude,
      };
}

class SalonTime {
  String? day;
  String? openTime;
  String? closedTime;
  bool? isActive;
  bool? isBreak;
  String? breakTime;
  String? breakStartTime;
  String? breakEndTime;
  int? time;
  String? id;

  SalonTime({
    this.day,
    this.openTime,
    this.closedTime,
    this.isActive,
    this.isBreak,
    this.breakTime,
    this.breakStartTime,
    this.breakEndTime,
    this.time,
    this.id,
  });

  factory SalonTime.fromJson(Map<String, dynamic> json) => SalonTime(
        day: _asString(json["day"]),
        openTime: _asString(json["openTime"]),
        closedTime: _asString(json["closedTime"]),
        isActive: _asBool(json["isActive"]),
        isBreak: _asBool(json["isBreak"]),
        breakTime: _asString(json["breakTime"]),
        breakStartTime: _asString(json["breakStartTime"]),
        breakEndTime: _asString(json["breakEndTime"]),
        time: _asInt(json["time"]),
        id: _asString(json["_id"] ?? json["id"]),
      );

  Map<String, dynamic> toJson() => {
        "day": day,
        "openTime": openTime,
        "closedTime": closedTime,
        "isActive": isActive,
        "isBreak": isBreak,
        "breakTime": breakTime,
        "breakStartTime": breakStartTime,
        "breakEndTime": breakEndTime,
        "time": time,
        "_id": id,
      };
}

class ServiceId {
  Id? serviceIdId;
  num? price;
  String? id;

  ServiceId({
    this.serviceIdId,
    this.price,
    this.id,
  });

  factory ServiceId.fromJson(Map<String, dynamic> json) {
    Id? serviceIdId;
    final rawId = json["id"] ?? json["serviceId"];
    final idMap = _asMap(rawId);
    if (idMap != null) {
      serviceIdId = Id.fromJson(idMap);
    }
    return ServiceId(
      serviceIdId: serviceIdId,
      price: _asNum(json["price"]),
      id: _asString(json["_id"]),
    );
  }

  Map<String, dynamic> toJson() => {
        "id": serviceIdId?.toJson(),
        "price": price,
        "_id": id,
      };
}

class Id {
  String? id;
  bool? status;
  bool? isDelete;
  String? name;
  int? duration;
  String? categoryId;
  String? categoryName;
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
    this.categoryName,
    this.image,
    this.createdAt,
    this.updatedAt,
  });

  String get categoryKey => categoryId?.trim().isNotEmpty == true ? categoryId! : 'other';

  String get categoryLabel =>
      categoryName?.trim().isNotEmpty == true ? categoryName!.trim() : 'Autres';

  factory Id.fromJson(Map<String, dynamic> json) {
    String? catId;
    String? catName;
    final rawCat = json["categoryId"];
    if (rawCat is Map) {
      catId = _asString(rawCat["_id"]);
      catName = _asString(rawCat["name"] ?? rawCat["nameFr"] ?? rawCat["nameEn"]);
    } else if (rawCat != null) {
      catId = _asString(rawCat);
    }
    catName ??= _asString(json["categoryName"]);

    return Id(
      id: _asString(json["_id"] ?? json["id"]),
      status: _asBool(json["status"]),
      isDelete: _asBool(json["isDelete"]),
      name: _asString(json["name"] ?? json["nameFr"] ?? json["nameEn"]),
      duration: _asInt(json["duration"]),
      categoryId: catId,
      categoryName: catName,
      image: _asString(json["image"]),
      createdAt: _asDate(json["createdAt"]),
      updatedAt: _asDate(json["updatedAt"]),
    );
  }

  Map<String, dynamic> toJson() => {
        "_id": id,
        "status": status,
        "isDelete": isDelete,
        "name": name,
        "duration": duration,
        "categoryId": categoryId,
        "categoryName": categoryName,
        "image": image,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}
