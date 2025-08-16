import 'dart:convert';

SettingModel settingModelFromJson(String str) =>
    SettingModel.fromJson(json.decode(str));
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
    _setting =
        json['setting'] != null ? Setting.fromJson(json['setting']) : null;
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
    bool? isInAppPurchase,
    String? inAppPurchaseKey,
    String? inAppPurchaseSecretKey,
    String? id,
    String? tnc,
    String? privacyPolicyLink,
    String? createdAt,
    String? updatedAt,
    num? tax,
    bool? isMTNMoney,
    bool? isOrangeMoney,
    bool? isStripePay,
    String? mtnMoneyApiKey,
    String? mtnMoneyApiSecret,
    String? orangeMoneyApiKey,
    String? orangeMoneyApiSecret,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
  }) {
    _isInAppPurchase = isInAppPurchase;
    _inAppPurchaseKey = inAppPurchaseKey;
    _inAppPurchaseSecretKey = inAppPurchaseSecretKey;
    _id = id;
    _tnc = tnc;
    _privacyPolicyLink = privacyPolicyLink;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _tax = tax;
    _isMTNMoney = isMTNMoney;
    _isOrangeMoney = isOrangeMoney;
    _isStripePay = isStripePay;
    _mtnMoneyApiKey = mtnMoneyApiKey;
    _mtnMoneyApiSecret = mtnMoneyApiSecret;
    _orangeMoneyApiKey = orangeMoneyApiKey;
    _orangeMoneyApiSecret = orangeMoneyApiSecret;
    _stripePublishableKey = stripePublishableKey;
    _stripeSecretKey = stripeSecretKey;
    _maintenanceMode = maintenanceMode;
    _cashAfterService = cashAfterService;
    _currencyName = currencyName;
    _currencySymbol = currencySymbol;
  }

  Setting.fromJson(dynamic json) {
    _isInAppPurchase = json['isInAppPurchase'];
    _inAppPurchaseKey = json['inAppPurchaseKey'];
    _inAppPurchaseSecretKey = json['inAppPurchaseSecretKey'];
    _id = json['_id'];
    _tnc = json['tnc'];
    _privacyPolicyLink = json['privacyPolicyLink'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _tax = json['tax'];
    _isMTNMoney = json['isMTNMoney'];
    _isOrangeMoney = json['isOrangeMoney'];
    _isStripePay = json['isStripePay'];
    _mtnMoneyApiKey = json['mtnMoneyApiKey'];
    _mtnMoneyApiSecret = json['mtnMoneyApiSecret'];
    _orangeMoneyApiKey = json['orangeMoneyApiKey'];
    _orangeMoneyApiSecret = json['orangeMoneyApiSecret'];
    _stripePublishableKey = json['stripePublishableKey'];
    _stripeSecretKey = json['stripeSecretKey'];
    _maintenanceMode = json['maintenanceMode'];
    _cashAfterService = json['cashAfterService'];
    _currencyName = json['currencyName'];
    _currencySymbol = json['currencySymbol'];
  }
  bool? _isInAppPurchase;
  String? _inAppPurchaseKey;
  String? _inAppPurchaseSecretKey;
  String? _id;
  String? _tnc;
  String? _privacyPolicyLink;
  String? _createdAt;
  String? _updatedAt;
  num? _tax;
  bool? _isMTNMoney;
  bool? _isOrangeMoney;
  bool? _isStripePay;
  String? _mtnMoneyApiKey;
  String? _mtnMoneyApiSecret;
  String? _orangeMoneyApiKey;
  String? _orangeMoneyApiSecret;
  String? _stripePublishableKey;
  String? _stripeSecretKey;
  bool? _maintenanceMode;
  bool? _cashAfterService;
  String? _currencyName;
  String? _currencySymbol;
  Setting copyWith({
    bool? isInAppPurchase,
    String? inAppPurchaseKey,
    String? inAppPurchaseSecretKey,
    String? id,
    String? tnc,
    String? privacyPolicyLink,
    String? createdAt,
    String? updatedAt,
    num? tax,
    bool? isMTNMoney,
    bool? isOrangeMoney,
    bool? isStripePay,
    String? mtnMoneyApiKey,
    String? mtnMoneyApiSecret,
    String? orangeMoneyApiKey,
    String? orangeMoneyApiSecret,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
  }) =>
      Setting(
        isInAppPurchase: isInAppPurchase ?? _isInAppPurchase,
        inAppPurchaseKey: inAppPurchaseKey ?? _inAppPurchaseKey,
        inAppPurchaseSecretKey:
            inAppPurchaseSecretKey ?? _inAppPurchaseSecretKey,
        id: id ?? _id,
        tnc: tnc ?? _tnc,
        privacyPolicyLink: privacyPolicyLink ?? _privacyPolicyLink,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        tax: tax ?? _tax,
        isMTNMoney: isMTNMoney ?? _isMTNMoney,
        isOrangeMoney: isOrangeMoney ?? _isOrangeMoney,
        isStripePay: isStripePay ?? _isStripePay,
        mtnMoneyApiKey: mtnMoneyApiKey ?? _mtnMoneyApiKey,
        mtnMoneyApiSecret: mtnMoneyApiSecret ?? _mtnMoneyApiSecret,
        orangeMoneyApiKey: orangeMoneyApiKey ?? _orangeMoneyApiKey,
        orangeMoneyApiSecret: orangeMoneyApiSecret ?? _orangeMoneyApiSecret,
        stripePublishableKey: stripePublishableKey ?? _stripePublishableKey,
        stripeSecretKey: stripeSecretKey ?? _stripeSecretKey,
        maintenanceMode: maintenanceMode ?? _maintenanceMode,
        cashAfterService: cashAfterService ?? _cashAfterService,
        currencyName: currencyName ?? _currencyName,
        currencySymbol: currencySymbol ?? _currencySymbol,
      );
  bool? get isInAppPurchase => _isInAppPurchase;
  String? get inAppPurchaseKey => _inAppPurchaseKey;
  String? get inAppPurchaseSecretKey => _inAppPurchaseSecretKey;
  String? get id => _id;
  String? get tnc => _tnc;
  String? get privacyPolicyLink => _privacyPolicyLink;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  num? get tax => _tax;
  bool? get isMTNMoney => _isMTNMoney;
  bool? get isOrangeMoney => _isOrangeMoney;
  bool? get isStripePay => _isStripePay;
  String? get mtnMoneyApiKey => _mtnMoneyApiKey;
  String? get mtnMoneyApiSecret => _mtnMoneyApiSecret;
  String? get orangeMoneyApiKey => _orangeMoneyApiKey;
  String? get orangeMoneyApiSecret => _orangeMoneyApiSecret;
  String? get stripePublishableKey => _stripePublishableKey;
  String? get stripeSecretKey => _stripeSecretKey;
  bool? get maintenanceMode => _maintenanceMode;
  bool? get cashAfterService => _cashAfterService;
  String? get currencyName => _currencyName;
  String? get currencySymbol => _currencySymbol;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['isInAppPurchase'] = _isInAppPurchase;
    map['inAppPurchaseKey'] = _inAppPurchaseKey;
    map['inAppPurchaseSecretKey'] = _inAppPurchaseSecretKey;
    map['_id'] = _id;
    map['tnc'] = _tnc;
    map['privacyPolicyLink'] = _privacyPolicyLink;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['tax'] = _tax;
    map['isMTNMoney'] = _isMTNMoney;
    map['isOrangeMoney'] = _isOrangeMoney;
    map['isStripePay'] = _isStripePay;
    map['mtnMoneyApiKey'] = _mtnMoneyApiKey;
    map['mtnMoneyApiSecret'] = _mtnMoneyApiSecret;
    map['orangeMoneyApiKey'] = _orangeMoneyApiKey;
    map['orangeMoneyApiSecret'] = _orangeMoneyApiSecret;
    map['stripePublishableKey'] = _stripePublishableKey;
    map['stripeSecretKey'] = _stripeSecretKey;
    map['maintenanceMode'] = _maintenanceMode;
    map['cashAfterService'] = _cashAfterService;
    map['currencyName'] = _currencyName;
    map['currencySymbol'] = _currencySymbol;
    return map;
  }
}
