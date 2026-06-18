import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/hair_profile_service.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class HomeScreenTopView extends StatelessWidget {
  const HomeScreenTopView({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return Container(
      height: Get.height * 0.09 + statusBarHeight,
      width: double.infinity,
      padding: EdgeInsets.only(
        top: statusBarHeight,
        left: 16,
        right: 16,
      ),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Skedisy",
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    fontSize: 20,
                    color: AppColors.blackColor,
                  ),
                ),
                Text(
                  Constant.storage.read<String>("fName") ?? "txtGuest".tr,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                    fontSize: 14,
                    color: AppColors.blackColor,
                  ),
                ),
              ],
            ),
          ),
          const _HomeLocationChip(),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () {
              Get.toNamed(AppRoutes.wishlist);
            },
            child: Image.asset(
              AppAsset.icLikeOutline,
              height: 40,
            ).paddingOnly(right: 13),
          ),
          GestureDetector(
            onTap: () {
              Get.toNamed(AppRoutes.cart);
            },
            child: Image.asset(
              AppAsset.icCart,
              height: 40,
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeLocationChip extends StatelessWidget {
  const _HomeLocationChip();

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idIntentSearch,
      builder: (logic) {
        final label = (city != null && city!.trim().isNotEmpty)
            ? city!.trim()
            : (logic.intentLocationController.text.trim().isNotEmpty
                ? logic.intentLocationController.text.trim()
                : 'txtIntentSearchLocationHint'.tr);

        return InkWell(
          onTap: () => _showLocationEditor(context, logic),
          borderRadius: BorderRadius.circular(999),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 118),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: AppColors.brandTerracotta.withOpacity(0.35),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.location_on_outlined,
                    size: 16, color: AppColors.iconAccent),
                const SizedBox(width: 4),
                Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'txtYourLocation'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: AppColors.termsDialog,
                        ),
                      ),
                      Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 12,
                          color: AppColors.blackColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showLocationEditor(BuildContext context, HomeScreenController logic) {
    final controller = TextEditingController(
      text: logic.intentLocationController.text.isNotEmpty
          ? logic.intentLocationController.text
          : (city ?? ''),
    );
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.whiteColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            16 + MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'txtYourLocation'.tr,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'txtIntentSearchLocationHint'.tr,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => Navigator.pop(ctx),
              ),
              const SizedBox(height: 12),
              AppButton(
                height: 46,
                width: double.infinity,
                buttonText: 'txtContinue'.tr,
                buttonColor: AppColors.primaryAppColor,
                color: AppColors.whiteColor,
                onTap: () => Navigator.pop(ctx),
              ),
            ],
          ),
        );
      },
    ).then((_) {
      final value = controller.text.trim();
      if (value.isEmpty) return;
      logic.setPublicSearchLocation(value);
    });
  }
}

class HomeScreenCategoryView extends StatelessWidget {
  const HomeScreenCategoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "txtCategory".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.category,
              arguments: ["txtCategory".tr],
            );
          },
        ),
        SizedBox(height: Get.height * 0.015),
        GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          init: HomeScreenController(),
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.homeCategoryShimmer()
                : AnimationLimiter(
                    child: GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount: (logic.getAllCategory?.data?.length ?? 0) >= 8
                          ? 8
                          : logic.getAllCategory?.data?.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 5,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 6,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 650),
                          columnCount:
                              (logic.getAllCategory?.data?.length ?? 0) >= 8
                                  ? 8
                                  : logic.getAllCategory?.data?.length ?? 0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: GestureDetector(
                                onTap: () async {
                                  Get.toNamed(
                                    AppRoutes.categoryDetail,
                                    arguments: [
                                      logic.getAllCategory?.data?[index].id,
                                      logic.getAllCategory?.data?[index].name
                                    ],
                                  );
                                },
                                child: OverflowBox(
                                  maxWidth: double.infinity,
                                  maxHeight: double.infinity,
                                  child: Stack(
                                    children: [
                                      Container(
                                        height: 80,
                                        width: 65,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(14),
                                          color:
                                              AppColors.grey.withOpacity(0.1),
                                        ),
                                        clipBehavior: Clip.hardEdge,
                                        child: CachedNetworkImage(
                                          imageUrl:
                                              "${logic.getAllCategory?.data?[index].image}",
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset
                                                    .icCategoryPlaceholder)
                                                .paddingAll(12);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset
                                                    .icCategoryPlaceholder)
                                                .paddingAll(12);
                                          },
                                        ),
                                      ),
                                      Positioned(
                                        top: 58,
                                        child: Container(
                                          height: 22,
                                          width: 65,
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                const BorderRadius.only(
                                              bottomLeft: Radius.circular(14),
                                              bottomRight: Radius.circular(14),
                                            ),
                                            color: AppColors.whiteColor
                                                .withOpacity(0.88),
                                            border: Border.all(
                                              color: AppColors.grey
                                                  .withOpacity(0.08),
                                              width: 0.8,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              logic.getAllCategory?.data![index]
                                                      .name
                                                      .toString() ??
                                                  "",
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily:
                                                    AppFontFamily.sfProDisplay,
                                                fontSize: 11,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(
                                                left: 5, right: 5, bottom: 3),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
          },
        ),
      ],
    );
  }
}

class HomeScreenIntentHub extends StatelessWidget {
  const HomeScreenIntentHub({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'txtIntentHubTitle'.tr,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayBold,
            fontSize: 22,
            height: 1.15,
            color: AppColors.blackColor,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'txtIntentHubEssence'.tr,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayMedium,
            fontSize: 13,
            height: 1.35,
            color: AppColors.primaryAppColor,
          ),
        ),
        const SizedBox(height: 10),
        const _HomeSearchMapRow(),
        const SizedBox(height: 10),
        const _IntentSearchBar(),
        const SizedBox(height: 10),
        const Divider(height: 1, thickness: 1, color: Color(0xFFE8E8E8)),
        const SizedBox(height: 10),
        const _IntentShareLookCard(),
      ],
    );
  }
}

class _HomeSearchMapRow extends StatelessWidget {
  const _HomeSearchMapRow();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: GetBuilder<HomeScreenController>(
        id: Constant.idHomeSearchResults,
        builder: (logic) {
          return TextButton.icon(
            onPressed: logic.openPublicSearchMap,
            icon: Icon(Icons.map_outlined, size: 18, color: AppColors.iconAccent),
            label: Text(
              'txtViewMap'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayMedium,
                fontSize: 13,
                color: AppColors.iconAccent,
              ),
            ),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          );
        },
      ),
    );
  }
}

class _IntentShareLookCard extends StatelessWidget {
  const _IntentShareLookCard();

  @override
  Widget build(BuildContext context) {
    return _IntentDoorCard(
      icon: Icons.ios_share_rounded,
      title: 'txtIntentCaptureTitle'.tr,
      body: '',
      accent: AppColors.primaryAppColor,
      filled: true,
      compact: true,
      onTap: () => Get.toNamed(
        AppRoutes.aiConcierge,
        arguments: <String, dynamic>{'captureMode': true},
      ),
    );
  }
}

class _IntentSearchBar extends StatelessWidget {
  const _IntentSearchBar();

  static const Color _searchBorder = Color(0xFFDDDDDD);

  List<T> _filterByQuery<T>(List<T>? items, String? Function(T) label, String query) {
    final q = query.trim().toLowerCase();
    if (items == null) return [];
    if (q.isEmpty) return items;
    return items
        .where((item) => (label(item) ?? '').toLowerCase().contains(q))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idIntentSearch,
      builder: (logic) {
        final categories = _filterByQuery(
          logic.searchSuggestions?.categories,
          (c) => c.name ?? '',
          logic.intentQueryController.text,
        ).take(5).toList();
        final services = _filterByQuery(
          logic.searchSuggestions?.services,
          (s) => s.name ?? '',
          logic.intentQueryController.text,
        ).take(10).toList();
        final showPanel = logic.showIntentSuggestions &&
            (logic.intentQueryFocusNode.hasFocus ||
                logic.loadingIntentSuggestions);

        return DottedBorder(
          borderType: BorderType.RRect,
          radius: const Radius.circular(14),
          color: _searchBorder,
          strokeWidth: 1,
          dashPattern: const [6, 4],
          padding: EdgeInsets.zero,
          child: Material(
            color: AppColors.whiteColor,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: AppColors.iconAccent, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: logic.intentQueryController,
                            focusNode: logic.intentQueryFocusNode,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              fontSize: 14,
                              color: AppColors.blackColor,
                            ),
                            decoration: InputDecoration(
                              isDense: true,
                              border: InputBorder.none,
                              hintText: 'txtIntentSearchQueryHint'.tr,
                              hintStyle: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayRegular,
                                fontSize: 14,
                                color: AppColors.iconAccent,
                              ),
                              contentPadding: EdgeInsets.zero,
                            ),
                            textInputAction: TextInputAction.search,
                            onSubmitted: (_) => logic.submitIntentSearch(),
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: logic.submitIntentSearch,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.blackColor,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              Icons.arrow_forward,
                              color: AppColors.whiteColor,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (showPanel)
                    Container(
                      decoration: const BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Color(0xFFF0F0F0)),
                        ),
                      ),
                      padding: const EdgeInsets.fromLTRB(8, 8, 8, 10),
                      child: logic.loadingIntentSuggestions
                          ? Padding(
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                'txtIntentSuggestLoading'.tr,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplayRegular,
                                  fontSize: 13,
                                  color: AppColors.iconAccent,
                                ),
                              ),
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (categories.isNotEmpty) ...[
                                  Text(
                                    'txtIntentSuggestCategoriesTitle'.tr,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      fontSize: 11,
                                      letterSpacing: 0.4,
                                      color: AppColors.iconAccent,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  ...categories.map(
                                    (cat) => ListTile(
                                      dense: true,
                                      visualDensity: VisualDensity.compact,
                                      contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 4,
                                      ),
                                      leading: Icon(
                                        Icons.layers_outlined,
                                        size: 18,
                                        color: AppColors.primaryAppColor,
                                      ),
                                      title: Text(
                                        cat.name ?? '',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontFamily:
                                              AppFontFamily.sfProDisplayMedium,
                                          fontSize: 14,
                                        ),
                                      ),
                                      onTap: () => logic.onIntentCategorySuggestionTap(
                                        cat.id,
                                        cat.name,
                                      ),
                                    ),
                                  ),
                                ],
                                if (categories.isNotEmpty && services.isNotEmpty)
                                  const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 6),
                                    child: Divider(height: 1, color: Color(0xFFF0F0F0)),
                                  ),
                                if (services.isNotEmpty) ...[
                                  Text(
                                    'txtIntentSuggestServicesTitle'.tr,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      fontSize: 11,
                                      letterSpacing: 0.4,
                                      color: AppColors.iconAccent,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  ...services.map(
                                    (svc) => ListTile(
                                      dense: true,
                                      visualDensity: VisualDensity.compact,
                                      contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 4,
                                      ),
                                      leading: Icon(
                                        Icons.content_cut_outlined,
                                        size: 18,
                                        color: AppColors.primaryAppColor,
                                      ),
                                      title: Text(
                                        svc.name ?? '',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontFamily:
                                              AppFontFamily.sfProDisplayMedium,
                                          fontSize: 14,
                                        ),
                                      ),
                                      onTap: () => logic.onIntentServiceSuggestionTap(
                                        svc.name ?? '',
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _IntentDoorCard extends StatelessWidget {
  const _IntentDoorCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.accent,
    required this.onTap,
    this.filled = false,
    this.compact = false,
  });

  final IconData icon;
  final String title;
  final String body;
  final Color accent;
  final VoidCallback onTap;
  final bool filled;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final titleColor =
        filled ? AppColors.whiteColor : AppColors.blackColor;
    final bodyColor = filled
        ? AppColors.whiteColor.withOpacity(0.9)
        : AppColors.grey;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: compact ? double.infinity : null,
        padding: EdgeInsets.all(compact ? 12 : 16),
        decoration: BoxDecoration(
          color: filled ? accent : AppColors.whiteColor,
          borderRadius: BorderRadius.circular(14),
          border: filled
              ? null
              : Border.all(
                  color: accent.withOpacity(0.25),
                ),
          boxShadow: filled
              ? [
                  BoxShadow(
                    color: accent.withOpacity(0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : Constant.boxShadow,
        ),
        child: Row(
          children: [
            Container(
              width: compact ? 40 : 44,
              height: compact ? 40 : 44,
              decoration: BoxDecoration(
                color: filled
                    ? AppColors.whiteColor.withOpacity(0.2)
                    : accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: compact ? 18 : 22,
                color: filled ? AppColors.whiteColor : accent,
              ),
            ),
            SizedBox(width: compact ? 10 : 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment:
                    compact ? MainAxisAlignment.center : MainAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: compact ? 14 : 15,
                      color: titleColor,
                    ),
                  ),
                  if (body.trim().isNotEmpty) ...[
                    SizedBox(height: compact ? 2 : 4),
                    Text(
                      body,
                      maxLines: compact ? 3 : null,
                      overflow: compact ? TextOverflow.ellipsis : null,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayRegular,
                        fontSize: compact ? 11.5 : 12.5,
                        height: 1.35,
                        color: bodyColor,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: filled
                  ? AppColors.whiteColor
                  : AppColors.grey.withOpacity(0.8),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeScreenHairProfileStrip extends StatelessWidget {
  const HomeScreenHairProfileStrip({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (_) {
        final profile = HairProfileService.instance.load();

    if (!profile.isComplete) {
      return GestureDetector(
        onTap: () => Get.toNamed(AppRoutes.hairProfile),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.primaryAppColor.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.primaryAppColor.withOpacity(0.2),
            ),
          ),
          child: Row(
            children: [
              Icon(
                Icons.spa_outlined,
                color: AppColors.primaryAppColor,
                size: 22,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'txtHairProfileIncomplete'.tr,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                    fontSize: 13,
                    color: AppColors.blackColor,
                    height: 1.35,
                  ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: AppColors.primaryAppColor,
              ),
            ],
          ),
        ),
      );
    }

    final summary = [
      if (profile.hairType != null) profile.hairType!.tr,
      if (profile.styleInterest != null) profile.styleInterest!.tr,
    ].join(' · ');

    return GestureDetector(
      onTap: () => Get.toNamed(AppRoutes.hairProfile),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.whiteColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.lineColor),
        ),
        child: Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.primaryAppColor, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                '${'txtHairProfileSummary'.tr}: $summary',
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 13,
                  color: AppColors.blackColor,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              'txtHairProfileEdit'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayBold,
                fontSize: 12,
                color: AppColors.primaryAppColor,
              ),
            ),
          ],
        ),
      ),
    );
      },
    );
  }
}

class HomeScreenMapViewLink extends StatelessWidget {
  const HomeScreenMapViewLink({super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: TextButton.icon(
        onPressed: () {
          Get.toNamed(AppRoutes.branch, arguments: {'openMap': true});
        },
        icon: Icon(Icons.map_outlined, size: 18, color: AppColors.iconAccent),
        label: Text(
          'txtViewMap'.tr,
          style: TextStyle(
            fontFamily: AppFontFamily.heeBo500,
            fontSize: 13,
            color: AppColors.iconAccent,
          ),
        ),
      ),
    );
  }
}

class HomeScreenNewProductView extends StatelessWidget {
  const HomeScreenNewProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.productBg,
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ViewAll(
            title: "txtNewProducts".tr,
            subtitle: "txtViewAll".tr,
            onTap: () {
              Get.toNamed(
                AppRoutes.newProduct,
              );
            },
          ).paddingOnly(bottom: 10),
          SizedBox(
            height: 160,
            child: GetBuilder<HomeScreenController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return logic.isLoading.value
                    ? Shimmers.newProductShimmer()
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        itemCount: logic.getNewProductModel?.data?.length ?? 0,
                        itemBuilder: (BuildContext context, int index) {
                          return AnimationConfiguration.staggeredGrid(
                            position: index,
                            duration: const Duration(milliseconds: 700),
                            columnCount:
                                (logic.getNewProductModel?.data?.length ?? 0) >=
                                        3
                                    ? 3
                                    : logic.getNewProductModel?.data?.length ??
                                        0,
                            child: FadeInAnimation(
                              child: ScaleAnimation(
                                child: InkWell(
                                  onTap: () {
                                    if (Constant.storage
                                            .read<bool>('isLogIn') ??
                                        false) {
                                      Get.toNamed(
                                        AppRoutes.productDetail,
                                        arguments: [
                                          logic.getNewProductModel?.data?[index]
                                              .id,
                                        ],
                                      );
                                    } else {
                                      Get.find<BottomBarController>()
                                          .onClick(1);
                                    }
                                  },
                                  overlayColor: WidgetStateColor.transparent,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(21),
                                      color:
                                          RandomColorGenerator.getRandomColor(),
                                      boxShadow: Constant.boxShadow,
                                    ),
                                    width: 110,
                                    child: Stack(
                                      children: [
                                        Column(
                                          children: [
                                            const Spacer(),
                                            const Spacer(),
                                            const Spacer(),
                                            const Spacer(),
                                            CachedNetworkImage(
                                              imageUrl: logic
                                                      .getNewProductModel
                                                      ?.data?[index]
                                                      .mainImage ??
                                                  "",
                                              height: 80,
                                              fit: BoxFit.cover,
                                              placeholder: (context, url) {
                                                return Image.asset(AppAsset
                                                        .icImagePlaceholder)
                                                    .paddingAll(5);
                                              },
                                              errorWidget:
                                                  (context, url, error) {
                                                return Image.asset(AppAsset
                                                        .icImagePlaceholder)
                                                    .paddingAll(5);
                                              },
                                            ),
                                            const Spacer(),
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: Text(
                                                Constant.capitalizeFirstLetter(
                                                    logic
                                                            .getNewProductModel
                                                            ?.data?[index]
                                                            .productName ??
                                                        ""),
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontFamily:
                                                      AppFontFamily.heeBo700,
                                                  fontSize: 14,
                                                  color: AppColors.appText,
                                                ),
                                              ).paddingOnly(left: 7, right: 5),
                                            ),
                                            const SizedBox(height: 2),
                                            Row(
                                              children: [
                                                Text(
                                                  "$currency ${logic.getNewProductModel?.data?[index].price ?? ""}",
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo800,
                                                    fontSize: 14,
                                                    color: AppColors
                                                        .primaryAppColor,
                                                  ),
                                                ).paddingOnly(right: 7),
                                                logic
                                                            .getNewProductModel
                                                            ?.data?[index]
                                                            .mrp ==
                                                        null
                                                    ? Container()
                                                    : Text(
                                                        "$currency ${logic.getNewProductModel?.data?[index].mrp ?? ""}",
                                                        style: TextStyle(
                                                          fontFamily:
                                                              AppFontFamily
                                                                  .heeBo700,
                                                          fontSize: 14,
                                                          decoration:
                                                              TextDecoration
                                                                  .lineThrough,
                                                          decorationColor:
                                                              AppColors
                                                                  .currencyRed,
                                                          color: AppColors
                                                              .currencyRed,
                                                          decorationThickness:
                                                              1.5,
                                                        ),
                                                      ),
                                              ],
                                            ).paddingOnly(left: 10, right: 7),
                                            const Spacer(),
                                            const Spacer(),
                                          ],
                                        ),
                                        Positioned(
                                          right: 8,
                                          top: 8,
                                          child: GestureDetector(
                                            onTap: () {
                                              if (Constant.storage
                                                      .read<bool>('isLogIn') ??
                                                  false) {
                                                logic.onNewProductSaved(
                                                  userId: Constant.storage
                                                          .read<String>(
                                                              'userId') ??
                                                      "",
                                                  categoryId: logic
                                                          .getNewProductModel
                                                          ?.data?[index]
                                                          .category ??
                                                      "",
                                                  productId: logic
                                                          .getNewProductModel
                                                          ?.data?[index]
                                                          .id ??
                                                      "",
                                                );
                                              } else {
                                                Get.find<BottomBarController>()
                                                    .onClick(1);
                                              }
                                            },
                                            child: logic.isNewProductSaved[
                                                        index] ==
                                                    true
                                                ? Image.asset(
                                                    AppAsset.icLikeFilled,
                                                    height: 30)
                                                : Image.asset(
                                                    AppAsset.icLikeOutline,
                                                    height: 30),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ).paddingOnly(right: 10),
                                ),
                              ),
                            ),
                          );
                        },
                      );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class HomeScreenTrendingProduct extends StatelessWidget {
  const HomeScreenTrendingProduct({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtTrendingProducts".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.trendingProduct,
            );
          },
        ).paddingOnly(bottom: 10),
        SizedBox(
          height: 160,
          child: GetBuilder<HomeScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.isLoading.value
                  ? Shimmers.trendingProductShimmer()
                  : ListView.builder(
                      scrollDirection: Axis.horizontal,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount:
                          logic.getTrendingProductModel?.data?.length ?? 0,
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 650),
                          columnCount: (logic.getTrendingProductModel?.data
                                          ?.length ??
                                      0) >=
                                  3
                              ? 3
                              : logic.getTrendingProductModel?.data?.length ??
                                  0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: InkWell(
                                onTap: () {
                                  if (Constant.storage.read<bool>('isLogIn') ??
                                      false) {
                                    Get.toNamed(
                                      AppRoutes.productDetail,
                                      arguments: [
                                        logic.getTrendingProductModel
                                            ?.data?[index].id,
                                      ],
                                    );
                                  } else {
                                    Get.find<BottomBarController>().onClick(1);
                                  }
                                },
                                overlayColor: WidgetStateColor.transparent,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(21),
                                    color:
                                        RandomColorGenerator.getRandomColor(),
                                    boxShadow: Constant.boxShadow,
                                    border: Border.all(
                                      color: AppColors.grey.withOpacity(0.1),
                                      width: 1,
                                    ),
                                  ),
                                  width: 110,
                                  child: Stack(
                                    children: [
                                      Column(
                                        children: [
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          CachedNetworkImage(
                                            imageUrl: logic
                                                    .getTrendingProductModel
                                                    ?.data?[index]
                                                    .mainImage ??
                                                "",
                                            height: 85,
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset
                                                      .icImagePlaceholder)
                                                  .paddingAll(5);
                                            },
                                            errorWidget: (context, url, error) {
                                              return Image.asset(AppAsset
                                                      .icImagePlaceholder)
                                                  .paddingAll(5);
                                            },
                                          ),
                                          const Spacer(),
                                          const Spacer(),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(
                                              Constant.capitalizeFirstLetter(logic
                                                      .getTrendingProductModel
                                                      ?.data?[index]
                                                      .productName ??
                                                  ""),
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily:
                                                    AppFontFamily.heeBo700,
                                                fontSize: 14,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(left: 7, right: 5),
                                          ),
                                          Row(
                                            children: [
                                              Image.asset(AppAsset.icRedStar,
                                                  height: 12,
                                                  color: AppColors.yellow3),
                                              Text(
                                                "${logic.getTrendingProductModel?.data?[index].rating?.toStringAsFixed(1) ?? ""} | ${logic.getTrendingProductModel?.data?[index].sold ?? ""} Sold",
                                                style: TextStyle(
                                                  fontFamily:
                                                      AppFontFamily.heeBo700,
                                                  fontSize: 12,
                                                  color: AppColors.ratingBlack,
                                                ),
                                              ).paddingOnly(left: 4),
                                            ],
                                          ).paddingOnly(left: 7, right: 7),
                                          Row(
                                            children: [
                                              Text(
                                                "$currency ${logic.getTrendingProductModel?.data?[index].price ?? ""}",
                                                style: TextStyle(
                                                  fontFamily:
                                                      AppFontFamily.heeBo800,
                                                  fontSize: 14,
                                                  color:
                                                      AppColors.primaryAppColor,
                                                ),
                                              ).paddingOnly(right: 7),
                                              logic.getTrendingProductModel
                                                          ?.data?[index].mrp ==
                                                      null
                                                  ? Container()
                                                  : Text(
                                                      "$currency ${logic.getTrendingProductModel?.data?[index].mrp ?? ""}",
                                                      style: TextStyle(
                                                        fontFamily:
                                                            AppFontFamily
                                                                .heeBo700,
                                                        fontSize: 14,
                                                        decoration:
                                                            TextDecoration
                                                                .lineThrough,
                                                        decorationColor:
                                                            AppColors
                                                                .currencyRed,
                                                        color: AppColors
                                                            .currencyRed,
                                                        decorationThickness:
                                                            1.5,
                                                      ),
                                                    ),
                                            ],
                                          ).paddingOnly(left: 10, right: 7),
                                          const Spacer(),
                                          const Spacer(),
                                        ],
                                      ),
                                      logic.getTrendingProductModel
                                                  ?.data?[index].isBestSeller ==
                                              true
                                          ? Container(
                                              height: 22,
                                              width: Get.width * 0.17,
                                              alignment: Alignment.center,
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    const BorderRadius.only(
                                                  topLeft: Radius.circular(21),
                                                  bottomRight:
                                                      Radius.circular(21),
                                                  topRight: Radius.circular(21),
                                                ),
                                                color: AppColors.sellerBg,
                                              ),
                                              child: Text(
                                                "txtBestSeller".tr,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontFamily:
                                                      AppFontFamily.heeBo700,
                                                  fontSize: 10,
                                                  color: AppColors.sellerYellow,
                                                ),
                                              ),
                                            )
                                          : const SizedBox(),
                                      Positioned(
                                        right: 8,
                                        top: 8,
                                        child: GestureDetector(
                                          onTap: () {
                                            if (Constant.storage
                                                    .read<bool>('isLogIn') ??
                                                false) {
                                              logic.onTrendingProductSaved(
                                                userId: Constant.storage
                                                        .read<String>(
                                                            'userId') ??
                                                    "",
                                                categoryId: logic
                                                        .getTrendingProductModel
                                                        ?.data?[index]
                                                        .category ??
                                                    "",
                                                productId: logic
                                                        .getTrendingProductModel
                                                        ?.data?[index]
                                                        .id ??
                                                    "",
                                              );
                                            } else {
                                              Get.find<BottomBarController>()
                                                  .onClick(1);
                                            }
                                          },
                                          child: logic.isTrendingProductSaved[
                                                      index] ==
                                                  true
                                              ? Image.asset(
                                                  AppAsset.icLikeFilled,
                                                  height: 30)
                                              : Image.asset(
                                                  AppAsset.icLikeOutline,
                                                  height: 30),
                                        ),
                                      ),
                                    ],
                                  ),
                                ).paddingOnly(right: 10),
                              ),
                            ),
                          ),
                        );
                      },
                    );
            },
          ),
        ),
      ],
    ).paddingOnly(left: 15, right: 15, top: 15);
  }
}

class HomeScreenTopExpertView extends StatelessWidget {
  const HomeScreenTopExpertView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtTopExperts".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.category,
              arguments: ["txtTopExperts".tr],
            );
          },
        ).paddingOnly(top: 13),
        SizedBox(height: Get.height * 0.015),
        GetBuilder<HomeScreenController>(
          init: HomeScreenController(),
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.homeExpertShimmer()
                : logic.getAllExpertCategory?.data?.isEmpty ?? true
                    ? Center(
                        child: Column(
                          children: [
                            Image.asset(
                              AppAsset.icNoExpert,
                              height: 150,
                              width: 150,
                            ).paddingOnly(top: 30, bottom: 25),
                            Text(
                              "txtNotExpert".tr,
                              style: TextStyle(
                                color: AppColors.primaryTextColor,
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 18,
                              ),
                            )
                          ],
                        ),
                      )
                    : AnimationLimiter(
                        child: SizedBox(
                          height: 220,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            physics: const ScrollPhysics(),
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount:
                                (logic.getAllExpertCategory?.data?.length ??
                                            0) >
                                        6
                                    ? 6
                                    : logic.getAllExpertCategory?.data?.length,
                            itemBuilder: (BuildContext context, int index) {
                              logic.rating = logic.getAllExpertCategory
                                      ?.data?[index].review ??
                                  0.0;
                              logic.roundedRating = logic.rating?.round();
                              logic.filledStars =
                                  logic.roundedRating?.clamp(0, 5);

                              return AnimationConfiguration.staggeredGrid(
                                position: index,
                                duration: const Duration(milliseconds: 800),
                                columnCount:
                                    (logic.getAllExpertCategory?.data?.length ??
                                                0) >
                                            6
                                        ? 6
                                        : logic.getAllExpertCategory?.data
                                                ?.length ??
                                            0,
                                child: ScaleAnimation(
                                  child: FadeInAnimation(
                                    child: GestureDetector(
                                      onTap: () async {
                                        await logic.onGetExpertApiCall(
                                            expertId: logic.getAllExpertCategory
                                                    ?.data?[index].id ??
                                                "");

                                        Get.toNamed(
                                          AppRoutes.expertDetail,
                                          arguments: [
                                            logic.getAllExpertCategory
                                                ?.data?[index].id,
                                            index,
                                            logic.getAllExpertCategory
                                                ?.data?[index].review
                                          ],
                                        );
                                      },
                                      child: Container(
                                        width: Get.width * 0.35,
                                        margin: const EdgeInsets.only(
                                            right: 10, top: 5, bottom: 5),
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(21),
                                          color: AppColors.whiteColor,
                                          boxShadow: Constant.boxShadow,
                                          border: Border.all(
                                            color:
                                                AppColors.grey.withOpacity(0.1),
                                            width: 1,
                                          ),
                                        ),
                                        child: Column(
                                          children: [
                                            const Spacer(),
                                            const Spacer(),
                                            DottedBorder(
                                              color: AppColors.roundBorder,
                                              borderType: BorderType.RRect,
                                              radius: const Radius.circular(41),
                                              strokeWidth: 1.1,
                                              dashPattern: const [2.5, 2.5],
                                              child: Container(
                                                height: 70,
                                                width: 70,
                                                decoration: const BoxDecoration(
                                                    shape: BoxShape.circle),
                                                clipBehavior: Clip.hardEdge,
                                                child: CachedNetworkImage(
                                                  imageUrl: logic
                                                          .getAllExpertCategory
                                                          ?.data?[index]
                                                          .image ??
                                                      "",
                                                  fit: BoxFit.cover,
                                                  placeholder: (context, url) {
                                                    return Image.asset(
                                                        AppAsset.icPlaceHolder);
                                                  },
                                                  errorWidget:
                                                      (context, url, error) {
                                                    return Image.asset(
                                                        AppAsset.icPlaceHolder);
                                                  },
                                                ),
                                              ),
                                            ),
                                            const Spacer(),
                                            Text(
                                              "${logic.getAllExpertCategory?.data?[index].fname} ${logic.getAllExpertCategory?.data?[index].lname}",
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily:
                                                    AppFontFamily.heeBo600,
                                                fontSize: 14,
                                                color: AppColors.category,
                                              ),
                                            ),
                                            const Spacer(),
                                            // Add salon information if available
                                            if (logic.getAllExpertCategory
                                                    ?.data?[index].salonInfo !=
                                                null) ...[
                                              Container(
                                                width: Get.width * 0.3,
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    // Salon name
                                                    Text(
                                                      logic
                                                              .getAllExpertCategory
                                                              ?.data?[index]
                                                              .salonInfo
                                                              ?.name ??
                                                          "",
                                                      maxLines: 1,
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                      style: TextStyle(
                                                        fontFamily:
                                                            AppFontFamily
                                                                .heeBo600,
                                                        fontSize: 12,
                                                        color: AppColors
                                                            .primaryTextColor,
                                                      ),
                                                    ),
                                                    SizedBox(height: 2),
                                                    // Salon address
                                                    if (logic
                                                            .getAllExpertCategory
                                                            ?.data?[index]
                                                            .salonInfo
                                                            ?.addressDetails !=
                                                        null) ...[
                                                      Row(
                                                        children: [
                                                          Image.asset(
                                                            AppAsset.icLocation,
                                                            height: 12,
                                                            width: 12,
                                                          ).paddingOnly(
                                                              right: 3),
                                                          Expanded(
                                                            child: Text(
                                                              "${logic.getAllExpertCategory?.data?[index].salonInfo?.addressDetails?.addressLine1 ?? ""}, ${logic.getAllExpertCategory?.data?[index].salonInfo?.addressDetails?.city ?? ""}",
                                                              maxLines: 2,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              style: TextStyle(
                                                                color: AppColors
                                                                    .termsDialog,
                                                                fontFamily:
                                                                    AppFontFamily
                                                                        .heeBo600,
                                                                fontSize: 10,
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ],
                                                ),
                                              ),
                                              const Spacer(),
                                            ],
                                            Container(
                                              height: 32,
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                                color: AppColors.yellow2,
                                              ),
                                              child: SizedBox(
                                                height: 12,
                                                child: ListView.separated(
                                                  shrinkWrap: true,
                                                  itemCount: 5,
                                                  scrollDirection:
                                                      Axis.horizontal,
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 10),
                                                  itemBuilder:
                                                      (context, index) {
                                                    if (index <
                                                        logic.filledStars!) {
                                                      return Image.asset(
                                                        AppAsset.icStarFilled,
                                                        height: 13,
                                                        width: 13,
                                                      );
                                                    } else {
                                                      return Image.asset(
                                                        AppAsset.icStarOutline,
                                                        height: 13,
                                                        width: 13,
                                                      );
                                                    }
                                                  },
                                                  separatorBuilder:
                                                      (context, index) {
                                                    return SizedBox(
                                                        width:
                                                            Get.width * 0.015);
                                                  },
                                                ),
                                              ),
                                            ),
                                            const Spacer(),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      );
          },
        ),
        SizedBox(height: Get.height * 0.01),
      ],
    );
  }
}

/*class HomeScreenNewProductView extends StatelessWidget {
  const HomeScreenNewProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.productBg,
      padding: const EdgeInsets.all(15),
      child: Column(
        children: [
          ViewAll(
            title: "txtNewProducts".tr,
            subtitle: "txtViewAll".tr,
            onTap: () {
              Get.toNamed(
                AppRoutes.newProduct,
              );
            },
          ).paddingOnly(bottom: 10),
          GetBuilder<HomeScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.isLoading.value
                  ? Shimmers.newProductShimmer()
                  : GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount:
                          (logic.getNewProductModel?.data?.length ?? 0) >= 3 ? 3 : logic.getNewProductModel?.data?.length ?? 0,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 10,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 700),
                          columnCount: (logic.getNewProductModel?.data?.length ?? 0) >= 3
                              ? 3
                              : logic.getNewProductModel?.data?.length ?? 0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: InkWell(
                                onTap: () {
                                  if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                    Get.toNamed(
                                      AppRoutes.productDetail,
                                      arguments: [
                                        logic.getNewProductModel?.data?[index].id,
                                      ],
                                    );
                                  } else {
                                    Get.find<BottomBarController>().onClick(1);
                                  }
                                },
                                overlayColor: WidgetStateColor.transparent,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(21),
                                    color: RandomColorGenerator.getRandomColor(),
                                    boxShadow: Constant.boxShadow,
                                  ),
                                  child: Stack(
                                    children: [
                                      Column(
                                        children: [
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          CachedNetworkImage(
                                            imageUrl: logic.getNewProductModel?.data?[index].mainImage ?? "",
                                            height: 85,
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                            errorWidget: (context, url, error) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                          ),
                                          const Spacer(),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(
                                              Constant.capitalizeFirstLetter(
                                                  logic.getNewProductModel?.data?[index].productName ?? ""),
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 14,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(left: 7, right: 5),
                                          ),
                                          const SizedBox(height: 2),
                                          Row(
                                            children: [
                                              Text(
                                                "$currency ${logic.getNewProductModel?.data?[index].price ?? ""}",
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo800,
                                                  fontSize: 14,
                                                  color: AppColors.primaryAppColor,
                                                ),
                                              ).paddingOnly(right: 7),
                                              logic.getNewProductModel?.data?[index].mrp == null
                                                  ? Container()
                                                  : Text(
                                                      "$currency ${logic.getNewProductModel?.data?[index].mrp ?? ""}",
                                                      style: TextStyle(
                                                        fontFamily: AppFontFamily.heeBo700,
                                                        fontSize: 14,
                                                        decoration: TextDecoration.lineThrough,
                                                        decorationColor: AppColors.currencyRed,
                                                        color: AppColors.currencyRed,
                                                        decorationThickness: 1.5,
                                                      ),
                                                    ),
                                            ],
                                          ).paddingOnly(left: 10, right: 7),
                                          const Spacer(),
                                          const Spacer(),
                                        ],
                                      ),
                                      Positioned(
                                        right: 8,
                                        top: 8,
                                        child: GestureDetector(
                                          onTap: () {
                                            logic.onNewProductSaved(
                                              userId: Constant.storage.read<String>('userId') ?? "",
                                              categoryId: logic.getNewProductModel?.data?[index].category ?? "",
                                              productId: logic.getNewProductModel?.data?[index].id ?? "",
                                            );
                                          },
                                          child: logic.isNewProductSaved[index] == true
                                              ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                              : Image.asset(AppAsset.icLikeOutline, height: 30),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
            },
          ),
        ],
      ),
    );
  }
}

class HomeScreenTrendingProduct extends StatelessWidget {
  const HomeScreenTrendingProduct({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "txtTrendingProducts".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.trendingProduct,
            );
          },
        ).paddingOnly(bottom: 10),
        GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.trendingProductShimmer()
                : GridView.builder(
                    scrollDirection: Axis.vertical,
                    physics: const ScrollPhysics(),
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    itemCount: (logic.getTrendingProductModel?.data?.length ?? 0) >= 6
                        ? 6
                        : logic.getTrendingProductModel?.data?.length ?? 0,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 8,
                    ),
                    itemBuilder: (BuildContext context, int index) {
                      return AnimationConfiguration.staggeredGrid(
                        position: index,
                        duration: const Duration(milliseconds: 650),
                        columnCount: (logic.getTrendingProductModel?.data?.length ?? 0) >= 6
                            ? 6
                            : logic.getTrendingProductModel?.data?.length ?? 0,
                        child: FadeInAnimation(
                          child: ScaleAnimation(
                            child: InkWell(
                              onTap: () {
                                if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                  Get.toNamed(
                                    AppRoutes.productDetail,
                                    arguments: [
                                      logic.getTrendingProductModel?.data?[index].id,
                                    ],
                                  );
                                } else {
                                  Get.find<BottomBarController>().onClick(1);
                                }
                              },
                              overlayColor: WidgetStateColor.transparent,
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(21),
                                  color: RandomColorGenerator.getRandomColor(),
                                  boxShadow: Constant.boxShadow,
                                  border: Border.all(
                                    color: AppColors.grey.withOpacity(0.1),
                                    width: 1,
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    Column(
                                      children: [
                                        const Spacer(),
                                        const Spacer(),
                                        const Spacer(),
                                        const Spacer(),
                                        const Spacer(),
                                        CachedNetworkImage(
                                          imageUrl: logic.getTrendingProductModel?.data?[index].mainImage ?? "",
                                          height: 85,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                          },
                                        ),
                                        const Spacer(),
                                        const Spacer(),
                                        Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            Constant.capitalizeFirstLetter(
                                                logic.getTrendingProductModel?.data?[index].productName ?? ""),
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontFamily: AppFontFamily.heeBo700,
                                              fontSize: 14,
                                              color: AppColors.appText,
                                            ),
                                          ).paddingOnly(left: 7, right: 5),
                                        ),
                                        Row(
                                          children: [
                                            Image.asset(AppAsset.icRedStar, height: 12, color: AppColors.yellow3),
                                            Text(
                                              "${logic.getTrendingProductModel?.data?[index].review ?? ""} | ${logic.getTrendingProductModel?.data?[index].sold ?? ""} Sold",
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 12,
                                                color: AppColors.ratingBlack,
                                              ),
                                            ).paddingOnly(left: 4),
                                          ],
                                        ).paddingOnly(left: 7, right: 7),
                                        Row(
                                          children: [
                                            Text(
                                              "$currency ${logic.getTrendingProductModel?.data?[index].price ?? ""}",
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo800,
                                                fontSize: 14,
                                                color: AppColors.primaryAppColor,
                                              ),
                                            ).paddingOnly(right: 7),
                                            logic.getTrendingProductModel?.data?[index].mrp == null
                                                ? Container()
                                                : Text(
                                                    "$currency ${logic.getTrendingProductModel?.data?[index].mrp ?? ""}",
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily.heeBo700,
                                                      fontSize: 14,
                                                      decoration: TextDecoration.lineThrough,
                                                      decorationColor: AppColors.currencyRed,
                                                      color: AppColors.currencyRed,
                                                      decorationThickness: 1.5,
                                                    ),
                                                  ),
                                          ],
                                        ).paddingOnly(left: 10, right: 7),
                                        const Spacer(),
                                        const Spacer(),
                                      ],
                                    ),
                                    logic.getTrendingProductModel?.data?[index].isBestSeller == true
                                        ? Container(
                                            height: 22,
                                            width: Get.width * 0.17,
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              borderRadius: const BorderRadius.only(
                                                topLeft: Radius.circular(21),
                                                bottomRight: Radius.circular(21),
                                                topRight: Radius.circular(21),
                                              ),
                                              color: AppColors.sellerBg,
                                            ),
                                            child: Text(
                                               "txtBestSeller".tr,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 10,
                                                color: AppColors.sellerYellow,
                                              ),
                                            ),
                                          )
                                        : const SizedBox(),
                                    Positioned(
                                      right: 8,
                                      top: 8,
                                      child: GestureDetector(
                                        onTap: () {
                                          logic.onTrendingProductSaved(
                                            userId: Constant.storage.read<String>('userId') ?? "",
                                            categoryId: logic.getTrendingProductModel?.data?[index].category ?? "",
                                            productId: logic.getTrendingProductModel?.data?[index].id ?? "",
                                          );
                                        },
                                        child: logic.isTrendingProductSaved[index] == true
                                            ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                            : Image.asset(AppAsset.icLikeOutline, height: 30),
                                      ),
                                    ),
                                  ],
                                ),
                              ).paddingOnly(bottom: 10),
                            ),
                          ),
                        ),
                      );
                    },
                  );
          },
        ),
      ],
    ).paddingOnly(left: 15, right: 15, top: 15);
  }
}*/
