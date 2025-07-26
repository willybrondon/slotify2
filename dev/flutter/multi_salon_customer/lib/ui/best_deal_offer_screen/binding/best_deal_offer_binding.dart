import 'package:get/get.dart';
import 'package:salon_2/ui/best_deal_offer_screen/controller/best_deal_offer_controller.dart';

class BestDealOfferBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BestDealOfferController>(() => BestDealOfferController());
  }
}
