import 'package:get/get.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';

class EditProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<EditProfileController>(() => EditProfileController());
   }
}
