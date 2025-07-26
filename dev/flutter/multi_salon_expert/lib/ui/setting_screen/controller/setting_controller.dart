import 'package:get/get.dart';
import 'package:salon_2/utils/constant.dart';

class SettingController extends GetxController {
  bool? isSwitchOn;

  @override
  void onInit() {
    Constant.storage.read("notification") == false
        ? Constant.storage.write("notification", false)
        : Constant.storage.write("notification", true);

    isSwitchOn = Constant.storage.read("notification");
    super.onInit();
  }

  onSwitch(value) {
    isSwitchOn = value;
    update([Constant.idSwitchOn]);
  }
}
