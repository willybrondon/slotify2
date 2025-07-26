import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/product_review_screen/controller/product_review_controller.dart';
import 'package:salon_2/ui/product_review_screen/widget/product_review_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class ProductReviewScreen extends StatelessWidget {
  const ProductReviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductReviewController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const ProductReviewAppBarView(),
            ),
            bottomNavigationBar: const ProductReviewButtonView(),
            body: const SingleChildScrollView(
              child: Column(
                children: [
                  ProductReviewImageView(),
                  ProductReviewDataView(),
                  ProductReviewGiveRatingView(),
                  ProductReviewGiveReviewView(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
