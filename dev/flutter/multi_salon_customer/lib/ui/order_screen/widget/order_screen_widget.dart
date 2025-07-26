import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/order_screen/controller/order_screen_controller.dart';
import 'package:salon_2/ui/order_screen/model/get_order_model.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class OrderAppBarView extends StatelessWidget {
  const OrderAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtMyOrder".tr,
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        onTap: () {
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
        ),
      ),
    );
  }
}

class OrderListView extends StatelessWidget {
  const OrderListView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getOrderModel?.orderData?.isEmpty == true
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      AppAsset.icNoService,
                      height: 170,
                      width: 170,
                    ),
                    Text(
                      "desNoOrderPlaced".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                        fontSize: 17,
                        color: AppColors.primaryTextColor,
                      ),
                    )
                  ],
                ),
              )
            : ListView.builder(
                shrinkWrap: true,
                physics: const BouncingScrollPhysics(),
                itemCount: logic.getOrderModel?.orderData?.length ?? 0,
                scrollDirection: Axis.vertical,
                padding: EdgeInsets.zero,
                itemBuilder: (context, orderIndex) {
                  var order = logic.getOrderModel?.orderData?[orderIndex];
                  return Column(
                    children: order?.items?.map(
                          (item) {
                            return OrderListItemView(
                              items: item,
                              orderData: order,
                            );
                          },
                        ).toList() ??
                        [],
                  );
                },
              ).paddingAll(12);
      },
    );
  }
}

class OrderListItemView extends StatelessWidget {
  final Items items;
  final OrderData orderData;
  const OrderListItemView({super.key, required this.items, required this.orderData});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return InkWell(
          onTap: () {
            Get.toNamed(
              AppRoutes.orderDetail,
              arguments: [items, orderData],
            )?.then(
              (value) async {
                await logic.onGetOrderApiCall(
                  userId: Constant.storage.read<String>('userId') ?? "",
                  status: "All",
                  start: "0",
                  limit: "20",
                );
              },
            );
          },
          overlayColor: const WidgetStatePropertyAll(WidgetStateColor.transparent),
          child: Container(
            height: 132,
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: AppColors.blackColor.withOpacity(0.1),
                width: 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 67,
                      width: 67,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: AppColors.orderBg,
                      ),
                      clipBehavior: Clip.hardEdge,
                      child: CachedNetworkImage(
                        imageUrl: items.product?.mainImage ?? "",
                        fit: BoxFit.cover,
                        placeholder: (context, url) {
                          return Image.asset(AppAsset.icImagePlaceholder).paddingAll(15);
                        },
                        errorWidget: (context, url, error) {
                          return Image.asset(AppAsset.icImagePlaceholder).paddingAll(15);
                        },
                      ),
                    ),
                    Container(
                      height: 67,
                      width: Get.width * 0.58,
                      padding: const EdgeInsets.only(top: 5, bottom: 5),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            Constant.capitalizeFirstLetter(items.product?.productName ?? ""),
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo700,
                              fontSize: 14,
                              color: AppColors.appText,
                            ),
                          ),
                          Text(
                            items.product?.brand ?? "",
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo700,
                              fontSize: 11,
                              color: AppColors.brandColor,
                            ),
                          ),
                          Row(
                            children: [
                              Text(
                                "${"txtQTY".tr} :  ",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 11,
                                  color: AppColors.qtyColor,
                                ),
                              ),
                              Text(
                                items.productQuantity.toString(),
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 11,
                                  color: AppColors.qtyColor,
                                ),
                              ),
                              const SizedBox(width: 15),
                              Text(
                                "${"txtPayment".tr}: ${orderData.finalTotal?.toStringAsFixed(0) ?? ""}$currency",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 11,
                                  color: AppColors.qtyColor,
                                ),
                              ).paddingOnly(right: 12),
                            ],
                          ),
                        ],
                      ),
                    ).paddingOnly(left: 10),
                    const Spacer(),
                    Image.asset(AppAsset.icArrowRight, height: 25, color: AppColors.arrowColor),
                  ],
                ).paddingOnly(left: 10, right: 10, top: 10),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.orderColorBg.withOpacity(0.2),
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "${"txtOrderedOn".tr} ${logic.onGetDate(date: items.date ?? "")}",
                        style: TextStyle(
                          fontFamily: AppFontFamily.heeBo600,
                          fontSize: 11,
                          color: AppColors.qtyColor,
                        ),
                      ),
                      Container(
                        height: 20,
                        width: 0.5,
                        color: AppColors.qtyColor.withOpacity(0.2),
                      ),
                      Text(
                        "${"txtID".tr} : ${orderData.orderId ?? ""}",
                        style: TextStyle(
                          fontFamily: AppFontFamily.heeBo600,
                          fontSize: 11,
                          color: AppColors.qtyColor,
                        ),
                      ),
                      Container(
                        height: 20,
                        width: 0.5,
                        color: AppColors.qtyColor.withOpacity(0.2),
                      ),
                      Text(
                        "${"txtOrderStatus".tr} : ${items.status ?? ""}",
                        style: TextStyle(
                          fontFamily: AppFontFamily.heeBo700,
                          fontSize: 11,
                          color: items.status == "Pending" || items.status == "Delivered"
                              ? AppColors.greenText
                              : items.status == "Confirmed" || items.status == "Out Of Delivery"
                                  ? AppColors.orange
                                  : AppColors.redText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).paddingOnly(bottom: 10),
        );
      },
    );
  }
}
