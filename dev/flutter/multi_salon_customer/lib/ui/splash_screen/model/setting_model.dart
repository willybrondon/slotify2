import 'dart:convert';

SettingModel settingModelFromJson(String str) => SettingModel.fromJson(json.decode(str));
String settingModelToJson(SettingModel data) => json.encode(data.toJson());

class SettingModel {
  SettingModel({
    bool? status,
    String? message,
    Setting? setting,
  }) {
    _status = status;
    _message = message;
    _setting = setting;
  }

  SettingModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _setting = json['setting'] != null ? Setting.fromJson(json['setting']) : null;
  }
  bool? _status;
  String? _message;
  Setting? _setting;
  SettingModel copyWith({
    bool? status,
    String? message,
    Setting? setting,
  }) =>
      SettingModel(
        status: status ?? _status,
        message: message ?? _message,
        setting: setting ?? _setting,
      );
  bool? get status => _status;
  String? get message => _message;
  Setting? get setting => _setting;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['status'] = _status;
    map['message'] = _message;
    if (_setting != null) {
      map['setting'] = _setting?.toJson();
    }
    return map;
  }
}

Setting settingFromJson(String str) => Setting.fromJson(json.decode(str));
String settingToJson(Setting data) => json.encode(data.toJson());

class Setting {
  Setting({
    String? id,
    String? tnc,
    String? privacyPolicyLink,
    String? createdAt,
    String? updatedAt,
    num? tax,
    String? inAppPurchaseKey,
    String? inAppPurchaseSecretKey,
    bool? isInAppPurchase,
    bool? isRazorPay,
    bool? isStripePay,
    String? razorPayId,
    String? razorSecretKey,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? isFlutterWave,
    String? flutterWaveKey,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
  }) {
    _id = id;
    _tnc = tnc;
    _privacyPolicyLink = privacyPolicyLink;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _tax = tax;
    _inAppPurchaseKey = inAppPurchaseKey;
    _inAppPurchaseSecretKey = inAppPurchaseSecretKey;
    _isInAppPurchase = isInAppPurchase;
    _isRazorPay = isRazorPay;
    _isStripePay = isStripePay;
    _razorPayId = razorPayId;
    _razorSecretKey = razorSecretKey;
    _stripePublishableKey = stripePublishableKey;
    _stripeSecretKey = stripeSecretKey;
    _maintenanceMode = maintenanceMode;
    _isFlutterWave = isFlutterWave;
    _flutterWaveKey = flutterWaveKey;
    _cashAfterService = cashAfterService;
    _currencyName = currencyName;
    _currencySymbol = currencySymbol;
  }

  Setting.fromJson(dynamic json) {
    _id = json['_id'];
    _tnc = json['tnc'];
    _privacyPolicyLink = json['privacyPolicyLink'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _tax = json['tax'];
    _inAppPurchaseKey = json['inAppPurchaseKey'];
    _inAppPurchaseSecretKey = json['inAppPurchaseSecretKey'];
    _isInAppPurchase = json['isInAppPurchase'];
    _isRazorPay = json['isRazorPay'];
    _isStripePay = json['isStripePay'];
    _razorPayId = json['razorPayId'];
    _razorSecretKey = json['razorSecretKey'];
    _stripePublishableKey = json['stripePublishableKey'];
    _stripeSecretKey = json['stripeSecretKey'];
    _maintenanceMode = json['maintenanceMode'];
    _isFlutterWave = json['isFlutterWave'];
    _flutterWaveKey = json['flutterWaveKey'];
    _cashAfterService = json['cashAfterService'];
    _currencyName = json['currencyName'];
    _currencySymbol = json['currencySymbol'];
  }
  String? _id;
  String? _tnc;
  String? _privacyPolicyLink;
  String? _createdAt;
  String? _updatedAt;
  num? _tax;
  String? _inAppPurchaseKey;
  String? _inAppPurchaseSecretKey;
  bool? _isInAppPurchase;
  bool? _isRazorPay;
  bool? _isStripePay;
  String? _razorPayId;
  String? _razorSecretKey;
  String? _stripePublishableKey;
  String? _stripeSecretKey;
  bool? _maintenanceMode;
  bool? _isFlutterWave;
  String? _flutterWaveKey;
  bool? _cashAfterService;
  String? _currencyName;
  String? _currencySymbol;
  Setting copyWith({
    String? id,
    String? tnc,
    String? privacyPolicyLink,
    String? createdAt,
    String? updatedAt,
    num? tax,
    String? inAppPurchaseKey,
    String? inAppPurchaseSecretKey,
    bool? isInAppPurchase,
    bool? isRazorPay,
    bool? isStripePay,
    String? razorPayId,
    String? razorSecretKey,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? isFlutterWave,
    String? flutterWaveKey,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
  }) =>
      Setting(
        id: id ?? _id,
        tnc: tnc ?? _tnc,
        privacyPolicyLink: privacyPolicyLink ?? _privacyPolicyLink,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        tax: tax ?? _tax,
        inAppPurchaseKey: inAppPurchaseKey ?? _inAppPurchaseKey,
        inAppPurchaseSecretKey: inAppPurchaseSecretKey ?? _inAppPurchaseSecretKey,
        isInAppPurchase: isInAppPurchase ?? _isInAppPurchase,
        isRazorPay: isRazorPay ?? _isRazorPay,
        isStripePay: isStripePay ?? _isStripePay,
        razorPayId: razorPayId ?? _razorPayId,
        razorSecretKey: razorSecretKey ?? _razorSecretKey,
        stripePublishableKey: stripePublishableKey ?? _stripePublishableKey,
        stripeSecretKey: stripeSecretKey ?? _stripeSecretKey,
        maintenanceMode: maintenanceMode ?? _maintenanceMode,
        isFlutterWave: isFlutterWave ?? _isFlutterWave,
        flutterWaveKey: flutterWaveKey ?? _flutterWaveKey,
        cashAfterService: cashAfterService ?? _cashAfterService,
        currencyName: currencyName ?? _currencyName,
        currencySymbol: currencySymbol ?? _currencySymbol,
      );
  String? get id => _id;
  String? get tnc => _tnc;
  String? get privacyPolicyLink => _privacyPolicyLink;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  num? get tax => _tax;
  String? get inAppPurchaseKey => _inAppPurchaseKey;
  String? get inAppPurchaseSecretKey => _inAppPurchaseSecretKey;
  bool? get isInAppPurchase => _isInAppPurchase;
  bool? get isRazorPay => _isRazorPay;
  bool? get isStripePay => _isStripePay;
  String? get razorPayId => _razorPayId;
  String? get razorSecretKey => _razorSecretKey;
  String? get stripePublishableKey => _stripePublishableKey;
  String? get stripeSecretKey => _stripeSecretKey;
  bool? get maintenanceMode => _maintenanceMode;
  bool? get isFlutterWave => _isFlutterWave;
  String? get flutterWaveKey => _flutterWaveKey;
  bool? get cashAfterService => _cashAfterService;
  String? get currencyName => _currencyName;
  String? get currencySymbol => _currencySymbol;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['tnc'] = _tnc;
    map['privacyPolicyLink'] = _privacyPolicyLink;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['tax'] = _tax;
    map['inAppPurchaseKey'] = _inAppPurchaseKey;
    map['inAppPurchaseSecretKey'] = _inAppPurchaseSecretKey;
    map['isInAppPurchase'] = _isInAppPurchase;
    map['isRazorPay'] = _isRazorPay;
    map['isStripePay'] = _isStripePay;
    map['razorPayId'] = _razorPayId;
    map['razorSecretKey'] = _razorSecretKey;
    map['stripePublishableKey'] = _stripePublishableKey;
    map['stripeSecretKey'] = _stripeSecretKey;
    map['maintenanceMode'] = _maintenanceMode;
    map['isFlutterWave'] = _isFlutterWave;
    map['flutterWaveKey'] = _flutterWaveKey;
    map['cashAfterService'] = _cashAfterService;
    map['currencyName'] = _currencyName;
    map['currencySymbol'] = _currencySymbol;
    return map;
  }
}
