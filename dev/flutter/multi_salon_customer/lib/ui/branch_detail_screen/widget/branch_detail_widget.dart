import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

// QR Code Dialog
void _showQRCodeDialog(BuildContext context, BranchDetailController logic) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Scan QR Code',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: AppFontFamily.heeBo800,
                  color: AppColors.primaryAppColor,
                ),
              ),
              const SizedBox(height: 20),
              FutureBuilder<String?>(
                future: logic.getShareUrl(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const CircularProgressIndicator();
                  }
                  if (snapshot.hasData && snapshot.data != null) {
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.whiteColor,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.blackColor.withOpacity(0.08),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: QrImageView(
                        data: snapshot.data!,
                        version: QrVersions.auto,
                        size: 250.0,
                        backgroundColor: AppColors.whiteColor,
                        errorCorrectionLevel: QrErrorCorrectLevel.H,
                        eyeStyle: QrEyeStyle(
                          eyeShape: QrEyeShape.circle,
                          color: AppColors.blackColor,
                        ),
                        embeddedImage: AssetImage(AppAsset.icSkedisyLogo),
                        embeddedImageStyle: QrEmbeddedImageStyle(
                          size: Size(56, 56),
                        ),
                      ),
                    );
                  }
                  return Text(
                    'Unable to generate QR code',
                    style: TextStyle(
                      color: AppColors.primaryTextColor,
                      fontFamily: AppFontFamily.heeBo600,
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),
              Text(
                logic.getSalonDetailCategory?.salon?.name ?? 'Salon',
                style: TextStyle(
                  fontSize: 16,
                  fontFamily: AppFontFamily.heeBo700,
                  color: AppColors.primaryTextColor,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryAppColor,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: Text(
                  'Close',
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: AppFontFamily.heeBo700,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

/// =================== Branch Detail Top view =================== ///
class BranchDetailTopView extends StatelessWidget {
  const BranchDetailTopView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        final imageUrl =
            logic.getSalonDetailCategory?.salon?.mainImage?.trim() ?? '';

        return Stack(
          fit: StackFit.expand,
          children: [
            if (imageUrl.isNotEmpty)
              CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
                placeholder: (context, url) {
                  return ColoredBox(
                    color: AppColors.grey.withOpacity(0.2),
                    child: Center(
                      child: Image.asset(AppAsset.icImagePlaceholder)
                          .paddingAll(25),
                    ),
                  );
                },
                errorWidget: (context, url, error) {
                  return ColoredBox(
                    color: AppColors.grey.withOpacity(0.2),
                    child: Center(
                      child: Image.asset(AppAsset.icImagePlaceholder)
                          .paddingAll(30),
                    ),
                  );
                },
              )
            else
              ColoredBox(
                color: AppColors.grey.withOpacity(0.2),
                child: Center(
                  child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(25),
                ),
              ),
            // Back arrow and share button aligned horizontally in same row
            Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () {
                            Get.back();
                          },
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.blackColor.withOpacity(0.1),
                                  offset: const Offset(0, 2),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.arrow_back,
                              color: AppColors.blackColor,
                              size: 20,
                            ),
                          ),
                        ),
                        PopupMenuButton<String>(
                          icon: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.blackColor.withOpacity(0.1),
                                  offset: const Offset(0, 2),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.share,
                              color: AppColors.blackColor,
                              size: 20,
                            ),
                          ),
                          color: AppColors.whiteColor,
                          onSelected: (value) async {
                            if (value == 'share') {
                              await logic.shareSalonLink();
                            } else if (value == 'copy') {
                              await logic.copySalonLink();
                            } else if (value == 'qr') {
                              _showQRCodeDialog(context, logic);
                            }
                          },
                          itemBuilder: (BuildContext context) => [
                            PopupMenuItem<String>(
                              value: 'share',
                              child: Row(
                                children: [
                                  Icon(Icons.share,
                                      color: AppColors.primaryAppColor),
                                  const SizedBox(width: 10),
                                  Text('txtShareLink'.tr),
                                ],
                              ),
                            ),
                            PopupMenuItem<String>(
                              value: 'copy',
                              child: Row(
                                children: [
                                  Icon(Icons.copy,
                                      color: AppColors.primaryAppColor),
                                  const SizedBox(width: 10),
                                  Text('txtCopyLink'.tr),
                                ],
                              ),
                            ),
                            PopupMenuItem<String>(
                              value: 'qr',
                              child: Row(
                                children: [
                                  Icon(Icons.qr_code,
                                      color: AppColors.primaryAppColor),
                                  const SizedBox(width: 10),
                                  Text('txtShowQRCode'.tr),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
        );
      },
    );
  }
}

/// =================== Branch Detail Info view =================== ///
class BranchDetailInfoView extends StatelessWidget {
  const BranchDetailInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.branchDetailShimmer()
            : NestedScrollView(
                headerSliverBuilder: (context, innerBoxIsScrolled) {
                  return [
                    const SliverList(
                      delegate: SliverChildListDelegate.fixed(
                        [BranchDetailDataView()],
                      ),
                    ),
                  ];
                },
                body: const BranchDetailTabView(),
              );
      },
    );
  }
}

class BranchDetailDataView extends StatelessWidget {
  const BranchDetailDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Container(
          // color: AppColors.detailBg, -- chnage the color background to detailBg detail to alihn with the hamoe background color
          color: AppColors.backGround,
          child: Column(
            children: [
              // Enhanced salon name with better visual hierarchy
              Container(
                margin: const EdgeInsets.only(
                    top: 8, left: 15, right: 15, bottom: 2),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        logic.getSalonDetailCategory?.salon?.name ?? "",
                        style: TextStyle(
                          color: AppColors.appText,
                          fontFamily: AppFontFamily.heeBo800,
                          fontSize: 22,
                          letterSpacing: 0.5,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Address section - simple row
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Image.asset(
                      AppAsset.icLocation,
                      height: 18,
                      width: 18,
                      color: AppColors.grey,
                    ).paddingOnly(right: 12),
                    Expanded(
                      child: Text(
                        "${logic.getSalonDetailCategory?.salon?.addressDetails?.addressLine1}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.landMark}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.city}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.state}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.country}",
                        style: TextStyle(
                          color: AppColors.termsDialog,
                          fontFamily: AppFontFamily.heeBo600,
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Distance section - simple row
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 2),
                child: Row(
                  children: [
                    Image.asset(
                      AppAsset.icDirection,
                      height: 18,
                      width: 18,
                      color: AppColors.grey,
                    ).paddingOnly(right: 12),
                    RichText(
                      text: TextSpan(
                        text: logic.getSalonDetailCategory?.salon?.distance ==
                                null
                            ? ""
                            : "${logic.getSalonDetailCategory?.salon?.distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.appText,
                          fontFamily: AppFontFamily.heeBo700,
                        ),
                        children: <TextSpan>[
                          TextSpan(
                            text: 'txtFromLocation'.tr,
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: AppFontFamily.heeBo600,
                              color: AppColors.termsDialog,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Rating section - simple row
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 2),
                child: Row(
                  children: [
                    Image.asset(
                      AppAsset.icStarFilled,
                      height: 18,
                      width: 18,
                      color: AppColors.brandBlack,
                    ).paddingOnly(right: 12),
                    RichText(
                      text: TextSpan(
                        text: (logic.getSalonDetailCategory?.salon?.review ??
                                    0) >
                                0
                            ? logic.getSalonDetailCategory!.salon!.review!
                                .toStringAsFixed(1)
                            : '—',
                        style: TextStyle(
                          color: AppColors.brandBlack,
                          fontSize: 17,
                          fontFamily: AppFontFamily.heeBo700,
                        ),
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                "  (${logic.getSalonDetailCategory?.salon?.reviewCount ?? 0})",
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: AppFontFamily.heeBo600,
                              color: AppColors.termsDialog,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Enhanced action buttons with better design
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          logic.launchMaps();
                        },
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: AppColors.appText,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.blackColor.withOpacity(0.15),
                                offset: const Offset(0, 4),
                                blurRadius: 12,
                                spreadRadius: 0,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset(
                                AppAsset.icDirection,
                                height: 24,
                                width: 24,
                                color: AppColors.whiteColor,
                              ).paddingOnly(right: 12),
                              Text(
                                "txtDirection".tr,
                                style: TextStyle(
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.heeBo600,
                                  fontSize: 17,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          logic.makingPhoneCall();
                        },
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: AppColors.appText,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.blackColor.withOpacity(0.15),
                                offset: const Offset(0, 4),
                                blurRadius: 12,
                                spreadRadius: 0,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset(
                                AppAsset.icCall,
                                height: 24,
                                width: 24,
                                color: AppColors.whiteColor,
                              ).paddingOnly(right: 12),
                              Text(
                                "txtCallSalon".tr,
                                style: TextStyle(
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.heeBo600,
                                  fontSize: 17,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// =================== Branch Detail TabBar view =================== ///
class BranchDetailTabView extends StatelessWidget {
  const BranchDetailTabView({super.key});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.whiteColor,
      child: Column(
        children: [
          const BranchDetailTabBarView(),
          Divider(
            height: 1,
            color: AppColors.greyColor.withOpacity(0.15),
          ),
          const BranchDetailTabBarItemView(),
        ],
      ),
    );
  }
}

class BranchDetailTabBarView extends StatefulWidget {
  const BranchDetailTabBarView({super.key});

  @override
  State<BranchDetailTabBarView> createState() => _BranchDetailTabBarViewState();
}

class _BranchDetailTabBarViewState extends State<BranchDetailTabBarView> {
  BranchDetailController? _logic;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final logic = Get.find<BranchDetailController>();
    if (_logic != logic) {
      _logic?.tabController?.removeListener(_onTabChanged);
      _logic = logic;
      _logic?.tabController?.addListener(_onTabChanged);
    }
  }

  @override
  void dispose() {
    _logic?.tabController?.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      builder: (logic) {
        final controller = logic.tabController;
        if (controller == null) return const SizedBox.shrink();

        return SizedBox(
          height: 52,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            itemCount: logic.tabs.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final selected = controller.index == index;
              return GestureDetector(
                onTap: () => controller.animateTo(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.brandBlack
                        : AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: selected
                          ? AppColors.brandBlack
                          : AppColors.greyColor.withOpacity(0.35),
                    ),
                  ),
                  child: Text(
                    _tabLabel(logic.tabs[index]),
                    style: TextStyle(
                      fontSize: 14,
                      fontFamily: AppFontFamily.heeBo600,
                      color: selected
                          ? AppColors.whiteColor
                          : AppColors.brandBlack,
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  String _tabLabel(Tab tab) {
    final child = tab.child;
    if (child is Text) return child.data ?? '';
    return '';
  }
}

/// =================== Branch Detail TabBar item iew =================== ///
class BranchDetailTabBarItemView extends StatelessWidget {
  const BranchDetailTabBarItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GetBuilder<BranchDetailController>(
        builder: (logic) {
          return TabBarView(
            physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics()),
            controller: logic.tabController,
            children: const [
              BranchDetailTabBarServiceView(),
              BranchDetailTabBarProductView(),
              BranchDetailTabBarStaffView(),
              BranchDetailTabBarGalleryView(),
              BranchDetailTabBarReviewView(),
              BranchDetailTabBarAboutView(),
            ],
          );
        },
      ),
    );
  }
}

/// =================== About View
class BranchDetailTabBarAboutView extends StatelessWidget {
  const BranchDetailTabBarAboutView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: GetBuilder<BranchDetailController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                logic.getSalonDetailCategory?.salon?.about?.isEmpty == true
                    ? const SizedBox()
                    : Text(
                        logic.getSalonDetailCategory?.salon?.about ?? "",
                        style: TextStyle(
                          color: AppColors.termsDialog,
                          fontFamily: AppFontFamily.heeBo400,
                          fontSize: 13,
                        ),
                      ).paddingOnly(bottom: 13),
                Text(
                  "txtWorkingHours".tr,
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo800,
                    color: AppColors.locationText,
                    fontSize: 18,
                  ),
                ),
                for (logic.index = 0;
                    logic.index <
                        (logic.getSalonDetailCategory?.salon?.salonTime
                                ?.length ??
                            0);
                    logic.index++)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        logic.getSalonDetailCategory?.salon
                                ?.salonTime?[logic.index].day ??
                            "",
                        style: TextStyle(
                          fontSize: 15,
                          fontFamily: AppFontFamily.heeBo500,
                          color: AppColors.service,
                        ),
                      ).paddingOnly(top: 15),
                      Text(
                        "${logic.getSalonDetailCategory?.salon?.salonTime?[logic.index].openTime} - ${logic.getSalonDetailCategory?.salon?.salonTime?[logic.index].closedTime}",
                        style: TextStyle(
                          fontSize: 15,
                          fontFamily: AppFontFamily.heeBo700,
                          color: AppColors.brandBlack,
                        ),
                      ).paddingOnly(top: 15)
                    ],
                  ),
              ],
            ).paddingOnly(left: 15, right: 15);
          },
        ),
      ),
    );
  }
}

/// =================== Service View
class BranchDetailTabBarServiceView extends StatelessWidget {
  const BranchDetailTabBarServiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: GetBuilder<BranchDetailController>(
        id: Constant.idBottomService,
        builder: (logic) {
          return logic.checkItem.isNotEmpty
              ? SafeArea(
                  top: false,
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.categoryBottom,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.blackColor.withOpacity(0.05),
                          offset: const Offset(0.0, 1.0),
                          blurRadius: 2.0,
                          spreadRadius: 2.0,
                        ),
                        const BoxShadow(
                          color: Colors.black12,
                          offset: Offset(0.0, 0.0),
                          blurRadius: 0.0,
                          spreadRadius: 0.0,
                        ),
                      ],
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SizedBox(
                          height: 22,
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Text(
                              logic.checkItem.join(", "),
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 16,
                                color: AppColors.categoryService,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$currency${logic.withOutTaxRupee.toStringAsFixed(2)} · ${logic.totalMinute} ${"txtMin".tr}',
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 15,
                            color: AppColors.brandBlack,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr}',
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 13,
                            color: AppColors.termsDialog,
                          ),
                        ),
                        const SizedBox(height: 10),
                        AppButton(
                          height: 50,
                          buttonColor: AppColors.appText,
                          buttonText: "txtBookNow".tr,
                          width: double.infinity,
                          fontFamily: AppFontFamily.sfProDisplay,
                          color: AppColors.whiteColor,
                          onTap: () async {
                            if (Constant.storage.read<bool>('isLogIn') ??
                                false) {
                              log("Total Minute :: ${logic.totalMinute}");
                              Get.toNamed(AppRoutes.booking, arguments: [
                                logic.checkItem,
                                double.parse(
                                    logic.totalPrice.toStringAsFixed(2)),
                                double.parse(
                                    logic.finalTaxRupee.toStringAsFixed(2)),
                                logic.totalMinute,
                                logic.serviceId,
                                logic.withOutTaxRupee,
                                logic.salonId
                              ]);
                            } else {
                              Get.toNamed(AppRoutes.signIn,
                                  arguments: [logic.checkItem.isNotEmpty]);
                              await Get.find<SignInController>()
                                  .getDataFromArgs();
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                )
              : const SizedBox();
        },
      ),
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.isLoading.value == true
              ? Shimmers.serviceBranchShimmer()
              : logic.getSalonDetailCategory?.salon?.serviceIds?.isEmpty == true
                  ? Center(
                      child: Column(
                        children: [
                          Image.asset(
                            AppAsset.icNoService,
                            height: 170,
                            width: 170,
                          ).paddingOnly(top: 50),
                          Text(
                            "txtNotAvailableServices".tr,
                            style: TextStyle(
                              color: AppColors.primaryTextColor,
                              fontFamily: AppFontFamily.sfProDisplay,
                              fontSize: 18,
                            ),
                          )
                        ],
                      ),
                    )
                  : GetBuilder<BranchDetailController>(
                      id: Constant.idServiceList,
                      builder: (logic) {
                        final total = logic.getSalonDetailCategory?.salon
                                ?.serviceIds?.length ??
                            0;
                        final visibleIndices = <int>[
                          for (var i = 0; i < total; i++)
                            if (logic.serviceMatchesCategory(i)) i,
                        ];

                        return SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (logic.serviceCategoryFilters.length > 1)
                                SizedBox(
                                  height: 44,
                                  child: ListView.separated(
                                    scrollDirection: Axis.horizontal,
                                    padding: const EdgeInsets.fromLTRB(
                                        16, 4, 16, 8),
                                    itemCount:
                                        logic.serviceCategoryFilters.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(width: 8),
                                    itemBuilder: (context, chipIndex) {
                                      final entry = logic
                                          .serviceCategoryFilters[chipIndex];
                                      final selected =
                                          logic.activeServiceCategory ==
                                              entry.key;
                                      return GestureDetector(
                                        onTap: () => logic
                                            .onServiceCategoryTap(entry.key),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 14,
                                            vertical: 8,
                                          ),
                                          decoration: BoxDecoration(
                                            color: selected
                                                ? AppColors.brandBlack
                                                : AppColors.whiteColor,
                                            borderRadius:
                                                BorderRadius.circular(999),
                                            border: Border.all(
                                              color: selected
                                                  ? AppColors.brandBlack
                                                  : AppColors.greyColor
                                                      .withOpacity(0.35),
                                            ),
                                          ),
                                          child: Text(
                                            entry.value,
                                            style: TextStyle(
                                              fontFamily:
                                                  AppFontFamily.heeBo600,
                                              fontSize: 13,
                                              color: selected
                                                  ? AppColors.whiteColor
                                                  : AppColors.brandBlack,
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              if (visibleIndices.isEmpty)
                                Padding(
                                  padding: const EdgeInsets.all(24),
                                  child: Text(
                                    "txtNotAvailableServices".tr,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: AppColors.termsDialog,
                                      fontFamily: AppFontFamily.heeBo500,
                                      fontSize: 14,
                                    ),
                                  ),
                                )
                              else
                                ListView.separated(
                                  itemCount: visibleIndices.length,
                                  shrinkWrap: true,
                                  padding: const EdgeInsets.fromLTRB(
                                      16, 0, 16, 8),
                                  physics: const NeverScrollableScrollPhysics(),
                                  separatorBuilder: (_, __) => Divider(
                                    height: 1,
                                    color:
                                        AppColors.greyColor.withOpacity(0.15),
                                  ),
                                  itemBuilder: (context, listIndex) {
                                    final index = visibleIndices[listIndex];
                                    final service = logic
                                        .getSalonDetailCategory
                                        ?.salon
                                        ?.serviceIds?[index];
                                    final meta = service?.serviceIdId;
                                    final selected =
                                        logic.isBranchSelected[index];
                                    final price = service?.price ?? 0.0;
                                    final taxPct =
                                        logic.getSalonDetailCategory?.tax ??
                                            0.0;
                                    final taxAmount =
                                        (price * taxPct) / 100;

                                    return InkWell(
                                      onTap: () => logic.onCheckBoxClick(
                                        !selected,
                                        index,
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 12,
                                        ),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          children: [
                                            Container(
                                              width: 56,
                                              height: 56,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: selected
                                                      ? AppColors.brandBlack
                                                      : AppColors.greyColor
                                                          .withOpacity(0.25),
                                                  width: selected ? 2 : 1,
                                                ),
                                              ),
                                              clipBehavior: Clip.hardEdge,
                                              child: CachedNetworkImage(
                                                imageUrl: meta?.image ?? '',
                                                fit: BoxFit.cover,
                                                placeholder: (_, __) =>
                                                    Image.asset(AppAsset
                                                        .icServicePlaceholder),
                                                errorWidget: (_, __, ___) =>
                                                    Image.asset(AppAsset
                                                        .icServicePlaceholder),
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    meta?.name ?? '',
                                                    maxLines: 2,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily
                                                          .heeBo700,
                                                      fontSize: 15,
                                                      color:
                                                          AppColors.brandBlack,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    '${meta?.duration ?? 0} ${"txtMin".tr} · $currency ${price.toStringAsFixed(2)}',
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily
                                                          .heeBo500,
                                                      fontSize: 13,
                                                      color: AppColors
                                                          .termsDialog,
                                                    ),
                                                  ),
                                                  if (taxAmount > 0)
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets.only(
                                                              top: 2),
                                                      child: Text(
                                                        '$currency${taxAmount.toStringAsFixed(2)} ${"txtTax".tr}',
                                                        style: TextStyle(
                                                          fontFamily:
                                                              AppFontFamily
                                                                  .heeBo500,
                                                          fontSize: 12,
                                                          color: AppColors
                                                              .currencyGrey,
                                                        ),
                                                      ),
                                                    ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Icon(
                                              selected
                                                  ? Icons.check_circle
                                                  : Icons.add_circle_outline,
                                              color: selected
                                                  ? AppColors.brandBlack
                                                  : AppColors.greyColor,
                                              size: 28,
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                    16, 4, 16, 12),
                                child: Text(
                                  "txtPriceIndicativeHint".tr,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 11.5,
                                    color: AppColors.currencyGrey,
                                    height: 1.35,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
        },
      ),
    );
  }
}

/// =================== Product View
class BranchDetailTabBarProductView extends StatelessWidget {
  const BranchDetailTabBarProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getSalonDetailCategory?.product?.isEmpty == true
              ? Center(
                  child: Column(
                    children: [
                      Image.asset(
                        AppAsset.icNoService,
                        height: 170,
                        width: 170,
                      ).paddingOnly(top: 50),
                      Text(
                        "desNoProductFound".tr,
                        style: TextStyle(
                          color: AppColors.primaryTextColor,
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 18,
                        ),
                      )
                    ],
                  ),
                )
              : SizedBox(
                  height: 200,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    itemCount:
                        logic.getSalonDetailCategory?.product?.length ?? 0,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (BuildContext context, int index) {
                      final product =
                          logic.getSalonDetailCategory?.product?[index];
                      return InkWell(
                        onTap: () async {
                          if (Constant.storage.read<bool>('isLogIn') ?? false) {
                            Get.toNamed(
                              AppRoutes.productDetail,
                              arguments: [product?.id],
                            );
                          } else {
                            Get.toNamed(AppRoutes.signIn,
                                arguments: [logic.checkItem.isNotEmpty]);
                            await Get.find<SignInController>().getDataFromArgs();
                          }
                        },
                        overlayColor: WidgetStateColor.transparent,
                        child: SizedBox(
                          width: 120,
                          child: Column(
                            children: [
                              Container(
                                width: 72,
                                height: 72,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.greyColor
                                        .withOpacity(0.25),
                                  ),
                                ),
                                clipBehavior: Clip.hardEdge,
                                child: CachedNetworkImage(
                                  imageUrl: product?.mainImage ?? '',
                                  fit: BoxFit.cover,
                                  placeholder: (_, __) => Image.asset(
                                    AppAsset.icImagePlaceholder,
                                  ).paddingAll(16),
                                  errorWidget: (_, __, ___) => Image.asset(
                                    AppAsset.icImagePlaceholder,
                                  ).paddingAll(16),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                Constant.capitalizeFirstLetter(
                                    product?.productName ?? ''),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo600,
                                  fontSize: 13,
                                  color: AppColors.brandBlack,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$currency ${product?.price ?? ''}',
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 13,
                                  color: AppColors.brandBlack,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
        },
      ),
    );
  }
}

/// =================== Staff View
class BranchDetailTabBarStaffView extends StatelessWidget {
  const BranchDetailTabBarStaffView({super.key});

  @override
  Widget build(BuildContext context) {
    HomeScreenController homeScreenController =
        Get.find<HomeScreenController>();

    return Scaffold(
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.isLoading.value == true
              ? Shimmers.selectExpertShimmer()
              : logic.getSalonDetailCategory?.experts?.isEmpty == true
                  ? Center(
                      child: Column(
                        children: [
                          Image.asset(AppAsset.icNoExpert,
                                  height: 150, width: 150)
                              .paddingOnly(bottom: 7),
                          Text(
                            "txtNoFoundExpert".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplay,
                              fontSize: 18,
                              color: AppColors.primaryTextColor,
                            ),
                          )
                        ],
                      ),
                    ).paddingOnly(top: Get.height * 0.1)
                  : SizedBox(
                      height: 130,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                        itemCount:
                            logic.getSalonDetailCategory?.experts?.length ?? 0,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (BuildContext context, int index) {
                          final expert =
                              logic.getSalonDetailCategory?.experts?[index];
                          final rating = expert?.review ?? 0;

                          return InkWell(
                            overlayColor:
                                WidgetStatePropertyAll(AppColors.transparent),
                            onTap: () {
                              homeScreenController.onGetExpertApiCall(
                                  expertId: expert?.id ?? '');
                              Get.toNamed(
                                AppRoutes.expertDetail,
                                arguments: [expert?.id, index, expert?.review],
                              );
                            },
                            child: SizedBox(
                              width: 76,
                              child: Column(
                                children: [
                                  Container(
                                    width: 56,
                                    height: 56,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: AppColors.greyColor
                                            .withOpacity(0.25),
                                      ),
                                    ),
                                    clipBehavior: Clip.hardEdge,
                                    child: CachedNetworkImage(
                                      imageUrl: expert?.image ?? '',
                                      fit: BoxFit.cover,
                                      placeholder: (_, __) => Image.asset(
                                          AppAsset.icPlaceHolder),
                                      errorWidget: (_, __, ___) => Image.asset(
                                          AppAsset.icPlaceHolder),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    expert?.fname ?? '',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo600,
                                      fontSize: 12,
                                      color: AppColors.brandBlack,
                                    ),
                                  ),
                                  if (rating > 0)
                                    Text(
                                      '★ ${rating.toStringAsFixed(1)}',
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.heeBo500,
                                        fontSize: 11,
                                        color: AppColors.brandBlack,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    );
        },
      ),
    );
  }
}

/// =================== Review View
class BranchDetailTabBarReviewView extends StatelessWidget {
  const BranchDetailTabBarReviewView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getSalonDetailCategory?.reviews?.isEmpty == true
              ? Center(
                  child: Column(
                    children: [
                      Image.asset(AppAsset.icNoReview, height: 152, width: 152),
                      Text(
                        "txtNoReviewSalon".tr,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 18,
                          color: AppColors.primaryTextColor,
                        ),
                      )
                    ],
                  ),
                ).paddingOnly(top: 50)
              : ListView.separated(
                  itemCount: logic.getSalonDetailCategory?.reviews?.length ?? 0,
                  shrinkWrap: true,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  itemBuilder: (context, index) {
                    String dateTimeString = logic
                            .getSalonDetailCategory?.reviews?[index].createdAt
                            .toString() ??
                        "";
                    DateTime dateTime = DateTime.parse(dateTimeString);
                    logic.date = DateFormat('yyyy-MM-dd').format(dateTime);

                    log("The date is :: ${logic.date}");

                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 15),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.whiteColor,
                        boxShadow: Constant.boxShadow,
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "${logic.getSalonDetailCategory?.reviews?[index].userId?.fname} ${logic.getSalonDetailCategory?.reviews?[index].userId?.lname}",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 18,
                                  color: AppColors.appText,
                                ),
                              ),
                              Container(
                                width: Get.width * 0.14,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  color: AppColors.oceanBlue.withOpacity(0.30),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Image.asset(
                                      (logic
                                                      .getSalonDetailCategory
                                                      ?.reviews?[index]
                                                      .rating ??
                                                  0) >=
                                              4
                                          ? AppAsset.icGreenStar
                                          : AppAsset.icRedStar,
                                      height: 15,
                                      width: 15,
                                      color: (logic
                                                      .getSalonDetailCategory
                                                      ?.reviews?[index]
                                                      .rating ??
                                                  0) >=
                                              4
                                          ? AppColors.blackColor
                                          : null,
                                      colorBlendMode: (logic
                                                      .getSalonDetailCategory
                                                      ?.reviews?[index]
                                                      .rating ??
                                                  0) >=
                                              4
                                          ? BlendMode.srcIn
                                          : null,
                                    ),
                                    SizedBox(width: Get.width * 0.02),
                                    Text(
                                      "${logic.getSalonDetailCategory?.reviews?[index].rating}",
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontFamily:
                                            AppFontFamily.sfProDisplayBold,
                                        fontSize: 15,
                                        color: AppColors.blackColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                logic.getSalonDetailCategory?.reviews?[index]
                                        .review ??
                                    "",
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 14,
                                  color: AppColors.termsDialog,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Text(
                                  logic.date ?? "",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.heeBo600,
                                    fontSize: 13,
                                    color: AppColors.termsDialog,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                  separatorBuilder: (context, index) {
                    return SizedBox(height: Get.height * 0.02);
                  },
                );
        },
      ),
    );
  }
}

/// =================== Gallery View
class BranchDetailTabBarGalleryView extends StatelessWidget {
  const BranchDetailTabBarGalleryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return GridView.builder(
            scrollDirection: Axis.vertical,
            physics: const ScrollPhysics(),
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            itemCount: logic.getSalonDetailCategory?.salon?.image?.length ?? 0,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 0.75,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: 120,
            ),
            itemBuilder: (context, index) {
              return Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  color: AppColors.grey.withOpacity(0.5),
                ),
                clipBehavior: Clip.hardEdge,
                child: CachedNetworkImage(
                  imageUrl:
                      logic.getSalonDetailCategory?.salon?.image?[index] ?? "",
                  fit: BoxFit.cover,
                  placeholder: (context, url) {
                    return Image.asset(AppAsset.icImagePlaceholder)
                        .paddingAll(25);
                  },
                  errorWidget: (context, url, error) {
                    return Image.asset(AppAsset.icImagePlaceholder)
                        .paddingAll(25);
                  },
                ),
              );
            },
          ).paddingAll(12);
        },
      ),
    );
  }
}
