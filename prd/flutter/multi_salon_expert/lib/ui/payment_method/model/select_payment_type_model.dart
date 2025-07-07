import 'dart:convert';

SelectPaymentTypeModel selectPaymentTypeModelFromJson(String str) =>
    SelectPaymentTypeModel.fromJson(json.decode(str));
String selectPaymentTypeModelToJson(SelectPaymentTypeModel data) => json.encode(data.toJson());

class SelectPaymentTypeModel {
  SelectPaymentTypeModel({
    bool? status,
    String? message,
    Expert? expert,
  }) {
    _status = status;
    _message = message;
    _expert = expert;
  }

  SelectPaymentTypeModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _expert = json['expert'] != null ? Expert.fromJson(json['expert']) : null;
  }
  bool? _status;
  String? _message;
  Expert? _expert;
  SelectPaymentTypeModel copyWith({
    bool? status,
    String? message,
    Expert? expert,
  }) =>
      SelectPaymentTypeModel(
        status: status ?? _status,
        message: message ?? _message,
        expert: expert ?? _expert,
      );
  bool? get status => _status;
  String? get message => _message;
  Expert? get expert => _expert;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_expert != null) {
      map['expert'] = _expert?.toJson();
    }
    return map;
  }
}

Expert expertFromJson(String str) => Expert.fromJson(json.decode(str));
String expertToJson(Expert data) => json.encode(data.toJson());

class Expert {
  Expert({
    BankDetails? bankDetails,
    String? id,
    String? fcmToken,
    List<String>? serviceId,
    bool? isBlock,
    num? bookingCount,
    num? totalBookingCount,
    String? password,
    bool? isDelete,
    bool? isAttend,
    String? upiId,
    num? uniqueId,
    String? fname,
    String? lname,
    String? email,
    num? age,
    String? gender,
    String? mobile,
    num? commission,
    String? image,
    String? salonId,
    String? createdAt,
    String? updatedAt,
    num? reviewCount,
    num? review,
    num? paymentType,
    num? currentEarning,
    num? earning,
  }) {
    _bankDetails = bankDetails;
    _id = id;
    _fcmToken = fcmToken;
    _serviceId = serviceId;
    _isBlock = isBlock;
    _bookingCount = bookingCount;
    _totalBookingCount = totalBookingCount;
    _password = password;
    _isDelete = isDelete;
    _isAttend = isAttend;
    _upiId = upiId;
    _uniqueId = uniqueId;
    _fname = fname;
    _lname = lname;
    _email = email;
    _age = age;
    _gender = gender;
    _mobile = mobile;
    _commission = commission;
    _image = image;
    _salonId = salonId;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _reviewCount = reviewCount;
    _review = review;
    _paymentType = paymentType;
    _currentEarning = currentEarning;
    _earning = earning;
  }

  Expert.fromJson(dynamic json) {
    _bankDetails = json['bankDetails'] != null ? BankDetails.fromJson(json['bankDetails']) : null;
    _id = json['_id'];
    _fcmToken = json['fcmToken'];
    _serviceId = json['serviceId'] != null ? json['serviceId'].cast<String>() : [];
    _isBlock = json['isBlock'];
    _bookingCount = json['bookingCount'];
    _totalBookingCount = json['totalBookingCount'];
    _password = json['password'];
    _isDelete = json['isDelete'];
    _isAttend = json['isAttend'];
    _upiId = json['upiId'];
    _uniqueId = json['uniqueId'];
    _fname = json['fname'];
    _lname = json['lname'];
    _email = json['email'];
    _age = json['age'];
    _gender = json['gender'];
    _mobile = json['mobile'];
    _commission = json['commission'];
    _image = json['image'];
    _salonId = json['salonId'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _reviewCount = json['reviewCount'];
    _review = json['review'];
    _paymentType = json['paymentType'];
    _currentEarning = json['currentEarning'];
    _earning = json['earning'];
  }
  BankDetails? _bankDetails;
  String? _id;
  String? _fcmToken;
  List<String>? _serviceId;
  bool? _isBlock;
  num? _bookingCount;
  num? _totalBookingCount;
  String? _password;
  bool? _isDelete;
  bool? _isAttend;
  String? _upiId;
  num? _uniqueId;
  String? _fname;
  String? _lname;
  String? _email;
  num? _age;
  String? _gender;
  String? _mobile;
  num? _commission;
  String? _image;
  String? _salonId;
  String? _createdAt;
  String? _updatedAt;
  num? _reviewCount;
  num? _review;
  num? _paymentType;
  num? _currentEarning;
  num? _earning;
  Expert copyWith({
    BankDetails? bankDetails,
    String? id,
    String? fcmToken,
    List<String>? serviceId,
    bool? isBlock,
    num? bookingCount,
    num? totalBookingCount,
    String? password,
    bool? isDelete,
    bool? isAttend,
    String? upiId,
    num? uniqueId,
    String? fname,
    String? lname,
    String? email,
    num? age,
    String? gender,
    String? mobile,
    num? commission,
    String? image,
    String? salonId,
    String? createdAt,
    String? updatedAt,
    num? reviewCount,
    num? review,
    num? paymentType,
    num? currentEarning,
    num? earning,
  }) =>
      Expert(
        bankDetails: bankDetails ?? _bankDetails,
        id: id ?? _id,
        fcmToken: fcmToken ?? _fcmToken,
        serviceId: serviceId ?? _serviceId,
        isBlock: isBlock ?? _isBlock,
        bookingCount: bookingCount ?? _bookingCount,
        totalBookingCount: totalBookingCount ?? _totalBookingCount,
        password: password ?? _password,
        isDelete: isDelete ?? _isDelete,
        isAttend: isAttend ?? _isAttend,
        upiId: upiId ?? _upiId,
        uniqueId: uniqueId ?? _uniqueId,
        fname: fname ?? _fname,
        lname: lname ?? _lname,
        email: email ?? _email,
        age: age ?? _age,
        gender: gender ?? _gender,
        mobile: mobile ?? _mobile,
        commission: commission ?? _commission,
        image: image ?? _image,
        salonId: salonId ?? _salonId,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        reviewCount: reviewCount ?? _reviewCount,
        review: review ?? _review,
        paymentType: paymentType ?? _paymentType,
        currentEarning: currentEarning ?? _currentEarning,
        earning: earning ?? _earning,
      );
  BankDetails? get bankDetails => _bankDetails;
  String? get id => _id;
  String? get fcmToken => _fcmToken;
  List<String>? get serviceId => _serviceId;
  bool? get isBlock => _isBlock;
  num? get bookingCount => _bookingCount;
  num? get totalBookingCount => _totalBookingCount;
  String? get password => _password;
  bool? get isDelete => _isDelete;
  bool? get isAttend => _isAttend;
  String? get upiId => _upiId;
  num? get uniqueId => _uniqueId;
  String? get fname => _fname;
  String? get lname => _lname;
  String? get email => _email;
  num? get age => _age;
  String? get gender => _gender;
  String? get mobile => _mobile;
  num? get commission => _commission;
  String? get image => _image;
  String? get salonId => _salonId;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  num? get reviewCount => _reviewCount;
  num? get review => _review;
  num? get paymentType => _paymentType;
  num? get currentEarning => _currentEarning;
  num? get earning => _earning;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_bankDetails != null) {
      map['bankDetails'] = _bankDetails?.toJson();
    }
    map['_id'] = _id;
    map['fcmToken'] = _fcmToken;
    map['serviceId'] = _serviceId;
    map['isBlock'] = _isBlock;
    map['bookingCount'] = _bookingCount;
    map['totalBookingCount'] = _totalBookingCount;
    map['password'] = _password;
    map['isDelete'] = _isDelete;
    map['isAttend'] = _isAttend;
    map['upiId'] = _upiId;
    map['uniqueId'] = _uniqueId;
    map['fname'] = _fname;
    map['lname'] = _lname;
    map['email'] = _email;
    map['age'] = _age;
    map['gender'] = _gender;
    map['mobile'] = _mobile;
    map['commission'] = _commission;
    map['image'] = _image;
    map['salonId'] = _salonId;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['reviewCount'] = _reviewCount;
    map['review'] = _review;
    map['paymentType'] = _paymentType;
    map['currentEarning'] = _currentEarning;
    map['earning'] = _earning;
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
