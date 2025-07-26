import 'dart:convert';

UpdateWithdrawMethodModel updateWithdrawMethodModelFromJson(String str) => UpdateWithdrawMethodModel.fromJson(json.decode(str));
String updateWithdrawMethodModelToJson(UpdateWithdrawMethodModel data) => json.encode(data.toJson());

class UpdateWithdrawMethodModel {
  UpdateWithdrawMethodModel({
    bool? status,
    String? message,
    Data? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  UpdateWithdrawMethodModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _data = json['data'] != null ? Data.fromJson(json['data']) : null;
  }
  bool? _status;
  String? _message;
  Data? _data;
  UpdateWithdrawMethodModel copyWith({
    bool? status,
    String? message,
    Data? data,
  }) =>
      UpdateWithdrawMethodModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  Data? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.toJson();
    }
    return map;
  }
}

Data dataFromJson(String str) => Data.fromJson(json.decode(str));
String dataToJson(Data data) => json.encode(data.toJson());

class Data {
  Data({
    String? expert,
    List<PaymentMethods>? paymentMethods,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) {
    _expert = expert;
    _paymentMethods = paymentMethods;
    _id = id;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Data.fromJson(dynamic json) {
    _expert = json['expert'];
    if (json['paymentMethods'] != null) {
      _paymentMethods = [];
      json['paymentMethods'].forEach((v) {
        _paymentMethods?.add(PaymentMethods.fromJson(v));
      });
    }
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _expert;
  List<PaymentMethods>? _paymentMethods;
  String? _id;
  String? _createdAt;
  String? _updatedAt;
  Data copyWith({
    String? expert,
    List<PaymentMethods>? paymentMethods,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) =>
      Data(
        expert: expert ?? _expert,
        paymentMethods: paymentMethods ?? _paymentMethods,
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get expert => _expert;
  List<PaymentMethods>? get paymentMethods => _paymentMethods;
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['expert'] = _expert;
    if (_paymentMethods != null) {
      map['paymentMethods'] = _paymentMethods?.map((v) => v.toJson()).toList();
    }
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

PaymentMethods paymentMethodsFromJson(String str) => PaymentMethods.fromJson(json.decode(str));
String paymentMethodsToJson(PaymentMethods data) => json.encode(data.toJson());

class PaymentMethods {
  PaymentMethods({
    String? paymentGateway,
    List<String>? paymentDetails,
    String? id,
  }) {
    _paymentGateway = paymentGateway;
    _paymentDetails = paymentDetails;
    _id = id;
  }

  PaymentMethods.fromJson(dynamic json) {
    _paymentGateway = json['paymentGateway'];
    _paymentDetails = json['paymentDetails'] != null ? json['paymentDetails'].cast<String>() : [];
    _id = json['_id'];
  }
  String? _paymentGateway;
  List<String>? _paymentDetails;
  String? _id;
  PaymentMethods copyWith({
    String? paymentGateway,
    List<String>? paymentDetails,
    String? id,
  }) =>
      PaymentMethods(
        paymentGateway: paymentGateway ?? _paymentGateway,
        paymentDetails: paymentDetails ?? _paymentDetails,
        id: id ?? _id,
      );
  String? get paymentGateway => _paymentGateway;
  List<String>? get paymentDetails => _paymentDetails;
  String? get id => _id;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['paymentGateway'] = _paymentGateway;
    map['paymentDetails'] = _paymentDetails;
    map['_id'] = _id;
    return map;
  }
}
