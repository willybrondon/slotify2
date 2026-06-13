import 'dart:convert';

import 'package:get_storage/get_storage.dart';

/// Lightweight « mémoire capillaire » — 5 champs, stockage local.
class HairProfile {
  final String? hairType;
  final String? hairCondition;
  final String? styleInterest;
  final String? scalpSensitivity;
  final String? bookingGoal;

  const HairProfile({
    this.hairType,
    this.hairCondition,
    this.styleInterest,
    this.scalpSensitivity,
    this.bookingGoal,
  });

  bool get isComplete =>
      hairType != null &&
      hairType!.isNotEmpty &&
      hairCondition != null &&
      hairCondition!.isNotEmpty &&
      styleInterest != null &&
      styleInterest!.isNotEmpty &&
      scalpSensitivity != null &&
      scalpSensitivity!.isNotEmpty &&
      bookingGoal != null &&
      bookingGoal!.isNotEmpty;

  Map<String, String> toApiFields() {
    final map = <String, String>{};
    if (hairType != null && hairType!.isNotEmpty) map['hairType'] = hairType!;
    if (hairCondition != null && hairCondition!.isNotEmpty) {
      map['hairCondition'] = hairCondition!;
    }
    if (styleInterest != null && styleInterest!.isNotEmpty) {
      map['styleInterest'] = styleInterest!;
    }
    if (scalpSensitivity != null && scalpSensitivity!.isNotEmpty) {
      map['scalpSensitivity'] = scalpSensitivity!;
    }
    if (bookingGoal != null && bookingGoal!.isNotEmpty) {
      map['bookingGoal'] = bookingGoal!;
    }
    return map;
  }

  Map<String, dynamic> toJson() => {
        'hairType': hairType,
        'hairCondition': hairCondition,
        'styleInterest': styleInterest,
        'scalpSensitivity': scalpSensitivity,
        'bookingGoal': bookingGoal,
      };

  factory HairProfile.fromJson(Map<String, dynamic> json) {
    return HairProfile(
      hairType: json['hairType'] as String?,
      hairCondition: json['hairCondition'] as String?,
      styleInterest: json['styleInterest'] as String?,
      scalpSensitivity: json['scalpSensitivity'] as String?,
      bookingGoal: json['bookingGoal'] as String?,
    );
  }

  HairProfile copyWith({
    String? hairType,
    String? hairCondition,
    String? styleInterest,
    String? scalpSensitivity,
    String? bookingGoal,
  }) {
    return HairProfile(
      hairType: hairType ?? this.hairType,
      hairCondition: hairCondition ?? this.hairCondition,
      styleInterest: styleInterest ?? this.styleInterest,
      scalpSensitivity: scalpSensitivity ?? this.scalpSensitivity,
      bookingGoal: bookingGoal ?? this.bookingGoal,
    );
  }
}

class HairProfileService {
  HairProfileService._();
  static final HairProfileService instance = HairProfileService._();

  static const _storageKey = 'skedisy_hair_profile';
  static const _promptedKey = 'skedisy_hair_profile_prompted';

  final GetStorage _box = GetStorage();

  HairProfile load() {
    final raw = _box.read<String>(_storageKey);
    if (raw == null || raw.isEmpty) return const HairProfile();
    try {
      return HairProfile.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    } catch (_) {
      return const HairProfile();
    }
  }

  Future<void> save(HairProfile profile) async {
    await _box.write(_storageKey, jsonEncode(profile.toJson()));
  }

  bool get isComplete => load().isComplete;

  bool get hasBeenPrompted => _box.read<bool>(_promptedKey) == true;

  Future<void> markPrompted() async {
    await _box.write(_promptedKey, true);
  }
}
