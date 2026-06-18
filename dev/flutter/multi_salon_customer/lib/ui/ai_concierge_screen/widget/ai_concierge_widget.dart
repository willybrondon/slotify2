import 'dart:io';

import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/hair_profile_service.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';
import 'package:salon_2/ui/ai_concierge_screen/model/ai_concierge_model.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:video_player/video_player.dart';

String _captureHeroTitle(AiConciergeController logic) {
  if (logic.fromShare && logic.hasCaptureMedia) {
    return logic.isVideoMedia
        ? 'txtCaptureSharedVideoTitle'.tr
        : 'txtCaptureSharedHeroTitle'.tr;
  }
  return logic.captureMode
      ? 'txtCaptureHeroTitle'.tr
      : 'txtAiConciergeHeroTitle'.tr;
}

String _captureHeroBody(AiConciergeController logic) {
  if (logic.fromShare && logic.hasCaptureMedia) {
    return logic.isVideoMedia
        ? 'txtCaptureSharedVideoBody'.tr
        : 'txtCaptureSharedHeroBody'.tr;
  }
  return logic.captureMode
      ? 'txtCaptureHeroBody'.tr
      : 'txtAiConciergeHeroBody'.tr;
}

Widget _buildLinkHintBanner(AiConciergeController logic) {
  return Container(
    margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: AppColors.iconAccent.withOpacity(0.08),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.iconAccent.withOpacity(0.25)),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.info_outline, color: AppColors.iconAccent, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'txtCaptureLinkHint'.tr,
            style: TextStyle(fontSize: 13, color: AppColors.primaryTextColor),
          ),
        ),
      ],
    ),
  );
}

Widget _buildPasteLinkRow(AiConciergeController logic) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 20),
    child: OutlinedButton.icon(
      onPressed: () async {
        final data = await FlutterClipboard.paste();
        if (data.trim().isEmpty) return;
        logic.setSharedLink(data.trim());
      },
      icon: const Icon(Icons.link),
      label: Text('txtCapturePasteLink'.tr),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
  );
}

class _CaptureVideoPreview extends StatefulWidget {
  const _CaptureVideoPreview({required this.path});

  final String path;

  @override
  State<_CaptureVideoPreview> createState() => _CaptureVideoPreviewState();
}

class _CaptureVideoPreviewState extends State<_CaptureVideoPreview> {
  VideoPlayerController? _controller;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.file(File(widget.path))
      ..initialize().then((_) {
        if (mounted) setState(() {});
        _controller?.setLooping(true);
        _controller?.play();
      }).catchError((_) {
        if (mounted) setState(() => _failed = true);
      });
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_failed || _controller == null || !_controller!.value.isInitialized) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.videocam, size: 64, color: AppColors.iconAccent),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'txtCaptureVideoReady'.tr,
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.grey, fontSize: 14),
            ),
          ),
        ],
      );
    }
    return Stack(
      alignment: Alignment.center,
      children: [
        AspectRatio(
          aspectRatio: _controller!.value.aspectRatio,
          child: VideoPlayer(_controller!),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.black54,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.videocam, color: Colors.white, size: 16),
              const SizedBox(width: 6),
              Text(
                'txtCaptureVideoLabel'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ShareLookHairProfileStrip extends StatelessWidget {
  const _ShareLookHairProfileStrip();

  @override
  Widget build(BuildContext context) {
    final profile = HairProfileService.instance.load();

    if (!profile.isComplete) {
      return GestureDetector(
        onTap: () => Get.toNamed(AppRoutes.hairProfile),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.brandTerracotta.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.brandTerracotta.withOpacity(0.2),
            ),
          ),
          child: Row(
            children: [
              Icon(Icons.spa_outlined, color: AppColors.brandTerracotta, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'txtHairProfileIncomplete'.tr,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                    fontSize: 13,
                    color: AppColors.brandBlack,
                    height: 1.35,
                  ),
                ),
              ),
              Icon(Icons.arrow_forward_ios,
                  size: 14, color: AppColors.brandTerracotta),
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
            Icon(Icons.check_circle, color: AppColors.brandTerracotta, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                '${'txtHairProfileSummary'.tr}: $summary',
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 13,
                  color: AppColors.brandBlack,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              'txtHairProfileEdit'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayBold,
                fontSize: 12,
                color: AppColors.brandTerracotta,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShareLookUploadButton extends StatelessWidget {
  const _ShareLookUploadButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.primary = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final fg = primary ? AppColors.whiteColor : AppColors.brandBlack;
    final iconColor = primary ? AppColors.whiteColor : AppColors.brandTerracotta;

    return Material(
      color: primary ? AppColors.brandTerracotta : AppColors.whiteColor,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: primary
                  ? AppColors.brandTerracotta
                  : AppColors.brandTerracotta.withOpacity(0.28),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: iconColor, size: 26),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: fg,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShareLookTrustPill extends StatelessWidget {
  const _ShareLookTrustPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.brandTerracotta.withOpacity(0.25)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
          color: AppColors.brandTerracotta,
        ),
      ),
    );
  }
}

/// Share-look page aligned with web mobile `partager-un-look.html`
class ShareLookCaptureView extends StatelessWidget {
  const ShareLookCaptureView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AiConciergeController>(
      id: Constant.idProgressView,
      builder: (logic) {
        final showFullHero = !(logic.fromShare && logic.hasCaptureMedia);

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (showFullHero) ...[
                Text(
                  'txtShareLookKicker'.tr,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.8,
                    color: AppColors.brandTerracotta,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'txtIntentCaptureTitle'.tr,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.brandBlack,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'txtShareLookLead'.tr,
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.5,
                    color: AppColors.grey,
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _socialGlyph('IG'),
                    const SizedBox(width: 18),
                    _socialGlyph('TT'),
                    const SizedBox(width: 18),
                    _socialGlyph('FB'),
                    const SizedBox(width: 18),
                    _socialGlyph('SC'),
                  ],
                ),
                const SizedBox(height: 22),
                Center(
                  child: Column(
                    children: [
                      Text(
                        'txtShareLookTrustLine'.tr,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF5C3D2E),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        alignment: WrapAlignment.center,
                        children: [
                          _ShareLookTrustPill(label: 'txtShareLookPillTresses'.tr),
                          _ShareLookTrustPill(label: 'txtShareLookPillLocks'.tr),
                          _ShareLookTrustPill(label: 'txtShareLookPillWigs'.tr),
                          _ShareLookTrustPill(label: 'txtShareLookPillMen'.tr),
                          _ShareLookTrustPill(label: 'txtShareLookPillBeauty'.tr),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ] else ...[
                Text(
                  _captureHeroTitle(logic),
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.brandBlack,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _captureHeroBody(logic),
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.45,
                    color: AppColors.grey,
                  ),
                ),
                const SizedBox(height: 16),
              ],

              const _ShareLookHairProfileStrip(),
              const SizedBox(height: 16),

              if (logic.sharedLink != null && logic.sharedLink!.isNotEmpty)
                _buildLinkHintBanner(logic),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF5C3D2E).withOpacity(0.08),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'txtCapturePrivacy'.tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.45,
                        color: AppColors.grey,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _ShareLookUploadButton(
                      icon: Icons.smartphone_outlined,
                      label: 'txtShareLookBtnScreenshot'.tr,
                      onTap: logic.onPickScreenshot,
                    ),
                    const SizedBox(height: 10),
                    _ShareLookUploadButton(
                      icon: Icons.face_outlined,
                      label: 'txtShareLookBtnSelfie'.tr,
                      onTap: logic.onPickSelfie,
                    ),
                    const SizedBox(height: 10),
                    _ShareLookUploadButton(
                      icon: Icons.photo_camera_outlined,
                      label: 'txtShareLookBtnPhoto'.tr,
                      onTap: logic.onPickPhoto,
                      primary: true,
                    ),
                    const SizedBox(height: 16),
                    _ShareLookUploadArea(logic: logic),
                    if (logic.hasCaptureMedia) ...[
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: logic.isLoading.value
                              ? null
                              : () async {
                                  final userId =
                                      Constant.storage.read<String>('userId');
                                  await logic.onAnalyzeSelfieApiCall(
                                    userId: userId,
                                    latitude: latitude?.toString(),
                                    longitude: longitude?.toString(),
                                    city: city,
                                  );
                                },
                          icon: logic.isLoading.value
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.whiteColor,
                                    ),
                                  ),
                                )
                              : Icon(Icons.auto_awesome,
                                  color: AppColors.whiteColor),
                          label: Text(
                            logic.isLoading.value
                                ? 'txtAiConciergeAnalyzing'.tr
                                : 'txtCaptureBookLook'.tr,
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.brandTerracotta,
                            disabledBackgroundColor:
                                AppColors.brandTerracotta.withOpacity(0.6),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _socialGlyph(String label) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.brandTerracotta.withOpacity(0.85),
        letterSpacing: 0.5,
      ),
    );
  }
}

class _ShareLookUploadArea extends StatelessWidget {
  const _ShareLookUploadArea({required this.logic});

  final AiConciergeController logic;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.brandTerracotta.withOpacity(0.45),
          width: 1.5,
        ),
      ),
      child: logic.hasCaptureMedia
          ? _buildPreview()
          : _buildPlaceholder(),
    );
  }

  Widget _buildPlaceholder() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
      child: Column(
        children: [
          Text(
            'txtShareLookUploadKicker'.tr,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.6,
              color: AppColors.brandTerracotta,
            ),
          ),
          const SizedBox(height: 14),
          Icon(Icons.collections_outlined,
              size: 52, color: AppColors.brandTerracotta.withOpacity(0.75)),
          const SizedBox(height: 14),
          Text(
            'txtShareLookUploadTitle'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.brandBlack,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'txtShareLookUploadLead'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              height: 1.45,
              color: AppColors.grey,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'txtShareLookUploadHint'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.grey.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'txtCaptureScreenRecordSteps'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontStyle: FontStyle.italic,
              height: 1.4,
              color: AppColors.brandTerracotta.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreview() {
    return Column(
      children: [
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
          child: SizedBox(
            height: Get.height * 0.32,
            width: double.infinity,
            child: logic.isVideoMedia && logic.video != null
                ? _CaptureVideoPreview(path: logic.video!.path)
                : Image.file(
                    logic.selectImageFile!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                  ),
          ),
        ),
        TextButton.icon(
          onPressed: logic.clearImage,
          icon: Icon(Icons.close, color: AppColors.brandTerracotta, size: 18),
          label: Text(
            'txtShareLookRemoveMedia'.tr,
            style: TextStyle(
              color: AppColors.brandTerracotta,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

/// Main view for image selection and analysis
class AiConciergeMainView extends StatelessWidget {
  const AiConciergeMainView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AiConciergeController>(
      id: Constant.idProgressView,
      builder: (logic) {
        if (logic.captureMode) {
          return const ShareLookCaptureView();
        }

        final capture = logic.captureMode;
        return SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 20),

              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(16),
                  border: capture
                      ? Border.all(
                          color: AppColors.brandTerracotta.withOpacity(0.2),
                        )
                      : null,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.blackColor.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Icon(
                      logic.captureMode
                          ? (logic.isVideoMedia
                              ? Icons.videocam_outlined
                              : Icons.share_outlined)
                          : Icons.face_retouching_natural,
                      size: 60,
                      color: AppColors.iconAccent,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _captureHeroTitle(logic),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _captureHeroBody(logic),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.grey,
                      ),
                    ),
                  ],
                ),
              ),

              if (logic.sharedLink != null && logic.sharedLink!.isNotEmpty)
                _buildLinkHintBanner(logic),

              const SizedBox(height: 16),
              _buildPasteLinkRow(logic),
              const SizedBox(height: 16),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'txtCapturePrivacy'.tr,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.grey.withOpacity(0.9),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Selected Image Preview
                    if (logic.hasCaptureMedia)
                      Container(
                        height: Get.height * 0.4,
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.lineColor,
                            width: 2,
                          ),
                          color: AppColors.blackColor,
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: logic.isVideoMedia && logic.video != null
                              ? _CaptureVideoPreview(path: logic.video!.path)
                              : Image.file(
                                  logic.selectImageFile!,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                ),
                        ),
                      )
                    else
                      // Placeholder
                      Container(
                        height: Get.height * 0.4,
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: AppColors.lineColor.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.lineColor,
                            width: 2,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              logic.captureMode
                                  ? Icons.perm_media_outlined
                                  : Icons.add_photo_alternate_outlined,
                              size: 80,
                              color: AppColors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              logic.captureMode
                                  ? "txtCaptureUploadTitle".tr
                                  : "txtAiConciergeUploadTitle".tr,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.grey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              logic.captureMode
                                  ? "txtCaptureUploadHint".tr
                                  : "txtAiConciergeUploadHint".tr,
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: logic.hasCaptureMedia
                                ? () {
                                    logic.clearImage();
                                  }
                                : () {
                                    logic.showImageSourceDialog();
                                  },
                            icon: Icon(
                              logic.hasCaptureMedia
                                  ? Icons.refresh
                                  : Icons.add_photo_alternate,
                              color: AppColors.whiteColor,
                            ),
                            label: Text(
                              logic.hasCaptureMedia
                                  ? "txtAiConciergeChangeImage".tr
                                  : (logic.captureMode
                                      ? "txtCaptureAddMedia".tr
                                      : "txtAiConciergeSelectImage".tr),
                              style: TextStyle(
                                color: AppColors.whiteColor,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryAppColor,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Analyze Button
                    if (logic.hasCaptureMedia)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: logic.isLoading.value
                              ? null
                              : () async {
                                  final userId =
                                      Constant.storage.read<String>('userId');
                                  await logic.onAnalyzeSelfieApiCall(
                                    userId: userId,
                                    latitude: latitude?.toString(),
                                    longitude: longitude?.toString(),
                                    city: city,
                                  );
                                },
                          icon: logic.isLoading.value
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.whiteColor,
                                    ),
                                  ),
                                )
                              : Icon(
                                  Icons.auto_awesome,
                                  color: AppColors.whiteColor,
                                ),
                          label: Text(
                            logic.isLoading.value
                                ? "txtAiConciergeAnalyzing".tr
                                : logic.captureMode
                                    ? "txtCaptureAnalyzeLook".tr
                                    : "txtAiConciergeAnalyze".tr,
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryAppColor,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 2,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        );
      },
    );
  }
}

/// Results view showing analysis and recommendations
class AiConciergeResultsView extends StatelessWidget {
  const AiConciergeResultsView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AiConciergeController>();
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (controller.captureMode)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primaryAppColor.withOpacity(0.12),
                    AppColors.primaryAppColor.withOpacity(0.04),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'txtCaptureResultFound'.tr,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.iconAccent,
                ),
              ),
            ),

          // Header with image
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.hasCaptureMedia) {
                if (controller.isVideoMedia && controller.video != null) {
                  return Container(
                    height: Get.height * 0.3,
                    width: double.infinity,
                    margin: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: AppColors.blackColor,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: _CaptureVideoPreview(path: controller.video!.path),
                    ),
                  );
                }
                return Container(
                  height: Get.height * 0.3,
                  width: double.infinity,
                  margin: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.file(
                      controller.selectImageFile!,
                      fit: BoxFit.cover,
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),

          // Analysis Results
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.beautyAnalysis != null) {
                return _buildAnalysisSection(controller.beautyAnalysis!);
              }
              return const SizedBox.shrink();
            },
          ),

          // Recommendations
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              if (controller.recommendations != null) {
                return _buildRecommendationsSection(
                    controller.recommendations!);
              }
              return const SizedBox.shrink();
            },
          ),

          const SizedBox(height: 20),

          // Action Buttons
          Builder(
            builder: (context) {
              final controller = Get.find<AiConciergeController>();
              final capture = controller.captureMode;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          controller.resetAnalysis();
                          controller.clearImage();
                        },
                        icon: const Icon(Icons.refresh),
                        label: Text(
                          capture
                              ? 'txtShareLookAnalyzeAnother'.tr
                              : 'txtAnalyzeAnother'.tr,
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: capture
                              ? BorderSide(
                                  color: AppColors.brandTerracotta.withOpacity(0.5),
                                )
                              : null,
                          foregroundColor: capture
                              ? AppColors.brandTerracotta
                              : null,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Get.back();
                        },
                        icon: Icon(Icons.home, color: AppColors.whiteColor),
                        label: Text(
                          capture
                              ? 'txtShareLookBackHome'.tr
                              : 'Back to Home',
                          style: TextStyle(color: AppColors.whiteColor),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: capture
                              ? AppColors.brandTerracotta
                              : AppColors.primaryAppColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildAnalysisSection(BeautyAnalysis analysis) {
    final capture = Get.find<AiConciergeController>().captureMode;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.insights_outlined,
                color: capture
                    ? AppColors.brandTerracotta
                    : AppColors.iconAccent,
                size: 22,
              ),
              const SizedBox(width: 8),
              Text(
                capture
                    ? 'txtShareLookAnalysisTitle'.tr
                    : 'Beauty Analysis',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: capture
                      ? AppColors.brandBlack
                      : AppColors.iconAccent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Skin Analysis
          if (analysis.skin != null) _buildSkinAnalysis(analysis.skin!),
          const SizedBox(height: 16),

          // Hair Analysis
          if (analysis.hair != null) _buildHairAnalysis(analysis.hair!),
          const SizedBox(height: 16),

          // Face Analysis
          if (analysis.face != null) _buildFaceAnalysis(analysis.face!),
        ],
      ),
    );
  }

  Widget _buildSkinAnalysis(SkinAnalysis skin) {
    return _buildAnalysisCard(
      icon: Icons.face,
      title: "Skin Analysis",
      items: {
        "Type": skin.type ?? "N/A",
        "Tone": skin.tone ?? "N/A",
        "Undertone": skin.undertone ?? "N/A",
        "Condition": skin.condition ?? "N/A",
        if (skin.concerns != null && skin.concerns!.isNotEmpty)
          "Concerns": skin.concerns!.join(", "),
      },
      color: Colors.pink,
    );
  }

  Widget _buildHairAnalysis(HairAnalysis hair) {
    return _buildAnalysisCard(
      icon: Icons.content_cut,
      title: "Hair Analysis",
      items: {
        "Type": hair.type ?? "N/A",
        "Texture": hair.texture ?? "N/A",
        "Color": hair.color ?? "N/A",
        "Condition": hair.condition ?? "N/A",
        if (hair.length != null) "Length": hair.length!,
      },
      color: Colors.brown,
    );
  }

  Widget _buildFaceAnalysis(FaceAnalysis face) {
    return _buildAnalysisCard(
      icon: Icons.face,
      title: "Facial Features",
      items: {
        "Face Shape": face.shape ?? "N/A",
        "Eye Shape": face.eyeShape ?? "N/A",
        "Lip Shape": face.lipShape ?? "N/A",
        if (face.eyebrowShape != null) "Eyebrow": face.eyebrowShape!,
      },
      color: Colors.blue,
    );
  }

  Widget _buildAnalysisCard({
    required IconData icon,
    required String title,
    required Map<String, String> items,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items.entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 100,
                      child: Text(
                        "${entry.key}:",
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        entry.value,
                        style: TextStyle(
                          color: AppColors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildRecommendationsSection(Recommendations recommendations) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (recommendations.detectedService?.label != null)
          _buildDetectedServiceBanner(recommendations.detectedService!),

        if (recommendations.noMatch == true &&
            recommendations.noMatchMessage != null)
          _buildNoMatchBanner(recommendations.noMatchMessage!),

        if (recommendations.services != null &&
            recommendations.services!.isNotEmpty)
          _buildServicesSection(recommendations.services!.take(4).toList()),

        if (recommendations.salons != null &&
            recommendations.salons!.isNotEmpty)
          _buildSalonsSection(recommendations.salons!.take(4).toList()),

        if (recommendations.beautyTips != null &&
            recommendations.beautyTips!.isNotEmpty)
          _buildBeautyTipsSection(recommendations.beautyTips!),
      ],
    );
  }

  Widget _buildDetectedServiceBanner(DetectedService detected) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.iconAccent.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.iconAccent.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'txtAiConciergeDetectedService'.tr,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.iconAccent,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            detected.label ?? '',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryTextColor,
            ),
          ),
          if (detected.summary != null && detected.summary!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              detected.summary!,
              style: TextStyle(fontSize: 13, color: AppColors.grey, height: 1.35),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNoMatchBanner(String message) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.lineColor.withOpacity(0.35),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: AppColors.grey, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(fontSize: 13, color: AppColors.grey, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServicesSection(List<ServiceItem> services) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "txtAiConciergeRecommendedServices".tr,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.iconAccent,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return InkWell(
                  onTap: () {
                    // In the app: always use app routes to show salons filtered by service
                    // On web: use web links
                    if (kIsWeb) {
                      // Web: open category page
                      if (service.shareUrl != null &&
                          service.shareUrl!.isNotEmpty) {
                        print(
                            "AI Concierge (Web): Clicked service: ${service.name}, Opening web URL: ${service.shareUrl}");
                        Utils.launchURL(service.shareUrl!);
                      } else {
                        print(
                            "AI Concierge (Web): Service shareUrl is null or empty for service: ${service.name}");
                      }
                    } else {
                      // App: navigate to salon listing filtered by service
                      if (service.id != null && service.id!.isNotEmpty) {
                        print(
                            "AI Concierge (App): Clicked service: ${service.name}, ID: ${service.id}, Navigating to salon listing");
                        Get.toNamed(
                          AppRoutes.selectBranch,
                          arguments: [
                            [], // checkItem
                            0.0, // totalPrice
                            0.0, // finalTaxRupee
                            0, // totalMinute
                            [
                              service.id!
                            ], // serviceId - single service for filtering salons
                            0.0, // withOutTaxRupee
                          ],
                        );
                      } else {
                        print(
                            "AI Concierge (App): Service ID is null or empty for service: ${service.name}");
                      }
                    }
                  },
                  child: Container(
                    width: 150,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.whiteColor,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.blackColor.withOpacity(0.05),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (service.image != null && service.image!.isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CachedNetworkImage(
                              imageUrl: service.image!,
                              height: 60,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: AppColors.lineColor,
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: AppColors.lineColor,
                                child: const Icon(Icons.image),
                              ),
                            ),
                          )
                        else
                          Container(
                            height: 60,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppColors.lineColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.spa),
                          ),
                        const SizedBox(height: 8),
                        Text(
                          service.name ?? "Service",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryTextColor,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSalonsSection(List<SalonItem> salons) {
    final capture = Get.find<AiConciergeController>().captureMode;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.storefront_outlined,
                color: capture
                    ? AppColors.brandTerracotta
                    : AppColors.iconAccent,
                size: 22,
              ),
              const SizedBox(width: 8),
              Text(
                capture
                    ? 'txtShareLookSalonsTitle'.tr
                    : 'txtAiConciergeRecommendedSalons'.tr,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: capture
                      ? AppColors.brandBlack
                      : AppColors.iconAccent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...salons.map((salon) => InkWell(
                onTap: () {
                  // In the app: always navigate directly to salon detail for booking
                  // On web: use web links (which will have "Open in App" button)
                  if (kIsWeb) {
                    // Web: open salon page (which has "Open in App" button)
                    if (salon.shareUrl != null && salon.shareUrl!.isNotEmpty) {
                      print(
                          "AI Concierge (Web): Clicked salon: ${salon.name}, Opening web URL: ${salon.shareUrl}");
                      Utils.launchURL(salon.shareUrl!);
                    } else {
                      print(
                          "AI Concierge (Web): Salon shareUrl is null or empty for salon: ${salon.name}");
                    }
                  } else {
                    // App: navigate directly to salon detail for booking
                    if (salon.id != null && salon.id!.isNotEmpty) {
                      print(
                          "AI Concierge (App): Clicked salon: ${salon.name}, ID: ${salon.id}, Navigating to salon detail for booking");
                      Get.toNamed(
                        AppRoutes.branchDetail,
                        arguments: [salon.id],
                      );
                    } else {
                      print(
                          "AI Concierge (App): Salon ID is null or empty for salon: ${salon.name}");
                    }
                  }
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      if (salon.image != null && salon.image!.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: salon.image!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              width: 60,
                              height: 60,
                              color: AppColors.lineColor,
                            ),
                            errorWidget: (context, url, error) => Container(
                              width: 60,
                              height: 60,
                              color: AppColors.lineColor,
                              child: const Icon(Icons.business),
                            ),
                          ),
                        )
                      else
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.lineColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.business),
                        ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              salon.name ?? "Salon",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryTextColor,
                              ),
                            ),
                            if (salon.review != null)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.star,
                                    size: 14,
                                    color: Colors.amber,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    salon.review!.toStringAsFixed(1),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.grey,
                                    ),
                                  ),
                                  if (salon.distance != null) ...[
                                    const SizedBox(width: 8),
                                    Text(
                                      '${salon.distance!.toStringAsFixed(1)} km',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.grey,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            if (salon.matchedService?.name != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  '${'txtAiConciergeMatchedService'.tr}: ${salon.matchedService!.name}${salon.matchedService!.price != null ? ' · ${salon.matchedService!.price} €' : ''}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.iconAccent,
                                  ),
                                ),
                              ),
                            if (salon.matchedExpert?.name != null)
                              Text(
                                salon.matchedExpert!.name!,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.grey,
                                ),
                              ),
                            if (salon.confidenceScore != null)
                              Text(
                                '${salon.confidenceScore}% ${'txtAiConciergeMatchScore'.tr}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.grey,
                                ),
                              ),
                            if (salon.address != null)
                              Text(
                                salon.address!,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.grey,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: AppColors.grey,
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildBeautyTipsSection(List<String> tips) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline, color: Colors.amber),
              const SizedBox(width: 8),
              Text(
                "Beauty Tips",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.iconAccent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...tips.map((tip) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6, right: 12),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: AppColors.iconAccent,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        tip,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.primaryTextColor,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
