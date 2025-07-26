import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';
import 'package:salon_2/ui/product_detail_screen/widget/product_detail_widget.dart';
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
            appBar: PreferredSize(
              preferredSize: const Size.fromHeight(220),
              child: logic.isLoading.value ? Shimmers.productDetailImageShimmer() : const ProviderDetailAppBarView(),
            ),
            bottomNavigationBar: logic.isLoading.value ? const SizedBox() : const ProductDetailBottomView(),
            body: logic.isLoading.value ? Shimmers.productDetailShimmer() : const ProductDetailWidget(),
          ),
        );
      },
    );
  }
}
