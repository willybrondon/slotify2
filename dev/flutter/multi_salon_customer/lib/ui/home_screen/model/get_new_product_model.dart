import 'dart:convert';

GetNewProductModel getNewProductModelFromJson(String str) => GetNewProductModel.fromJson(json.decode(str));
String getNewProductModelToJson(GetNewProductModel data) => json.encode(data.toJson());

class GetNewProductModel {
  GetNewProductModel({
    bool? status,
    String? message,
    List<Data>? data,
  }) {
    _status = status;
    _message = message;
    _data = data;
  }

  GetNewProductModel.fromJson(dynamic json) {
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
  GetNewProductModel copyWith({
    bool? status,
    String? message,
    List<Data>? data,
  }) =>
      GetNewProductModel(
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
    String? productCode,
    num? price,
    num? shippingCharges,
    List<String>? images,
    num? quantity,
    num? review,
    num? sold,
    bool? isOutOfStock,
    String? createStatus,
    String? updateStatus,
    String? productName,
    String? description,
    String? category,
    String? salon,
    String? mainImage,
    bool? isBestSeller,
    num? mrp,
    bool? isFavourite,
  }) {
    _id = id;
    _productCode = productCode;
    _price = price;
    _shippingCharges = shippingCharges;
    _images = images;
    _quantity = quantity;
    _review = review;
    _sold = sold;
    _isOutOfStock = isOutOfStock;
    _createStatus = createStatus;
    _updateStatus = updateStatus;
    _productName = productName;
    _description = description;
    _category = category;
    _salon = salon;
    _mainImage = mainImage;
    _isBestSeller = isBestSeller;
    _mrp = mrp;
    _isFavourite = isFavourite;
  }

  Data.fromJson(dynamic json) {
    _id = json['_id'];
    _productCode = json['productCode'];
    _price = json['price'];
    _shippingCharges = json['shippingCharges'];
    _images = json['images'] != null ? json['images'].cast<String>() : [];
    _quantity = json['quantity'];
    _review = json['review'];
    _sold = json['sold'];
    _isOutOfStock = json['isOutOfStock'];
    _createStatus = json['createStatus'];
    _updateStatus = json['updateStatus'];
    _productName = json['productName'];
    _description = json['description'];
    _category = json['category'];
    _salon = json['salon'];
    _mainImage = json['mainImage'];
    _isBestSeller = json['isBestSeller'];
    _mrp = json['mrp'];
    _isFavourite = json['isFavourite'];
  }
  String? _id;
  String? _productCode;
  num? _price;
  num? _shippingCharges;
  List<String>? _images;
  num? _quantity;
  num? _review;
  num? _sold;
  bool? _isOutOfStock;
  String? _createStatus;
  String? _updateStatus;
  String? _productName;
  String? _description;
  String? _category;
  String? _salon;
  String? _mainImage;
  bool? _isBestSeller;
  num? _mrp;
  bool? _isFavourite;
  Data copyWith({
    String? id,
    String? productCode,
    num? price,
    num? shippingCharges,
    List<String>? images,
    num? quantity,
    num? review,
    num? sold,
    bool? isOutOfStock,
    String? createStatus,
    String? updateStatus,
    String? productName,
    String? description,
    String? category,
    String? salon,
    String? mainImage,
    bool? isBestSeller,
    num? mrp,
    bool? isFavourite,
  }) =>
      Data(
        id: id ?? _id,
        productCode: productCode ?? _productCode,
        price: price ?? _price,
        shippingCharges: shippingCharges ?? _shippingCharges,
        images: images ?? _images,
        quantity: quantity ?? _quantity,
        review: review ?? _review,
        sold: sold ?? _sold,
        isOutOfStock: isOutOfStock ?? _isOutOfStock,
        createStatus: createStatus ?? _createStatus,
        updateStatus: updateStatus ?? _updateStatus,
        productName: productName ?? _productName,
        description: description ?? _description,
        category: category ?? _category,
        salon: salon ?? _salon,
        mainImage: mainImage ?? _mainImage,
        isBestSeller: isBestSeller ?? _isBestSeller,
        mrp: mrp ?? _mrp,
        isFavourite: isFavourite ?? _isFavourite,
      );
  String? get id => _id;
  String? get productCode => _productCode;
  num? get price => _price;
  num? get shippingCharges => _shippingCharges;
  List<String>? get images => _images;
  num? get quantity => _quantity;
  num? get review => _review;
  num? get sold => _sold;
  bool? get isOutOfStock => _isOutOfStock;
  String? get createStatus => _createStatus;
  String? get updateStatus => _updateStatus;
  String? get productName => _productName;
  String? get description => _description;
  String? get category => _category;
  String? get salon => _salon;
  String? get mainImage => _mainImage;
  bool? get isBestSeller => _isBestSeller;
  num? get mrp => _mrp;
  bool? get isFavourite => _isFavourite;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['_id'] = _id;
    map['productCode'] = _productCode;
    map['price'] = _price;
    map['shippingCharges'] = _shippingCharges;
    map['images'] = _images;
    map['quantity'] = _quantity;
    map['review'] = _review;
    map['sold'] = _sold;
    map['isOutOfStock'] = _isOutOfStock;
    map['createStatus'] = _createStatus;
    map['updateStatus'] = _updateStatus;
    map['productName'] = _productName;
    map['description'] = _description;
    map['category'] = _category;
    map['salon'] = _salon;
    map['mainImage'] = _mainImage;
    map['isBestSeller'] = _isBestSeller;
    map['mrp'] = _mrp;
    map['isFavourite'] = _isFavourite;
    return map;
  }
}
