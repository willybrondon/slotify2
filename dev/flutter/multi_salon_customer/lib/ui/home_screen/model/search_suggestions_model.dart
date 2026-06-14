import 'dart:convert';

SearchSuggestionsModel searchSuggestionsModelFromJson(String str) =>
    SearchSuggestionsModel.fromJson(json.decode(str));

class SearchSuggestionsModel {
  SearchSuggestionsModel({
    bool? status,
    List<SuggestCategory>? categories,
    List<SuggestService>? services,
  }) {
    _status = status;
    _categories = categories;
    _services = services;
  }

  SearchSuggestionsModel.fromJson(dynamic json) {
    _status = json['status'];
    if (json['categories'] != null) {
      _categories = [];
      for (final v in json['categories']) {
        _categories?.add(SuggestCategory.fromJson(v));
      }
    }
    if (json['services'] != null) {
      _services = [];
      for (final v in json['services']) {
        _services?.add(SuggestService.fromJson(v));
      }
    }
  }

  bool? _status;
  List<SuggestCategory>? _categories;
  List<SuggestService>? _services;

  bool? get status => _status;
  List<SuggestCategory>? get categories => _categories;
  List<SuggestService>? get services => _services;
}

class SuggestCategory {
  SuggestCategory({String? id, String? name, String? image, String? url}) {
    _id = id;
    _name = name;
    _image = image;
    _url = url;
  }

  SuggestCategory.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
    _image = json['image'];
    _url = json['url'];
  }

  String? _id;
  String? _name;
  String? _image;
  String? _url;

  String? get id => _id;
  String? get name => _name;
  String? get image => _image;
  String? get url => _url;
}

class SuggestService {
  SuggestService({String? id, String? name}) {
    _id = id;
    _name = name;
  }

  SuggestService.fromJson(dynamic json) {
    _id = json['_id'];
    _name = json['name'];
  }

  String? _id;
  String? _name;

  String? get id => _id;
  String? get name => _name;
}
