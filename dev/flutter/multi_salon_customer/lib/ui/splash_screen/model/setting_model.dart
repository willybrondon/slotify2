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
    bool? isRazorPay,
    bool? isStripePay,
    String? razorPayId,
    String? razorSecretKey,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
    String? flutterWaveKey,
    bool? isFlutterWave,
    bool? isZitopay,
    String? zitopayApiKey,
    String? zitopaySecretKey,
    String? zitopayMerchantId,
    bool? isMtnMomo,
    String? mtnMomoPrimaryKey,
    String? mtnMomoSecondaryKey,
    String? mtnMomoSubscriptionKey,
    String? mtnMomoApiUserId,
    String? mtnMomoApiKey,
    String? mtnMomoCallbackHost,
    String? mtnMomoEnvironment,
    FirebaseKey? firebaseKey,
    bool? isAddProductRequest,
    bool? isUpdateProductRequest,
    num? minWithdrawalRequestedAmount,
    num? minSalonWalletBalance,
    num? adminCommissionCharges,
    num? cancelOrderCharges,
  }) {
    _id = id;
    _tnc = tnc;
    _privacyPolicyLink = privacyPolicyLink;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
    _tax = tax;
    _isRazorPay = isRazorPay;
    _isStripePay = isStripePay;
    _razorPayId = razorPayId;
    _razorSecretKey = razorSecretKey;
    _stripePublishableKey = stripePublishableKey;
    _stripeSecretKey = stripeSecretKey;
    _maintenanceMode = maintenanceMode;
    _cashAfterService = cashAfterService;
    _currencyName = currencyName;
    _currencySymbol = currencySymbol;
    _flutterWaveKey = flutterWaveKey;
    _isFlutterWave = isFlutterWave;
    _isZitopay = isZitopay;
    _zitopayApiKey = zitopayApiKey;
    _zitopaySecretKey = zitopaySecretKey;
    _zitopayMerchantId = zitopayMerchantId;
    _isMtnMomo = isMtnMomo;
    _mtnMomoPrimaryKey = mtnMomoPrimaryKey;
    _mtnMomoSecondaryKey = mtnMomoSecondaryKey;
    _mtnMomoSubscriptionKey = mtnMomoSubscriptionKey;
    _mtnMomoApiUserId = mtnMomoApiUserId;
    _mtnMomoApiKey = mtnMomoApiKey;
    _mtnMomoCallbackHost = mtnMomoCallbackHost;
    _mtnMomoEnvironment = mtnMomoEnvironment;
    _firebaseKey = firebaseKey;
    _isAddProductRequest = isAddProductRequest;
    _isUpdateProductRequest = isUpdateProductRequest;
    _minWithdrawalRequestedAmount = minWithdrawalRequestedAmount;
    _minSalonWalletBalance = minSalonWalletBalance;
    _adminCommissionCharges = adminCommissionCharges;
    _cancelOrderCharges = cancelOrderCharges;
  }

  Setting.fromJson(dynamic json) {
    _id = json['_id'];
    _tnc = json['tnc'];
    _privacyPolicyLink = json['privacyPolicyLink'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
    _tax = json['tax'];
    _isRazorPay = json['isRazorPay'];
    _isStripePay = json['isStripePay'];
    _razorPayId = json['razorPayId'];
    _razorSecretKey = json['razorSecretKey'];
    _stripePublishableKey = json['stripePublishableKey'];
    _stripeSecretKey = json['stripeSecretKey'];
    _maintenanceMode = json['maintenanceMode'];
    _cashAfterService = json['cashAfterService'];
    _currencyName = json['currencyName'];
    _currencySymbol = json['currencySymbol'];
    _flutterWaveKey = json['flutterWaveKey'];
    _isFlutterWave = json['isFlutterWave'];
    _isZitopay = json['isZitopay'];
    _zitopayApiKey = json['zitopayApiKey'];
    _zitopaySecretKey = json['zitopaySecretKey'];
    _zitopayMerchantId = json['zitopayMerchantId'];
    _isMtnMomo = json['isMtnMomo'];
    _mtnMomoPrimaryKey = json['mtnMomoPrimaryKey'];
    _mtnMomoSecondaryKey = json['mtnMomoSecondaryKey'];
    _mtnMomoSubscriptionKey = json['mtnMomoSubscriptionKey'];
    _mtnMomoApiUserId = json['mtnMomoApiUserId'];
    _mtnMomoApiKey = json['mtnMomoApiKey'];
    _mtnMomoCallbackHost = json['mtnMomoCallbackHost'];
    _mtnMomoEnvironment = json['mtnMomoEnvironment'];
    _firebaseKey = json['firebaseKey'] != null ? FirebaseKey.fromJson(json['firebaseKey']) : null;
    _isAddProductRequest = json['isAddProductRequest'];
    _isUpdateProductRequest = json['isUpdateProductRequest'];
    _minWithdrawalRequestedAmount = json['minWithdrawalRequestedAmount'];
    _minSalonWalletBalance = json['minSalonWalletBalance'];
    _adminCommissionCharges = json['adminCommissionCharges'];
    _cancelOrderCharges = json['cancelOrderCharges'];
  }
  String? _id;
  String? _tnc;
  String? _privacyPolicyLink;
  String? _createdAt;
  String? _updatedAt;
  num? _tax;
  bool? _isRazorPay;
  bool? _isStripePay;
  String? _razorPayId;
  String? _razorSecretKey;
  String? _stripePublishableKey;
  String? _stripeSecretKey;
  bool? _maintenanceMode;
  bool? _cashAfterService;
  String? _currencyName;
  String? _currencySymbol;
  String? _flutterWaveKey;
  bool? _isFlutterWave;
  bool? _isZitopay;
  String? _zitopayApiKey;
  String? _zitopaySecretKey;
  String? _zitopayMerchantId;
  bool? _isMtnMomo;
    String? _mtnMomoPrimaryKey;
    String? _mtnMomoSecondaryKey;
    String? _mtnMomoSubscriptionKey;
    String? _mtnMomoApiUserId;
    String? _mtnMomoApiKey;
    String? _mtnMomoCallbackHost;
    String? _mtnMomoEnvironment;
  FirebaseKey? _firebaseKey;
  bool? _isAddProductRequest;
  bool? _isUpdateProductRequest;
  num? _minWithdrawalRequestedAmount;
  num? _minSalonWalletBalance;
  num? _adminCommissionCharges;
  num? _cancelOrderCharges;
  Setting copyWith({
    String? id,
    String? tnc,
    String? privacyPolicyLink,
    String? createdAt,
    String? updatedAt,
    num? tax,
    bool? isRazorPay,
    bool? isStripePay,
    String? razorPayId,
    String? razorSecretKey,
    String? stripePublishableKey,
    String? stripeSecretKey,
    bool? maintenanceMode,
    bool? cashAfterService,
    String? currencyName,
    String? currencySymbol,
    String? flutterWaveKey,
    bool? isFlutterWave,
    bool? isZitopay,
    String? zitopayApiKey,
    String? zitopaySecretKey,
    String? zitopayMerchantId,
    FirebaseKey? firebaseKey,
    bool? isAddProductRequest,
    bool? isUpdateProductRequest,
    num? minWithdrawalRequestedAmount,
    num? minSalonWalletBalance,
    num? adminCommissionCharges,
    num? cancelOrderCharges,
  }) =>
      Setting(
        id: id ?? _id,
        tnc: tnc ?? _tnc,
        privacyPolicyLink: privacyPolicyLink ?? _privacyPolicyLink,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
        tax: tax ?? _tax,
        isRazorPay: isRazorPay ?? _isRazorPay,
        isStripePay: isStripePay ?? _isStripePay,
        razorPayId: razorPayId ?? _razorPayId,
        razorSecretKey: razorSecretKey ?? _razorSecretKey,
        stripePublishableKey: stripePublishableKey ?? _stripePublishableKey,
        stripeSecretKey: stripeSecretKey ?? _stripeSecretKey,
        maintenanceMode: maintenanceMode ?? _maintenanceMode,
        cashAfterService: cashAfterService ?? _cashAfterService,
        currencyName: currencyName ?? _currencyName,
        currencySymbol: currencySymbol ?? _currencySymbol,
        flutterWaveKey: flutterWaveKey ?? _flutterWaveKey,
        isFlutterWave: isFlutterWave ?? _isFlutterWave,
        isZitopay: isZitopay ?? _isZitopay,
        zitopayApiKey: zitopayApiKey ?? _zitopayApiKey,
        zitopaySecretKey: zitopaySecretKey ?? _zitopaySecretKey,
        zitopayMerchantId: zitopayMerchantId ?? _zitopayMerchantId,
        isMtnMomo: isMtnMomo ?? _isMtnMomo,
        mtnMomoPrimaryKey: mtnMomoPrimaryKey ?? _mtnMomoPrimaryKey,
        mtnMomoSecondaryKey: mtnMomoSecondaryKey ?? _mtnMomoSecondaryKey,
        mtnMomoSubscriptionKey: mtnMomoSubscriptionKey ?? _mtnMomoSubscriptionKey,
        mtnMomoApiUserId: mtnMomoApiUserId ?? _mtnMomoApiUserId,
        mtnMomoApiKey: mtnMomoApiKey ?? _mtnMomoApiKey,
        mtnMomoCallbackHost: mtnMomoCallbackHost ?? _mtnMomoCallbackHost,
        mtnMomoEnvironment: mtnMomoEnvironment ?? _mtnMomoEnvironment,
        firebaseKey: firebaseKey ?? _firebaseKey,
        isAddProductRequest: isAddProductRequest ?? _isAddProductRequest,
        isUpdateProductRequest: isUpdateProductRequest ?? _isUpdateProductRequest,
        minWithdrawalRequestedAmount: minWithdrawalRequestedAmount ?? _minWithdrawalRequestedAmount,
        minSalonWalletBalance: minSalonWalletBalance ?? _minSalonWalletBalance,
        adminCommissionCharges: adminCommissionCharges ?? _adminCommissionCharges,
        cancelOrderCharges: cancelOrderCharges ?? _cancelOrderCharges,
      );
  String? get id => _id;
  String? get tnc => _tnc;
  String? get privacyPolicyLink => _privacyPolicyLink;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;
  num? get tax => _tax;
  bool? get isRazorPay => _isRazorPay;
  bool? get isStripePay => _isStripePay;
  String? get razorPayId => _razorPayId;
  String? get razorSecretKey => _razorSecretKey;
  String? get stripePublishableKey => _stripePublishableKey;
  String? get stripeSecretKey => _stripeSecretKey;
  bool? get maintenanceMode => _maintenanceMode;
  bool? get cashAfterService => _cashAfterService;
  String? get currencyName => _currencyName;
  String? get currencySymbol => _currencySymbol;
  String? get flutterWaveKey => _flutterWaveKey;
  bool? get isFlutterWave => _isFlutterWave;
  bool? get isZitopay => _isZitopay;
  String? get zitopayApiKey => _zitopayApiKey;
  String? get zitopaySecretKey => _zitopaySecretKey;
  String? get zitopayMerchantId => _zitopayMerchantId;
  bool? get isMtnMomo => _isMtnMomo;
  String? get mtnMomoPrimaryKey => _mtnMomoPrimaryKey;
  String? get mtnMomoSecondaryKey => _mtnMomoSecondaryKey;
  String? get mtnMomoSubscriptionKey => _mtnMomoSubscriptionKey;
  String? get mtnMomoApiUserId => _mtnMomoApiUserId;
  String? get mtnMomoApiKey => _mtnMomoApiKey;
  String? get mtnMomoCallbackHost => _mtnMomoCallbackHost;
  String? get mtnMomoEnvironment => _mtnMomoEnvironment;
  FirebaseKey? get firebaseKey => _firebaseKey;
  bool? get isAddProductRequest => _isAddProductRequest;
  bool? get isUpdateProductRequest => _isUpdateProductRequest;
  num? get minWithdrawalRequestedAmount => _minWithdrawalRequestedAmount;
  num? get minSalonWalletBalance => _minSalonWalletBalance;
  num? get adminCommissionCharges => _adminCommissionCharges;
  num? get cancelOrderCharges => _cancelOrderCharges;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['tnc'] = _tnc;
    map['privacyPolicyLink'] = _privacyPolicyLink;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    map['tax'] = _tax;
    map['isRazorPay'] = _isRazorPay;
    map['isStripePay'] = _isStripePay;
    map['razorPayId'] = _razorPayId;
    map['razorSecretKey'] = _razorSecretKey;
    map['stripePublishableKey'] = _stripePublishableKey;
    map['stripeSecretKey'] = _stripeSecretKey;
    map['maintenanceMode'] = _maintenanceMode;
    map['cashAfterService'] = _cashAfterService;
    map['currencyName'] = _currencyName;
    map['currencySymbol'] = _currencySymbol;
    map['flutterWaveKey'] = _flutterWaveKey;
    map['isFlutterWave'] = _isFlutterWave;
    map['isZitopay'] = _isZitopay;
    map['zitopayApiKey'] = _zitopayApiKey;
    map['zitopaySecretKey'] = _zitopaySecretKey;
    map['zitopayMerchantId'] = _zitopayMerchantId;
    map['isMtnMomo'] = _isMtnMomo;
    map['mtnMomoPrimaryKey'] = _mtnMomoPrimaryKey;
    map['mtnMomoSecondaryKey'] = _mtnMomoSecondaryKey;
    map['mtnMomoSubscriptionKey'] = _mtnMomoSubscriptionKey;
    map['mtnMomoApiUserId'] = _mtnMomoApiUserId;
    map['mtnMomoApiKey'] = _mtnMomoApiKey;
    map['mtnMomoCallbackHost'] = _mtnMomoCallbackHost;
    map['mtnMomoEnvironment'] = _mtnMomoEnvironment;
    if (_firebaseKey != null) {
      map['firebaseKey'] = _firebaseKey?.toJson();
    }
    map['isAddProductRequest'] = _isAddProductRequest;
    map['isUpdateProductRequest'] = _isUpdateProductRequest;
    map['minWithdrawalRequestedAmount'] = _minWithdrawalRequestedAmount;
    map['minSalonWalletBalance'] = _minSalonWalletBalance;
    map['adminCommissionCharges'] = _adminCommissionCharges;
    map['cancelOrderCharges'] = _cancelOrderCharges;
    return map;
  }
}

FirebaseKey firebaseKeyFromJson(String str) => FirebaseKey.fromJson(json.decode(str));
String firebaseKeyToJson(FirebaseKey data) => json.encode(data.toJson());

class FirebaseKey {
  FirebaseKey({
    String? type,
    String? projectId,
    String? privateKeyId,
    String? privateKey,
    String? clientEmail,
    String? clientId,
    String? authUri,
    String? tokenUri,
    String? authProviderX509CertUrl,
    String? clientX509CertUrl,
    String? universeDomain,
  }) {
    _type = type;
    _projectId = projectId;
    _privateKeyId = privateKeyId;
    _privateKey = privateKey;
    _clientEmail = clientEmail;
    _clientId = clientId;
    _authUri = authUri;
    _tokenUri = tokenUri;
    _authProviderX509CertUrl = authProviderX509CertUrl;
    _clientX509CertUrl = clientX509CertUrl;
    _universeDomain = universeDomain;
  }

  FirebaseKey.fromJson(dynamic json) {
    _type = json['type'];
    _projectId = json['project_id'];
    _privateKeyId = json['private_key_id'];
    _privateKey = json['private_key'];
    _clientEmail = json['client_email'];
    _clientId = json['client_id'];
    _authUri = json['auth_uri'];
    _tokenUri = json['token_uri'];
    _authProviderX509CertUrl = json['auth_provider_x509_cert_url'];
    _clientX509CertUrl = json['client_x509_cert_url'];
    _universeDomain = json['universe_domain'];
  }
  String? _type;
  String? _projectId;
  String? _privateKeyId;
  String? _privateKey;
  String? _clientEmail;
  String? _clientId;
  String? _authUri;
  String? _tokenUri;
  String? _authProviderX509CertUrl;
  String? _clientX509CertUrl;
  String? _universeDomain;
  FirebaseKey copyWith({
    String? type,
    String? projectId,
    String? privateKeyId,
    String? privateKey,
    String? clientEmail,
    String? clientId,
    String? authUri,
    String? tokenUri,
    String? authProviderX509CertUrl,
    String? clientX509CertUrl,
    String? universeDomain,
  }) =>
      FirebaseKey(
        type: type ?? _type,
        projectId: projectId ?? _projectId,
        privateKeyId: privateKeyId ?? _privateKeyId,
        privateKey: privateKey ?? _privateKey,
        clientEmail: clientEmail ?? _clientEmail,
        clientId: clientId ?? _clientId,
        authUri: authUri ?? _authUri,
        tokenUri: tokenUri ?? _tokenUri,
        authProviderX509CertUrl: authProviderX509CertUrl ?? _authProviderX509CertUrl,
        clientX509CertUrl: clientX509CertUrl ?? _clientX509CertUrl,
        universeDomain: universeDomain ?? _universeDomain,
      );
  String? get type => _type;
  String? get projectId => _projectId;
  String? get privateKeyId => _privateKeyId;
  String? get privateKey => _privateKey;
  String? get clientEmail => _clientEmail;
  String? get clientId => _clientId;
  String? get authUri => _authUri;
  String? get tokenUri => _tokenUri;
  String? get authProviderX509CertUrl => _authProviderX509CertUrl;
  String? get clientX509CertUrl => _clientX509CertUrl;
  String? get universeDomain => _universeDomain;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['type'] = _type;
    map['project_id'] = _projectId;
    map['private_key_id'] = _privateKeyId;
    map['private_key'] = _privateKey;
    map['client_email'] = _clientEmail;
    map['client_id'] = _clientId;
    map['auth_uri'] = _authUri;
    map['token_uri'] = _tokenUri;
    map['auth_provider_x509_cert_url'] = _authProviderX509CertUrl;
    map['client_x509_cert_url'] = _clientX509CertUrl;
    map['universe_domain'] = _universeDomain;
    return map;
  }
}
