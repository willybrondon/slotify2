class AiConciergeModel {
  bool? status;
  String? message;
  AiConciergeData? data;

  AiConciergeModel({this.status, this.message, this.data});

  AiConciergeModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? AiConciergeData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class AiConciergeData {
  BeautyAnalysis? analysis;
  Recommendations? recommendations;
  String? provider;

  AiConciergeData({this.analysis, this.recommendations, this.provider});

  AiConciergeData.fromJson(Map<String, dynamic> json) {
    analysis = json['analysis'] != null
        ? BeautyAnalysis.fromJson(json['analysis'])
        : null;
    recommendations = json['recommendations'] != null
        ? Recommendations.fromJson(json['recommendations'])
        : null;
    provider = json['provider'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (analysis != null) {
      data['analysis'] = analysis!.toJson();
    }
    if (recommendations != null) {
      data['recommendations'] = recommendations!.toJson();
    }
    data['provider'] = provider;
    return data;
  }
}

class BeautyAnalysis {
  SkinAnalysis? skin;
  HairAnalysis? hair;
  FaceAnalysis? face;
  BeautyProfile? beautyProfile;

  BeautyAnalysis({this.skin, this.hair, this.face, this.beautyProfile});

  BeautyAnalysis.fromJson(Map<String, dynamic> json) {
    skin = json['skin'] != null ? SkinAnalysis.fromJson(json['skin']) : null;
    hair = json['hair'] != null ? HairAnalysis.fromJson(json['hair']) : null;
    face = json['face'] != null ? FaceAnalysis.fromJson(json['face']) : null;
    beautyProfile = json['beautyProfile'] != null
        ? BeautyProfile.fromJson(json['beautyProfile'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (skin != null) {
      data['skin'] = skin!.toJson();
    }
    if (hair != null) {
      data['hair'] = hair!.toJson();
    }
    if (face != null) {
      data['face'] = face!.toJson();
    }
    if (beautyProfile != null) {
      data['beautyProfile'] = beautyProfile!.toJson();
    }
    return data;
  }
}

class SkinAnalysis {
  String? type;
  String? tone;
  String? undertone;
  List<String>? concerns;
  String? condition;
  String? texture;

  SkinAnalysis(
      {this.type,
      this.tone,
      this.undertone,
      this.concerns,
      this.condition,
      this.texture});

  SkinAnalysis.fromJson(Map<String, dynamic> json) {
    type = json['type'];
    tone = json['tone'];
    undertone = json['undertone'];
    concerns =
        json['concerns'] != null ? List<String>.from(json['concerns']) : null;
    condition = json['condition'];
    texture = json['texture'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['type'] = type;
    data['tone'] = tone;
    data['undertone'] = undertone;
    if (concerns != null) {
      data['concerns'] = concerns;
    }
    data['condition'] = condition;
    data['texture'] = texture;
    return data;
  }
}

class HairAnalysis {
  String? type;
  String? texture;
  String? color;
  String? condition;
  String? length;

  HairAnalysis(
      {this.type, this.texture, this.color, this.condition, this.length});

  HairAnalysis.fromJson(Map<String, dynamic> json) {
    type = json['type'];
    texture = json['texture'];
    color = json['color'];
    condition = json['condition'];
    length = json['length'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['type'] = type;
    data['texture'] = texture;
    data['color'] = color;
    data['condition'] = condition;
    data['length'] = length;
    return data;
  }
}

class FaceAnalysis {
  String? shape;
  String? eyeShape;
  String? lipShape;
  String? eyebrowShape;

  FaceAnalysis({this.shape, this.eyeShape, this.lipShape, this.eyebrowShape});

  FaceAnalysis.fromJson(Map<String, dynamic> json) {
    shape = json['shape'];
    eyeShape = json['eyeShape'];
    lipShape = json['lipShape'];
    eyebrowShape = json['eyebrowShape'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['shape'] = shape;
    data['eyeShape'] = eyeShape;
    data['lipShape'] = lipShape;
    data['eyebrowShape'] = eyebrowShape;
    return data;
  }
}

class BeautyProfile {
  String? ageEstimate;
  String? assessment;
  List<String>? areasToImprove;
  List<String>? featuresToEnhance;

  BeautyProfile(
      {this.ageEstimate,
      this.assessment,
      this.areasToImprove,
      this.featuresToEnhance});

  BeautyProfile.fromJson(Map<String, dynamic> json) {
    ageEstimate = json['ageEstimate'];
    assessment = json['assessment'];
    areasToImprove = json['areasToImprove'] != null
        ? List<String>.from(json['areasToImprove'])
        : null;
    featuresToEnhance = json['featuresToEnhance'] != null
        ? List<String>.from(json['featuresToEnhance'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['ageEstimate'] = ageEstimate;
    data['assessment'] = assessment;
    if (areasToImprove != null) {
      data['areasToImprove'] = areasToImprove;
    }
    if (featuresToEnhance != null) {
      data['featuresToEnhance'] = featuresToEnhance;
    }
    return data;
  }
}

class Recommendations {
  DetectedService? detectedService;
  List<ServiceItem>? services;
  List<SalonItem>? salons;
  List<ExpertItem>? experts;
  List<String>? beautyTips;
  bool? noMatch;
  String? noMatchMessage;
  bool? locationUsed;

  Recommendations({
    this.detectedService,
    this.services,
    this.salons,
    this.experts,
    this.beautyTips,
    this.noMatch,
    this.noMatchMessage,
    this.locationUsed,
  });

  Recommendations.fromJson(Map<String, dynamic> json) {
    detectedService = json['detectedService'] != null
        ? DetectedService.fromJson(json['detectedService'])
        : null;
    if (json['services'] != null) {
      services = <ServiceItem>[];
      json['services'].forEach((v) {
        services!.add(ServiceItem.fromJson(v));
      });
    }
    if (json['salons'] != null) {
      salons = <SalonItem>[];
      json['salons'].forEach((v) {
        salons!.add(SalonItem.fromJson(v));
      });
    }
    if (json['experts'] != null) {
      experts = <ExpertItem>[];
      json['experts'].forEach((v) {
        experts!.add(ExpertItem.fromJson(v));
      });
    }
    beautyTips = json['beautyTips'] != null
        ? List<String>.from(json['beautyTips'])
        : null;
    noMatch = json['noMatch'] == true;
    noMatchMessage = json['noMatchMessage']?.toString();
    locationUsed = json['locationUsed'] == true;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (detectedService != null) {
      data['detectedService'] = detectedService!.toJson();
    }
    if (services != null) {
      data['services'] = services!.map((v) => v.toJson()).toList();
    }
    if (salons != null) {
      data['salons'] = salons!.map((v) => v.toJson()).toList();
    }
    if (experts != null) {
      data['experts'] = experts!.map((v) => v.toJson()).toList();
    }
    if (beautyTips != null) {
      data['beautyTips'] = beautyTips;
    }
    data['noMatch'] = noMatch;
    data['noMatchMessage'] = noMatchMessage;
    data['locationUsed'] = locationUsed;
    return data;
  }
}

class DetectedService {
  String? label;
  String? summary;
  List<String>? categories;
  List<String>? keywords;
  ServiceItem? catalogMatch;

  DetectedService({this.label, this.summary, this.categories, this.keywords, this.catalogMatch});

  DetectedService.fromJson(Map<String, dynamic> json) {
    label = json['label']?.toString();
    summary = json['summary']?.toString();
    categories = json['categories'] != null
        ? List<String>.from(json['categories'])
        : null;
    keywords = json['keywords'] != null
        ? List<String>.from(json['keywords'])
        : null;
    catalogMatch = json['catalogMatch'] != null
        ? ServiceItem.fromJson(json['catalogMatch'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['label'] = label;
    data['summary'] = summary;
    if (categories != null) data['categories'] = categories;
    if (keywords != null) data['keywords'] = keywords;
    if (catalogMatch != null) data['catalogMatch'] = catalogMatch!.toJson();
    return data;
  }
}

class ServiceItem {
  String? id;
  String? name;
  String? image;
  int? duration;
  bool? status;
  String? categoryId;
  String? categoryName;
  String? shareUrl;
  num? price;

  ServiceItem(
      {this.id,
      this.name,
      this.image,
      this.duration,
      this.status,
      this.categoryId,
      this.categoryName,
      this.shareUrl,
      this.price});

  ServiceItem.fromJson(Map<String, dynamic> json) {
    // Handle _id which can be ObjectId or string
    if (json['_id'] != null) {
      id = json['_id'].toString();
    } else if (json['id'] != null) {
      id = json['id'].toString();
    } else {
      id = null;
    }

    name = json['name']?.toString();
    image = json['image']?.toString();
    duration = json['duration'] != null
        ? (json['duration'] is int
            ? json['duration']
            : int.tryParse(json['duration'].toString()))
        : null;
    status = json['status'] is bool
        ? json['status']
        : (json['status']?.toString().toLowerCase() == 'true');

    // Handle categoryId - can be object or string
    if (json['categoryId'] != null) {
      if (json['categoryId'] is Map) {
        categoryId = json['categoryId']['_id']?.toString() ??
            json['categoryId']['id']?.toString();
        categoryName = json['categoryId']['name']?.toString();
      } else {
        categoryId = json['categoryId'].toString();
        categoryName = json['categoryName']?.toString();
      }
    } else {
      categoryId = json['categoryId']?.toString();
      categoryName = json['categoryName']?.toString();
    }

    shareUrl = json['shareUrl']?.toString();
    price = json['price'] is num
        ? json['price']
        : num.tryParse(json['price']?.toString() ?? '');
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['name'] = name;
    data['image'] = image;
    data['duration'] = duration;
    data['status'] = status;
    data['categoryId'] = categoryId;
    data['categoryName'] = categoryName;
    data['shareUrl'] = shareUrl;
    data['price'] = price;
    return data;
  }
}

class MatchedServiceItem {
  String? id;
  String? name;
  String? image;
  int? duration;
  num? price;
  String? categoryName;

  MatchedServiceItem(
      {this.id, this.name, this.image, this.duration, this.price, this.categoryName});

  MatchedServiceItem.fromJson(Map<String, dynamic> json) {
    id = json['id']?.toString() ?? json['_id']?.toString();
    name = json['name']?.toString();
    image = json['image']?.toString();
    duration = json['duration'] != null
        ? (json['duration'] is int
            ? json['duration']
            : int.tryParse(json['duration'].toString()))
        : null;
    price = json['price'] is num
        ? json['price']
        : num.tryParse(json['price']?.toString() ?? '');
    categoryName = json['categoryName']?.toString();
  }
}

class MatchedExpertItem {
  String? id;
  String? name;
  String? image;
  double? review;

  MatchedExpertItem({this.id, this.name, this.image, this.review});

  MatchedExpertItem.fromJson(Map<String, dynamic> json) {
    id = json['id']?.toString() ?? json['_id']?.toString();
    name = json['name']?.toString();
    image = json['image']?.toString();
    review = json['review'] != null
        ? (json['review'] is num
            ? json['review'].toDouble()
            : double.tryParse(json['review'].toString()))
        : null;
  }
}

class SalonItem {
  String? id;
  String? name;
  String? image;
  double? review;
  String? address;
  String? shareUrl;
  double? distance;
  int? confidenceScore;
  MatchedServiceItem? matchedService;
  MatchedExpertItem? matchedExpert;

  SalonItem({
    this.id,
    this.name,
    this.image,
    this.review,
    this.address,
    this.shareUrl,
    this.distance,
    this.confidenceScore,
    this.matchedService,
    this.matchedExpert,
  });

  SalonItem.fromJson(Map<String, dynamic> json) {
    // Handle _id which can be ObjectId or string
    if (json['_id'] != null) {
      id = json['_id'].toString();
    } else if (json['id'] != null) {
      id = json['id'].toString();
    } else {
      id = null;
    }

    name = json['name']?.toString();
    final rawImage = json['mainImage']?.toString() ?? json['image']?.toString();
    image = (rawImage != null && rawImage.isNotEmpty) ? rawImage : null;
    if (image == null && json['image'] is List && (json['image'] as List).isNotEmpty) {
      for (final item in json['image']) {
        final url = item?.toString().trim() ?? '';
        if (url.isNotEmpty) {
          image = url;
          break;
        }
      }
    }
    review = json['review'] != null
        ? (json['review'] is num
            ? json['review'].toDouble()
            : double.tryParse(json['review'].toString()) ?? 0.0)
        : null;

    // Handle address — prefer preformatted string from API
    final rawAddress = json['address']?.toString().trim();
    if (rawAddress != null && rawAddress.isNotEmpty && rawAddress.toLowerCase() != 'null') {
      address = rawAddress;
    } else if (json['addressDetails'] is Map) {
      final details = json['addressDetails'] as Map;
      final parts = [
        details['addressLine1'],
        details['landMark'],
        details['city'],
        details['state'],
        details['country'],
      ]
          .map((p) => p?.toString().trim())
          .where((p) => p != null && p.isNotEmpty && p.toLowerCase() != 'null')
          .cast<String>()
          .toList();
      address = parts.isNotEmpty ? parts.join(', ') : null;
    } else if (json['address'] != null) {
      address = json['address'].toString();
    } else {
      address = null;
    }

    shareUrl = json['shareUrl']?.toString();
    distance = json['distance'] != null
        ? (json['distance'] is num
            ? json['distance'].toDouble()
            : double.tryParse(json['distance'].toString()))
        : null;
    confidenceScore = json['confidenceScore'] != null
        ? (json['confidenceScore'] is int
            ? json['confidenceScore']
            : int.tryParse(json['confidenceScore'].toString()))
        : null;
    matchedService = json['matchedService'] != null
        ? MatchedServiceItem.fromJson(json['matchedService'])
        : null;
    matchedExpert = json['matchedExpert'] != null
        ? MatchedExpertItem.fromJson(json['matchedExpert'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['name'] = name;
    data['image'] = image;
    data['review'] = review;
    data['address'] = address;
    data['shareUrl'] = shareUrl;
    return data;
  }
}

class ExpertItem {
  String? id;
  String? name;
  String? image;
  double? review;
  String? specialization;

  ExpertItem(
      {this.id, this.name, this.image, this.review, this.specialization});

  ExpertItem.fromJson(Map<String, dynamic> json) {
    id = json['_id'] ?? json['id'];
    name = json['name'] ?? json['fname'];
    image = json['image'];
    review = json['review']?.toDouble();
    specialization = json['specialization'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['name'] = name;
    data['image'] = image;
    data['review'] = review;
    data['specialization'] = specialization;
    return data;
  }
}
