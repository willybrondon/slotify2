import 'dart:convert';

StatusWiseBookingModel statusWiseBookingModelFromJson(String str) => StatusWiseBookingModel.fromJson(json.decode(str));
String statusWiseBookingModelToJson(StatusWiseBookingModel data) => json.encode(data.toJson());

class StatusWiseBookingModel {
  StatusWiseBookingModel({
    bool? status,
    String? message,
    List<Data>? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  StatusWiseBookingModel.fromJson(dynamic json) {
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
  StatusWiseBookingModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
  }) =>
      StatusWiseBookingModel(
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
    List<String>? time,
    String? status,
    String? date,
    String? paymentType,
    num? amount,
    num? withoutTax,
    num? expertEarning,
    String? bookingId,
    String? createdAt,
    String? updatedAt,
    User? user,
    Expert? expert,
    List<Service>? service,
    List<Category>? category,
  }) {
    _id = id;
    _time = time;
    _status = status;
    _date = date;
    _paymentType = paymentType;
    _amount = amount;
    _withoutTax = withoutTax;
    _expertEarning = expertEarning;
    _bookingId = bookingId;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _user = user;
    _expert = expert;
    _service = service;
    _category = category;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _time = json['time'] != null ? json['time'].cast<String>() : [];
    _status = json['status'];
    _date = json['date'];
    _paymentType = json['paymentType'];
    _amount = json['amount'];
    _withoutTax = json['withoutTax'];
    _expertEarning = json['expertEarning'];
    _bookingId = json['bookingId'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _user = json['user'] != null ? User.fromJson(json['user']) : null;
    _expert = json['expert'] != null ? Expert.fromJson(json['expert']) : null;
    if (json['service'] != null) {
      _service = [];
      json['service'].forEach((v) {
        _service?.add(Service.fromJson(v));
      });
    }
    if (json['category'] != null) {
      _category = [];
      json['category'].forEach((v) {
        _category?.add(Category.fromJson(v));
      });
    }
  }
  String? _id;
  List<String>? _time;
  String? _status;
  String? _date;
  String? _paymentType;
  num? _amount;
  num? _withoutTax;
  num? _expertEarning;
  String? _bookingId;
  String? _createdAt;
  String? _updatedAt;
  User? _user;
  Expert? _expert;
  List<Service>? _service;
  List<Category>? _category;
  Data copyWith({
    String? id,
    List<String>? time,
    String? status,
    String? date,
    String? paymentType,
    num? amount,
    num? withoutTax,
    num? expertEarning,
    String? bookingId,
    String? createdAt,
    String? updatedAt,
    User? user,
    Expert? expert,
    List<Service>? service,
    List<Category>? category,
  }) =>
      Data(
        id: id ?? _id,
        time: time ?? _time,
        status: status ?? _status,
        date: date ?? _date,
        paymentType: paymentType ?? _paymentType,
        amount: amount ?? _amount,
        withoutTax: withoutTax ?? _withoutTax,
        expertEarning: expertEarning ?? _expertEarning,
        bookingId: bookingId ?? _bookingId,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        user: user ?? _user,
        expert: expert ?? _expert,
        service: service ?? _service,
        category: category ?? _category,
      );
  String? get id => _id;
  List<String>? get time => _time;
  String? get status => _status;
  String? get date => _date;
  String? get paymentType => _paymentType;
  num? get amount => _amount;
  num? get withoutTax => _withoutTax;
  num? get expertEarning => _expertEarning;
  String? get bookingId => _bookingId;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  User? get user => _user;
  Expert? get expert => _expert;
  List<Service>? get service => _service;
  List<Category>? get category => _category;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['time'] = _time;
    map['status'] = _status;
    map['date'] = _date;
    map['paymentType'] = _paymentType;
    map['amount'] = _amount;
    map['withoutTax'] = _withoutTax;
    map['expertEarning'] = _expertEarning;
    map['bookingId'] = _bookingId;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    if (_user != null) {
      map['user'] = _user?.toJson();
    }
    if (_expert != null) {
      map['expert'] = _expert?.toJson();
    }
    if (_service != null) {
      map['service'] = _service?.map((v) => v.toJson()).toList();
    }
    if (_category != null) {
      map['category'] = _category?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

Category categoryFromJson(String str) => Category.fromJson(json.decode(str));
String categoryToJson(Category data) => json.encode(data.toJson());

class Category {
  Category({
    String? id,
    String? name,
    String? image,
  }) {
    _id = id;
    _name = name;
    _image = image;
  }

  Category.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _image = json['image'];
  }
  String? _id;
  String? _name;
  String? _image;
  Category copyWith({
    String? id,
    String? name,
    String? image,
  }) =>
      Category(
        id: id ?? _id,
        name: name ?? _name,
        image: image ?? _image,
      );
  String? get id => _id;
  String? get name => _name;
  String? get image => _image;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    map['image'] = _image;
    return map;
  }
}

Service serviceFromJson(String str) => Service.fromJson(json.decode(str));
String serviceToJson(Service data) => json.encode(data.toJson());

class Service {
  Service({
    String? id,
    bool? status,
    bool? isDelete,
    String? name,
    int? duration,
    String? categoryId,
    String? image,
    String? createdAt,
    String? updatedAt,
  }) {
    _id = id;
    _status = status;
    _isDelete = isDelete;
    _name = name;
    _duration = duration;
    _categoryId = categoryId;
    _image = image;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Service.fromJson(dynamic json) {
    _id = json['_id'];
    _status = json['status'];
    _isDelete = json['isDelete'];
    _name = json['name'];
    _duration = json['duration'];
    _categoryId = json['categoryId'];
    _image = json['image'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _id;
  bool? _status;
  bool? _isDelete;
  String? _name;
  int? _duration;
  String? _categoryId;
  String? _image;
  String? _createdAt;
  String? _updatedAt;
  Service copyWith({
    String? id,
    bool? status,
    bool? isDelete,
    String? name,
    int? duration,
    String? categoryId,
    String? image,
    String? createdAt,
    String? updatedAt,
  }) =>
      Service(
        id: id ?? _id,
        status: status ?? _status,
        isDelete: isDelete ?? _isDelete,
        name: name ?? _name,
        duration: duration ?? _duration,
        categoryId: categoryId ?? _categoryId,
        image: image ?? _image,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get id => _id;
  bool? get status => _status;
  bool? get isDelete => _isDelete;
  String? get name => _name;
  int? get duration => _duration;
  String? get categoryId => _categoryId;
  String? get image => _image;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['status'] = _status;
    map['isDelete'] = _isDelete;
    map['name'] = _name;
    map['duration'] = _duration;
    map['categoryId'] = _categoryId;
    map['image'] = _image;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

Expert expertFromJson(String str) => Expert.fromJson(json.decode(str));
String expertToJson(Expert data) => json.encode(data.toJson());

class Expert {
  Expert({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
  }

  Expert.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  Expert copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) =>
      Expert(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    return map;
  }
}

User userFromJson(String str) => User.fromJson(json.decode(str));
String userToJson(User data) => json.encode(data.toJson());

class User {
  User({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) {
    _id = id;
    _fname = fname;
    _lname = lname;
    _image = image;
  }

  User.fromJson(dynamic json) {
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _image = json['image'];
  }
  String? _id;
  String? _fname;
  String? _lname;
  String? _image;
  User copyWith({
    String? id,
    String? fname,
    String? lname,
    String? image,
  }) =>
      User(
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        image: image ?? _image,
      );
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get image => _image;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['image'] = _image;
    return map;
  }
}
