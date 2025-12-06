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
      {this.type, this.tone, this.undertone, this.concerns, this.condition, this.texture});

  SkinAnalysis.fromJson(Map<String, dynamic> json) {
    type = json['type'];
    tone = json['tone'];
    undertone = json['undertone'];
    concerns = json['concerns'] != null ? List<String>.from(json['concerns']) : null;
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

  HairAnalysis({this.type, this.texture, this.color, this.condition, this.length});

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
      {this.ageEstimate, this.assessment, this.areasToImprove, this.featuresToEnhance});

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
  List<ServiceItem>? services;
  List<SalonItem>? salons;
  List<ExpertItem>? experts;
  List<String>? beautyTips;

  Recommendations({this.services, this.salons, this.experts, this.beautyTips});

  Recommendations.fromJson(Map<String, dynamic> json) {
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
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
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

  ServiceItem({this.id, this.name, this.image, this.duration, this.status, this.categoryId, this.categoryName, this.shareUrl});

  ServiceItem.fromJson(Map<String, dynamic> json) {
    id = json['_id'] ?? json['id'];
    name = json['name'];
    image = json['image'];
    duration = json['duration'];
    status = json['status'];
    categoryId = json['categoryId']?['_id'] ?? json['categoryId'];
    categoryName = json['categoryId']?['name'] ?? json['categoryName'];
    shareUrl = json['shareUrl'];
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
    return data;
  }
}

class SalonItem {
  String? id;
  String? name;
  String? image;
  double? review;
  String? address;

  SalonItem({this.id, this.name, this.image, this.review, this.address});

  SalonItem.fromJson(Map<String, dynamic> json) {
    id = json['_id'] ?? json['id'];
    name = json['name'];
    image = json['mainImage'] ?? json['image'];
    review = json['review']?.toDouble();
    address = json['addressDetails'] != null
        ? json['addressDetails']['addressLine1']
        : json['address'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['name'] = name;
    data['image'] = image;
    data['review'] = review;
    data['address'] = address;
    return data;
  }
}

class ExpertItem {
  String? id;
  String? name;
  String? image;
  double? review;
  String? specialization;

  ExpertItem({this.id, this.name, this.image, this.review, this.specialization});

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

