import 'package:get/get.dart';
import 'package:salon_2/services/hair_profile_service.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/constant.dart';

class HairProfileController extends GetxController {
  final HairProfileService _service = HairProfileService.instance;

  String? hairType;
  String? hairCondition;
  String? styleInterest;
  String? scalpSensitivity;
  String? bookingGoal;

  static const hairTypes = [
    'hairType4c',
    'hairType4b',
    'hairType4a',
    'hairType3c',
    'hairTypeOther',
  ];

  static const conditions = [
    'hairCondHealthy',
    'hairCondDry',
    'hairCondDamaged',
    'hairCondTransition',
  ];

  static const interests = [
    'hairInterestBraids',
    'hairInterestLocks',
    'hairInterestNatural',
    'hairInterestWigs',
    'hairInterestMen',
    'hairInterestCare',
  ];

  static const scalpOptions = [
    'scalpNormal',
    'scalpSensitive',
  ];

  static const goals = [
    'goalEveryday',
    'goalEvent',
    'goalVacation',
    'goalNewLook',
  ];

  @override
  void onInit() {
    super.onInit();
    final existing = _service.load();
    hairType = existing.hairType;
    hairCondition = existing.hairCondition;
    styleInterest = existing.styleInterest;
    scalpSensitivity = existing.scalpSensitivity;
    bookingGoal = existing.bookingGoal;
  }

  void selectHairType(String id) {
    hairType = id;
    update();
  }

  void selectCondition(String id) {
    hairCondition = id;
    update();
  }

  void selectInterest(String id) {
    styleInterest = id;
    update();
  }

  void selectScalp(String id) {
    scalpSensitivity = id;
    update();
  }

  void selectGoal(String id) {
    bookingGoal = id;
    update();
  }

  bool get canSave =>
      hairType != null &&
      hairCondition != null &&
      styleInterest != null &&
      scalpSensitivity != null &&
      bookingGoal != null;

  Future<void> saveAndClose() async {
    if (!canSave) return;
    await _service.save(
      HairProfile(
        hairType: hairType,
        hairCondition: hairCondition,
        styleInterest: styleInterest,
        scalpSensitivity: scalpSensitivity,
        bookingGoal: bookingGoal,
      ),
    );
    if (Get.isRegistered<HomeScreenController>()) {
      Get.find<HomeScreenController>().update([Constant.idProgressView]);
    }
    Get.back(result: true);
  }
}
