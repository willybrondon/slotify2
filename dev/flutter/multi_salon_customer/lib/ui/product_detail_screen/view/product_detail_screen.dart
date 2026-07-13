import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';
import 'package:salon_2/ui/product_detail_screen/widget/product_detail_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading1.value,
          child: Scaffold(
            backgroundColor: AppColors.backGround,
            appBar: PreferredSize(
              preferredSize: Size.fromHeight(Get.height * 0.3),
              child: AppBar(
                automaticallyImplyLeading: false,
                backgroundColor: Colors.transparent,
                elevation: 0,
                scrolledUnderElevation: 0,
                toolbarHeight: Get.height * 0.3,
                flexibleSpace: logic.isLoading.value
                    ? Shimmers.productDetailImageShimmer()
                    : const ProviderDetailAppBarView(),
              ),
            ),
            bottomNavigationBar: logic.isLoading.value
                ? const SizedBox()
                : const ProductDetailBottomView(),
            body: logic.isLoading.value
                ? Shimmers.productDetailShimmer()
                : const ProductDetailWidget(),
          ),
        );
      },
    );
  }
}
