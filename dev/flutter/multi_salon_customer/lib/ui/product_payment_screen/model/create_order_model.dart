import 'dart:convert';

CreateOrderModel createOrderModelFromJson(String str) => CreateOrderModel.fromJson(json.decode(str));
String createOrderModelToJson(CreateOrderModel data) => json.encode(data.toJson());

class CreateOrderModel {
  CreateOrderModel({
    bool? status,
    String? message,
    OrderData? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  CreateOrderModel.fromJson(dynamic json) {
    _status = json['status'];
    _message = json['message'];
    _data = json['data'] != null ? OrderData.fromJson(json['data']) : null;
  }
  bool? _status;
  String? _message;
  OrderData? _data;
  CreateOrderModel copyWith({
    bool? status,
    String? message,
    OrderData? data,
  }) =>
      CreateOrderModel(
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );
  bool? get status => _status;
  String? get message => _message;
  OrderData? get data => _data;

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

OrderData dataFromJson(String str) => OrderData.fromJson(json.decode(str));
String dataToJson(OrderData data) => json.encode(data.toJson());

class OrderData {
  OrderData({
    String? orderId,
    String? userId,
    List<Items>? items,
    num? purchasedTimeadminCommissionCharges,
    num? totalQuantity,
    num? totalItems,
    num? totalShippingCharges,
    num? discount,
    num? subTotal,
    num? total,
    num? finalTotal,
    ShippingAddress? shippingAddress,
    String? paymentGateway,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) {
    _orderId = orderId;
    _userId = userId;
    _items = items;
    _purchasedTimeadminCommissionCharges = purchasedTimeadminCommissionCharges;
    _totalQuantity = totalQuantity;
    _totalItems = totalItems;
    _totalShippingCharges = totalShippingCharges;
    _discount = discount;
    _subTotal = subTotal;
    _total = total;
    _finalTotal = finalTotal;
    _shippingAddress = shippingAddress;
    _paymentGateway = paymentGateway;
    _id = id;
    _createdAt = createdAt;
    _updatedAt = updatedAt;
  }

  OrderData.fromJson(dynamic json) {
    _orderId = json['orderId'];
    _userId = json['userId'];
    if (json['items'] != null) {
      _items = [];
      json['items'].forEach((v) {
        _items?.add(Items.fromJson(v));
      });
    }
    _purchasedTimeadminCommissionCharges = json['purchasedTimeadminCommissionCharges'];
    _totalQuantity = json['totalQuantity'];
    _totalItems = json['totalItems'];
    _totalShippingCharges = json['totalShippingCharges'];
    _discount = json['discount'];
    _subTotal = json['subTotal'];
    _total = json['total'];
    _finalTotal = json['finalTotal'];
    _shippingAddress = json['shippingAddress'] != null ? ShippingAddress.fromJson(json['shippingAddress']) : null;
    _paymentGateway = json['paymentGateway'];
    _id = json['_id'];
    _createdAt = json['createdAt'];
    _updatedAt = json['updatedAt'];
  }
  String? _orderId;
  String? _userId;
  List<Items>? _items;
  num? _purchasedTimeadminCommissionCharges;
  num? _totalQuantity;
  num? _totalItems;
  num? _totalShippingCharges;
  num? _discount;
  num? _subTotal;
  num? _total;
  num? _finalTotal;
  ShippingAddress? _shippingAddress;
  String? _paymentGateway;
  String? _id;
  String? _createdAt;
  String? _updatedAt;
  OrderData copyWith({
    String? orderId,
    String? userId,
    List<Items>? items,
    num? purchasedTimeadminCommissionCharges,
    num? totalQuantity,
    num? totalItems,
    num? totalShippingCharges,
    num? discount,
    num? subTotal,
    num? total,
    num? finalTotal,
    ShippingAddress? shippingAddress,
    String? paymentGateway,
    String? id,
    String? createdAt,
    String? updatedAt,
  }) =>
      OrderData(
        orderId: orderId ?? _orderId,
        userId: userId ?? _userId,
        items: items ?? _items,
        purchasedTimeadminCommissionCharges: purchasedTimeadminCommissionCharges ?? _purchasedTimeadminCommissionCharges,
        totalQuantity: totalQuantity ?? _totalQuantity,
        totalItems: totalItems ?? _totalItems,
        totalShippingCharges: totalShippingCharges ?? _totalShippingCharges,
        discount: discount ?? _discount,
        subTotal: subTotal ?? _subTotal,
        total: total ?? _total,
        finalTotal: finalTotal ?? _finalTotal,
        shippingAddress: shippingAddress ?? _shippingAddress,
        paymentGateway: paymentGateway ?? _paymentGateway,
        id: id ?? _id,
        createdAt: createdAt ?? _createdAt,
        updatedAt: updatedAt ?? _updatedAt,
      );
  String? get orderId => _orderId;
  String? get userId => _userId;
  List<Items>? get items => _items;
  num? get purchasedTimeadminCommissionCharges => _purchasedTimeadminCommissionCharges;
  num? get totalQuantity => _totalQuantity;
  num? get totalItems => _totalItems;
  num? get totalShippingCharges => _totalShippingCharges;
  num? get discount => _discount;
  num? get subTotal => _subTotal;
  num? get total => _total;
  num? get finalTotal => _finalTotal;
  ShippingAddress? get shippingAddress => _shippingAddress;
  String? get paymentGateway => _paymentGateway;
  String? get id => _id;
  String? get createdAt => _createdAt;
  String? get updatedAt => _updatedAt;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['orderId'] = _orderId;
    map['userId'] = _userId;
    if (_items != null) {
      map['items'] = _items?.map((v) => v.toJson()).toList();
    }
    map['purchasedTimeadminCommissionCharges'] = _purchasedTimeadminCommissionCharges;
    map['totalQuantity'] = _totalQuantity;
    map['totalItems'] = _totalItems;
    map['totalShippingCharges'] = _totalShippingCharges;
    map['discount'] = _discount;
    map['subTotal'] = _subTotal;
    map['total'] = _total;
    map['finalTotal'] = _finalTotal;
    if (_shippingAddress != null) {
      map['shippingAddress'] = _shippingAddress?.toJson();
    }
    map['paymentGateway'] = _paymentGateway;
    map['_id'] = _id;
    map['createdAt'] = _createdAt;
    map['updatedAt'] = _updatedAt;
    return map;
  }
}

ShippingAddress shippingAddressFromJson(String str) => ShippingAddress.fromJson(json.decode(str));
String shippingAddressToJson(ShippingAddress data) => json.encode(data.toJson());

class ShippingAddress {
  ShippingAddress({
    String? name,
    String? country,
    String? state,
    String? city,
    num? zipCode,
    String? address,
  }) {
    _name = name;
    _country = country;
    _state = state;
    _city = city;
    _zipCode = zipCode;
    _address = address;
  }

  ShippingAddress.fromJson(dynamic json) {
    _name = json['name'];
    _country = json['country'];
    _state = json['state'];
    _city = json['city'];
    _zipCode = json['zipCode'];
    _address = json['address'];
  }
  String? _name;
  String? _country;
  String? _state;
  String? _city;
  num? _zipCode;
  String? _address;
  ShippingAddress copyWith({
    String? name,
    String? country,
    String? state,
    String? city,
    num? zipCode,
    String? address,
  }) =>
      ShippingAddress(
        name: name ?? _name,
        country: country ?? _country,
        state: state ?? _state,
        city: city ?? _city,
        zipCode: zipCode ?? _zipCode,
        address: address ?? _address,
      );
  String? get name => _name;
  String? get country => _country;
  String? get state => _state;
  String? get city => _city;
  num? get zipCode => _zipCode;
  String? get address => _address;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['name'] = _name;
    map['country'] = _country;
    map['state'] = _state;
    map['city'] = _city;
    map['zipCode'] = _zipCode;
    map['address'] = _address;
    return map;
  }
}

Items itemsFromJson(String str) => Items.fromJson(json.decode(str));
String itemsToJson(Items data) => json.encode(data.toJson());

class Items {
  Items({
    Product? product,
    String? salon,
    num? purchasedTimeProductPrice,
    num? purchasedTimeShippingCharges,
    String? productCode,
    num? productQuantity,
    List<AttributesArray>? attributesArray,
    num? commissionPerProductQuantity,
    dynamic deliveredServiceName,
    dynamic trackingId,
    dynamic trackingLink,
    String? id,
    String? status,
    String? date,
  }) {
    _product = product;
    _salon = salon;
    _purchasedTimeProductPrice = purchasedTimeProductPrice;
    _purchasedTimeShippingCharges = purchasedTimeShippingCharges;
    _productCode = productCode;
    _productQuantity = productQuantity;
    _attributesArray = attributesArray;
    _commissionPerProductQuantity = commissionPerProductQuantity;
    _deliveredServiceName = deliveredServiceName;
    _trackingId = trackingId;
    _trackingLink = trackingLink;
    _id = id;
    _status = status;
    _date = date;
  }

  Items.fromJson(dynamic json) {
    _product = json['product'] != null ? Product.fromJson(json['product']) : null;
    _salon = json['salon'];
    _purchasedTimeProductPrice = json['purchasedTimeProductPrice'];
    _purchasedTimeShippingCharges = json['purchasedTimeShippingCharges'];
    _productCode = json['productCode'];
    _productQuantity = json['productQuantity'];
    if (json['attributesArray'] != null) {
      _attributesArray = [];
      json['attributesArray'].forEach((v) {
        _attributesArray?.add(AttributesArray.fromJson(v));
      });
    }
    _commissionPerProductQuantity = json['commissionPerProductQuantity'];
    _deliveredServiceName = json['deliveredServiceName'];
    _trackingId = json['trackingId'];
    _trackingLink = json['trackingLink'];
    _id = json['_id'];
    _status = json['status'];
    _date = json['date'];
  }
  Product? _product;
  String? _salon;
  num? _purchasedTimeProductPrice;
  num? _purchasedTimeShippingCharges;
  String? _productCode;
  num? _productQuantity;
  List<AttributesArray>? _attributesArray;
  num? _commissionPerProductQuantity;
  dynamic _deliveredServiceName;
  dynamic _trackingId;
  dynamic _trackingLink;
  String? _id;
  String? _status;
  String? _date;
  Items copyWith({
    Product? product,
    String? salon,
    num? purchasedTimeProductPrice,
    num? purchasedTimeShippingCharges,
    String? productCode,
    num? productQuantity,
    List<AttributesArray>? attributesArray,
    num? commissionPerProductQuantity,
    dynamic deliveredServiceName,
    dynamic trackingId,
    dynamic trackingLink,
    String? id,
    String? status,
    String? date,
  }) =>
      Items(
        product: product ?? _product,
        salon: salon ?? _salon,
        purchasedTimeProductPrice: purchasedTimeProductPrice ?? _purchasedTimeProductPrice,
        purchasedTimeShippingCharges: purchasedTimeShippingCharges ?? _purchasedTimeShippingCharges,
        productCode: productCode ?? _productCode,
        productQuantity: productQuantity ?? _productQuantity,
        attributesArray: attributesArray ?? _attributesArray,
        commissionPerProductQuantity: commissionPerProductQuantity ?? _commissionPerProductQuantity,
        deliveredServiceName: deliveredServiceName ?? _deliveredServiceName,
        trackingId: trackingId ?? _trackingId,
        trackingLink: trackingLink ?? _trackingLink,
        id: id ?? _id,
        status: status ?? _status,
        date: date ?? _date,
      );
  Product? get product => _product;
  String? get salon => _salon;
  num? get purchasedTimeProductPrice => _purchasedTimeProductPrice;
  num? get purchasedTimeShippingCharges => _purchasedTimeShippingCharges;
  String? get productCode => _productCode;
  num? get productQuantity => _productQuantity;
  List<AttributesArray>? get attributesArray => _attributesArray;
  num? get commissionPerProductQuantity => _commissionPerProductQuantity;
  dynamic get deliveredServiceName => _deliveredServiceName;
  dynamic get trackingId => _trackingId;
  dynamic get trackingLink => _trackingLink;
  String? get id => _id;
  String? get status => _status;
  String? get date => _date;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_product != null) {
      map['product'] = _product?.toJson();
    }
    map['salon'] = _salon;
    map['purchasedTimeProductPrice'] = _purchasedTimeProductPrice;
    map['purchasedTimeShippingCharges'] = _purchasedTimeShippingCharges;
    map['productCode'] = _productCode;
    map['productQuantity'] = _productQuantity;
    if (_attributesArray != null) {
      map['attributesArray'] = _attributesArray?.map((v) => v.toJson()).toList();
    }
    map['commissionPerProductQuantity'] = _commissionPerProductQuantity;
    map['deliveredServiceName'] = _deliveredServiceName;
    map['trackingId'] = _trackingId;
    map['trackingLink'] = _trackingLink;
    map['_id'] = _id;
    map['status'] = _status;
    map['date'] = _date;
    return map;
  }
}

AttributesArray attributesArrayFromJson(String str) => AttributesArray.fromJson(json.decode(str));
String attributesArrayToJson(AttributesArray data) => json.encode(data.toJson());

class AttributesArray {
  AttributesArray({
    String? name,
    String? value,
    String? id,
  }) {
    _name = name;
    _value = value;
    _id = id;
  }

  AttributesArray.fromJson(dynamic json) {
    _name = json['name'];
    _value = json['value'];
    _id = json['_id'];
  }
  String? _name;
  String? _value;
  String? _id;
  AttributesArray copyWith({
    String? name,
    String? value,
    String? id,
  }) =>
      AttributesArray(
        name: name ?? _name,
        value: value ?? _value,
        id: id ?? _id,
      );
  String? get name => _name;
  String? get value => _value;
  String? get id => _id;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['name'] = _name;
    map['value'] = _value;
    map['_id'] = _id;
    return map;
  }
}

Product productFromJson(String str) => Product.fromJson(json.decode(str));
String productToJson(Product data) => json.encode(data.toJson());

class Product {
  Product({
    String? id,
    String? productName,
    String? mainImage,
  }) {
    _id = id;
    _productName = productName;
    _mainImage = mainImage;
  }

  Product.fromJson(dynamic json) {
    _id = json['_id'];
    _productName = json['productName'];
    _mainImage = json['mainImage'];
  }
  String? _id;
  String? _productName;
  String? _mainImage;
  Product copyWith({
    String? id,
    String? productName,
    String? mainImage,
  }) =>
      Product(
        id: id ?? _id,
        productName: productName ?? _productName,
        mainImage: mainImage ?? _mainImage,
      );
  String? get id => _id;
  String? get productName => _productName;
  String? get mainImage => _mainImage;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['productName'] = _productName;
    map['mainImage'] = _mainImage;
    return map;
  }
}
