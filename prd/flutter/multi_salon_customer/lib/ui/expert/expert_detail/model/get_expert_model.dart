import 'dart:convert';

GetExpertModel getExpertModelFromJson(String str) => GetExpertModel.fromJson(json.decode(str));
String getExpertModelToJson(GetExpertModel data) => json.encode(data.toJson());

class GetExpertModel {
  GetExpertModel({
    bool? status,
    String? message,
    Data? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  GetExpertModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _data = json['data'] != null ? Data.fromJson(json['data']) : null;
  }
  bool? _status;
  String? _message;
  Data? _data;
  GetExpertModel copyWith({
    bool? status,
    String? message,
    Data? data,
  }) =>
      GetExpertModel(
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
    List<Services>? services,
    Expert? expert,
    num? tax,
  }) {
    _services = services;
    _expert = expert;
    _tax = tax;
  }

  Data.fromJson(dynamic json) {
    if (json['services'] != null) {
      _services = [];
      json['services'].forEach((v) {
        _services?.add(Services.fromJson(v));
      });
    }
    _expert = json['expert'] != null ? Expert.fromJson(json['expert']) : null;
    _tax = json['tax'];
  }
  List<Services>? _services;
  Expert? _expert;
  num? _tax;
  Data copyWith({
    List<Services>? services,
    Expert? expert,
    num? tax,
  }) =>
      Data(
        services: services ?? _services,
        expert: expert ?? _expert,
        tax: tax ?? _tax,
      );
  List<Services>? get services => _services;
  Expert? get expert => _expert;
  num? get tax => _tax;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_services != null) {
      map['services'] = _services?.map((v) => v.toJson()).toList();
    }
    if (_expert != null) {
      map['expert'] = _expert?.toJson();
    }
    map['tax'] = _tax;
    return map;
  }
}

Expert expertFromJson(String str) => Expert.fromJson(json.decode(str));
String expertToJson(Expert data) => json.encode(data.toJson());

class Expert {
  Expert({
    BankDetails? bankDetails,
    String? id,
    String? fname,
    String? lname,
    String? email,
    String? image,
    String? mobile,
    String? fcmToken,
    bool? isBlock,
    String? password,
    bool? isDelete,
    bool? isAttend,
    num? uniqueId,
    bool? showDialog,
    SalonId? salonId,
    List<String>? serviceId,
    num? earning,
    num? currentEarning,
    num? bookingCount,
    num? totalBookingCount,
    num? paymentType,
    String? upiId,
    num? review,
    num? reviewCount,
    num? age,
    String? gender,
    num? commission,
    String? createdAt,
    String? updatedAt,
  }) {
    _bankDetails = bankDetails;
    _id = id;
    _fname = fname;
    _lname = lname;
    _email = email;
    _image = image;
    _mobile = mobile;
    _fcmToken = fcmToken;
    _isBlock = isBlock;
    _password = password;
    _isDelete = isDelete;
    _isAttend = isAttend;
    _uniqueId = uniqueId;
    _showDialog = showDialog;
    _salonId = salonId;
    _serviceId = serviceId;
    _earning = earning;
    _currentEarning = currentEarning;
    _bookingCount = bookingCount;
    _totalBookingCount = totalBookingCount;
    _paymentType = paymentType;
    _upiId = upiId;
    _review = review;
    _reviewCount = reviewCount;
    _age = age;
    _gender = gender;
    _commission = commission;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  Expert.fromJson(dynamic json) {
    _bankDetails = json['bankDetails'] != null ? BankDetails.fromJson(json['bankDetails']) : null;
    _id = json['_id'];
    _fname = json['fname'];
    _lname = json['lname'];
    _email = json['email'];
    _image = json['image'];
    _mobile = json['mobile'];
    _fcmToken = json['fcmToken'];
    _isBlock = json['isBlock'];
    _password = json['password'];
    _isDelete = json['isDelete'];
    _isAttend = json['isAttend'];
    _uniqueId = json['uniqueId'];
    _showDialog = json['showDialog'];
    _salonId = json['salonId'] != null ? SalonId.fromJson(json['salonId']) : null;
    _serviceId = json['serviceId'] != null ? json['serviceId'].cast<String>() : [];
    _earning = json['earning'];
    _currentEarning = json['currentEarning'];
    _bookingCount = json['bookingCount'];
    _totalBookingCount = json['totalBookingCount'];
    _paymentType = json['paymentType'];
    _upiId = json['upiId'];
    _review = json['review'];
    _reviewCount = json['reviewCount'];
    _age = json['age'];
    _gender = json['gender'];
    _commission = json['commission'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  BankDetails? _bankDetails;
  String? _id;
  String? _fname;
  String? _lname;
  String? _email;
  String? _image;
  String? _mobile;
  String? _fcmToken;
  bool? _isBlock;
  String? _password;
  bool? _isDelete;
  bool? _isAttend;
  num? _uniqueId;
  bool? _showDialog;
  SalonId? _salonId;
  List<String>? _serviceId;
  num? _earning;
  num? _currentEarning;
  num? _bookingCount;
  num? _totalBookingCount;
  num? _paymentType;
  String? _upiId;
  num? _review;
  num? _reviewCount;
  num? _age;
  String? _gender;
  num? _commission;
  String? _createdAt;
  String? _updatedAt;
  Expert copyWith({
    BankDetails? bankDetails,
    String? id,
    String? fname,
    String? lname,
    String? email,
    String? image,
    String? mobile,
    String? fcmToken,
    bool? isBlock,
    String? password,
    bool? isDelete,
    bool? isAttend,
    num? uniqueId,
    bool? showDialog,
    SalonId? salonId,
    List<String>? serviceId,
    num? earning,
    num? currentEarning,
    num? bookingCount,
    num? totalBookingCount,
    num? paymentType,
    String? upiId,
    num? review,
    num? reviewCount,
    num? age,
    String? gender,
    num? commission,
    String? createdAt,
    String? updatedAt,
  }) =>
      Expert(
        bankDetails: bankDetails ?? _bankDetails,
        id: id ?? _id,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        email: email ?? _email,
        image: image ?? _image,
        mobile: mobile ?? _mobile,
        fcmToken: fcmToken ?? _fcmToken,
        isBlock: isBlock ?? _isBlock,
        password: password ?? _password,
        isDelete: isDelete ?? _isDelete,
        isAttend: isAttend ?? _isAttend,
        uniqueId: uniqueId ?? _uniqueId,
        showDialog: showDialog ?? _showDialog,
        salonId: salonId ?? _salonId,
        serviceId: serviceId ?? _serviceId,
        earning: earning ?? _earning,
        currentEarning: currentEarning ?? _currentEarning,
        bookingCount: bookingCount ?? _bookingCount,
        totalBookingCount: totalBookingCount ?? _totalBookingCount,
        paymentType: paymentType ?? _paymentType,
        upiId: upiId ?? _upiId,
        review: review ?? _review,
        reviewCount: reviewCount ?? _reviewCount,
        age: age ?? _age,
        gender: gender ?? _gender,
        commission: commission ?? _commission,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  BankDetails? get bankDetails => _bankDetails;
  String? get id => _id;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get email => _email;
  String? get image => _image;
  String? get mobile => _mobile;
  String? get fcmToken => _fcmToken;
  bool? get isBlock => _isBlock;
  String? get password => _password;
  bool? get isDelete => _isDelete;
  bool? get isAttend => _isAttend;
  num? get uniqueId => _uniqueId;
  bool? get showDialog => _showDialog;
  SalonId? get salonId => _salonId;
  List<String>? get serviceId => _serviceId;
  num? get earning => _earning;
  num? get currentEarning => _currentEarning;
  num? get bookingCount => _bookingCount;
  num? get totalBookingCount => _totalBookingCount;
  num? get paymentType => _paymentType;
  String? get upiId => _upiId;
  num? get review => _review;
  num? get reviewCount => _reviewCount;
  num? get age => _age;
  String? get gender => _gender;
  num? get commission => _commission;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_bankDetails != null) {
      map['bankDetails'] = _bankDetails?.toJson();
    }
    map['_id'] = _id;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['email'] = _email;
    map['image'] = _image;
    map['mobile'] = _mobile;
    map['fcmToken'] = _fcmToken;
    map['isBlock'] = _isBlock;
    map['password'] = _password;
    map['isDelete'] = _isDelete;
    map['isAttend'] = _isAttend;
    map['uniqueId'] = _uniqueId;
    map['showDialog'] = _showDialog;
    if (_salonId != null) {
      map['salonId'] = _salonId?.toJson();
    }
    map['serviceId'] = _serviceId;
    map['earning'] = _earning;
    map['currentEarning'] = _currentEarning;
    map['bookingCount'] = _bookingCount;
    map['totalBookingCount'] = _totalBookingCount;
    map['paymentType'] = _paymentType;
    map['upiId'] = _upiId;
    map['review'] = _review;
    map['reviewCount'] = _reviewCount;
    map['age'] = _age;
    map['gender'] = _gender;
    map['commission'] = _commission;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

SalonId salonIdFromJson(String str) => SalonId.fromJson(json.decode(str));
String salonIdToJson(SalonId data) => json.encode(data.toJson());

class SalonId {
  SalonId({
    String? id,
    String? name,
  }) {
    _id = id;
    _name = name;
  }

  SalonId.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
  }
  String? _id;
  String? _name;
  SalonId copyWith({
    String? id,
    String? name,
  }) =>
      SalonId(
        id: id ?? _id,
        name: name ?? _name,
      );
  String? get id => _id;
  String? get name => _name;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['name'] = _name;
    return map;
  }
}

BankDetails bankDetailsFromJson(String str) => BankDetails.fromJson(json.decode(str));
String bankDetailsToJson(BankDetails data) => json.encode(data.toJson());

class BankDetails {
  BankDetails({
    String? bankName,
    String? accountNumber,
    String? iFSCCode,
    String? branchName,
  }) {
    _bankName = bankName;
    _accountNumber = accountNumber;
    _iFSCCode = iFSCCode;
    _branchName = branchName;
  }

  BankDetails.fromJson(dynamic json) {
    _bankName = json['bankName'];
    _accountNumber = json['accountNumber'];
    _iFSCCode = json['IFSCCode'];
    _branchName = json['branchName'];
  }
  String? _bankName;
  String? _accountNumber;
  String? _iFSCCode;
  String? _branchName;
  BankDetails copyWith({
    String? bankName,
    String? accountNumber,
    String? iFSCCode,
    String? branchName,
  }) =>
      BankDetails(
        bankName: bankName ?? _bankName,
        accountNumber: accountNumber ?? _accountNumber,
        iFSCCode: iFSCCode ?? _iFSCCode,
        branchName: branchName ?? _branchName,
      );
  String? get bankName => _bankName;
  String? get accountNumber => _accountNumber;
  String? get iFSCCode => _iFSCCode;
  String? get branchName => _branchName;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['bankName'] = _bankName;
    map['accountNumber'] = _accountNumber;
    map['IFSCCode'] = _iFSCCode;
    map['branchName'] = _branchName;
    return map;
  }
}

Services servicesFromJson(String str) => Services.fromJson(json.decode(str));
String servicesToJson(Services data) => json.encode(data.toJson());

class Services {
  Services({
    Id? id,
    num? price,
  }) {
    _id = id;
    _price = price;
  }

  Services.fromJson(dynamic json) {
    _id = json['id'] != null ? Id.fromJson(json['id']) : null;
    _price = json['price'];
  }
  Id? _id;
  num? _price;
  Services copyWith({
    Id? id,
    num? price,
  }) =>
      Services(
        id: id ?? _id,
        price: price ?? _price,
      );
  Id? get id => _id;
  num? get price => _price;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_id != null) {
      map['id'] = _id?.toJson();
    }
    map['price'] = _price;
    return map;
  }
}

Id idFromJson(String str) => Id.fromJson(json.decode(str));
String idToJson(Id data) => json.encode(data.toJson());

class Id {
  Id({
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

  Id.fromJson(dynamic json) {
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
  Id copyWith({
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
      Id(
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
