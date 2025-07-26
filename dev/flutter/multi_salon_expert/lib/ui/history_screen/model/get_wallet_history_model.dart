import 'dart:convert';

GetWalletHistoryModel getWalletHistoryModelFromJson(String str) => GetWalletHistoryModel.fromJson(json.decode(str));
String getWalletHistoryModelToJson(GetWalletHistoryModel data) => json.encode(data.toJson());

class GetWalletHistoryModel {
  GetWalletHistoryModel({
    bool? status,
    String? message,
    num? total,
    List<Data>? data,
  }) {
    _status = status;
    _message = message;
    _total = total;
    _data = data;
  }

  GetWalletHistoryModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _total = json['total'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(Data.fromJson(v));
      });
    }
  }
  bool? _status;
  String? _message;
  num? _total;
  List<Data>? _data;
  GetWalletHistoryModel copyWith({
    bool? status,
    String? message,
    num? total,
    List<Data>? data,
  }) =>
      GetWalletHistoryModel(
        status: status ?? _status,
        message: message ?? _message,
        total: total ?? _total,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  num? get total => _total;
  List<Data>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    map['total'] = _total;
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
    String? uniqueId,
    num? amount,
    num? type,
    num? payoutStatus,
    String? date,
    String? time,
  }) {
    _id = id;
    _uniqueId = uniqueId;
    _amount = amount;
    _type = type;
    _payoutStatus = payoutStatus;
    _date = date;
    _time = time;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _uniqueId = json['uniqueId'];
    _amount = json['amount'];
    _type = json['type'];
    _payoutStatus = json['payoutStatus'];
    _date = json['date'];
    _time = json['time'];
  }
  String? _id;
  String? _uniqueId;
  num? _amount;
  num? _type;
  num? _payoutStatus;
  String? _date;
  String? _time;
  Data copyWith({
    String? id,
    String? uniqueId,
    num? amount,
    num? type,
    num? payoutStatus,
    String? date,
    String? time,
  }) =>
      Data(
        id: id ?? _id,
        uniqueId: uniqueId ?? _uniqueId,
        amount: amount ?? _amount,
        type: type ?? _type,
        payoutStatus: payoutStatus ?? _payoutStatus,
        date: date ?? _date,
        time: time ?? _time,
      );
  String? get id => _id;
  String? get uniqueId => _uniqueId;
  num? get amount => _amount;
  num? get type => _type;
  num? get payoutStatus => _payoutStatus;
  String? get date => _date;
  String? get time => _time;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['uniqueId'] = _uniqueId;
    map['amount'] = _amount;
    map['type'] = _type;
    map['payoutStatus'] = _payoutStatus;
    map['date'] = _date;
    map['time'] = _time;
    return map;
  }
}
