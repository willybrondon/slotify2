import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:http_parser/http_parser.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:salon_2/main.dart' show city, latitude, longitude;
import 'package:salon_2/ui/ai_concierge_screen/model/ai_concierge_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class AiConciergeController extends GetxController {
  ImagePicker picker = ImagePicker();
  XFile? image;
  File? selectImageFile;

  // API Variables
  AiConciergeModel? aiConciergeModel;
  RxBool isLoading = false.obs;

  // Analysis Data
  BeautyAnalysis? beautyAnalysis;
  Recommendations? recommendations;

  /// Visual capture flow (share sheet / deep link)
  bool captureMode = false;
  bool fromShare = false;
  String? sharedLink;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      fromShare = args['fromShare'] == true;
      captureMode =
          args['captureMode'] == true || fromShare || args['sharedLink'] != null;
      sharedLink = args['sharedLink'] as String?;
      final path = args['sharedImagePath'] as String?;
      final autoAnalyze = args['autoAnalyze'] == true;
      if (path != null && path.isNotEmpty) {
        _loadSharedImage(path, autoAnalyze: autoAnalyze);
      }
    }
  }

  Future<void> _loadSharedImage(String path, {bool autoAnalyze = false}) async {
    try {
      image = XFile(path);
      selectImageFile = File(path);
      update([Constant.idProgressView]);
      if (autoAnalyze) {
        SchedulerBinding.instance.addPostFrameCallback((_) async {
          await runCaptureAnalysis();
        });
      }
    } catch (e) {
      log('Share image load error: $e');
      Utils.showToast(Get.context!, 'txtCaptureImageError'.tr);
    }
  }

  Future<void> runCaptureAnalysis() async {
    final userId = Constant.storage.read<String>('userId');
    await onAnalyzeSelfieApiCall(
      userId: userId,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
      city: city,
    );
  }

  void setSharedLink(String? value) {
    sharedLink = value?.trim();
    if (sharedLink != null && sharedLink!.isNotEmpty) {
      captureMode = true;
    }
    update([Constant.idProgressView]);
  }

  /// Pick image from gallery
  onPickImage() async {
    try {
      image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (image != null) {
        selectImageFile = File(image!.path);
        update();
      }
    } catch (e) {
      log("Error picking image: $e");
      Utils.showToast(Get.context!, "Failed to pick image");
    }
  }

  /// Pick image from camera
  onPickImageFromCamera() async {
    try {
      image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (image != null) {
        selectImageFile = File(image!.path);
        update();
      }
    } catch (e) {
      log("Error picking image from camera: $e");
      Utils.showToast(Get.context!, "Failed to take photo");
    }
  }

  /// Show image source selection dialog
  showImageSourceDialog() {
    Get.dialog(
      AlertDialog(
        title: Text("txtSelectImageSource".tr),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: Text("txtGallery".tr),
              onTap: () {
                Get.back();
                onPickImage();
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: Text("txtCamera".tr),
              onTap: () {
                Get.back();
                onPickImageFromCamera();
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Analyze selfie image
  onAnalyzeSelfieApiCall({
    String? userId,
    String? latitude,
    String? longitude,
    String? city,
    String? occasion,
  }) async {
    try {
      if (image == null && selectImageFile == null) {
        Utils.showToast(Get.context!, "Please select an image first");
        return;
      }

      isLoading(true);
      update([Constant.idProgressView]);

      final uri = Uri.parse(ApiConstant.BASE_URL + ApiConstant.analyzeSelfie);
      log("Analyze Selfie URL :: $uri");

      var request = http.MultipartRequest("POST", uri);

      // Use XFile.readAsBytes() for reliable upload on iOS/Android - handles content URIs,
      // temporary cache paths, and scoped storage. File(path) fails on Android content:// URIs.
      final Uint8List imageBytes = image != null
          ? await image!.readAsBytes()
          : await selectImageFile!.readAsBytes();

      if (imageBytes.isEmpty) {
        Utils.showToast(Get.context!, "Failed to read image. Please try again.");
        return;
      }

      // Determine extension from path or name (path may be invalid on mobile)
      String ext = 'jpg';
      if (image != null) {
        final pathOrName = (image!.path.isNotEmpty ? image!.path : image!.name).toLowerCase();
        if (pathOrName.endsWith('.png')) ext = 'png';
        else if (pathOrName.endsWith('.webp')) ext = 'webp';
      } else if (selectImageFile != null) {
        final p = selectImageFile!.path.toLowerCase();
        if (p.endsWith('.png')) ext = 'png';
        else if (p.endsWith('.webp')) ext = 'webp';
      }

      final mimeType = ext == 'png' ? 'image/png' : ext == 'webp' ? 'image/webp' : 'image/jpeg';
      final addImage = http.MultipartFile.fromBytes(
        "image",
        imageBytes,
        filename: "selfie.$ext",
        contentType: MediaType.parse(mimeType),
      );
      request.files.add(addImage);
      log("Image size: ${imageBytes.length} bytes, ext: $ext");

      // Add headers
      request.headers.addAll({"key": ApiConstant.SECRET_KEY});

      // Add form fields
      Map<String, String> requestBody = <String, String>{};
      if (userId != null && userId.isNotEmpty) {
        requestBody["userId"] = userId;
      }
      if (latitude != null && latitude.isNotEmpty) {
        requestBody["latitude"] = latitude;
      }
      if (longitude != null && longitude.isNotEmpty) {
        requestBody["longitude"] = longitude;
      }
      if (city != null && city.isNotEmpty) {
        requestBody["city"] = city;
      }
      if (occasion != null && occasion.isNotEmpty) {
        requestBody["occasion"] = occasion;
      }

      log("Analyze Selfie Body :: $requestBody");
      request.fields.addAll(requestBody);

      // Send request with timeout (60s for AI analysis)
      var res1 = await request.send().timeout(
        const Duration(seconds: 60),
        onTimeout: () => throw Exception('Request timed out. Please check your connection and try again.'),
      );
      var res = await http.Response.fromStream(res1);
      log("Analyze Selfie Status Code :: ${res.statusCode}");
      log("Analyze Selfie Response :: ${res.body}");

      if (res.statusCode == 200) {
        dynamic jsonResponse;
        try {
          jsonResponse = jsonDecode(res.body);
        } catch (parseError) {
          log("Analyze Selfie JSON parse error: $parseError, body: ${res.body}");
          Utils.showToast(Get.context!, "Invalid server response. Please try again.");
          return;
        }
        try {
          aiConciergeModel = AiConciergeModel.fromJson(jsonResponse);
        } catch (modelError) {
          log("Analyze Selfie model parse error: $modelError");
          final msg = jsonResponse is Map && jsonResponse['message'] != null
              ? jsonResponse['message'].toString()
              : "Failed to analyze image. Please try again.";
          Utils.showToast(Get.context!, msg);
          return;
        }

        if (aiConciergeModel?.status == true) {
          beautyAnalysis = aiConciergeModel?.data?.analysis;
          recommendations = aiConciergeModel?.data?.recommendations;

          log("Analysis completed successfully");
          log("Provider: ${aiConciergeModel?.data?.provider}");

          // Debug: Log recommendations data
          if (recommendations != null) {
            log("Recommendations - Services count: ${recommendations?.services?.length ?? 0}");
            log("Recommendations - Salons count: ${recommendations?.salons?.length ?? 0}");
            final services = recommendations?.services;
            if (services != null && services.isNotEmpty) {
              log("First service ID: ${services[0].id}");
            }
            final salons = recommendations?.salons;
            if (salons != null && salons.isNotEmpty) {
              log("First salon ID: ${salons[0].id}");
            }
          }

          return aiConciergeModel;
        } else {
          Utils.showToast(
            Get.context!,
            aiConciergeModel?.message ?? "Failed to analyze image",
          );
        }
      } else {
        log("Analyze Selfie Error Status Code :: ${res.statusCode}, body: ${res.body}");
        String errMsg = "Failed to analyze image. Please try again.";
        try {
          final errJson = jsonDecode(res.body);
          if (errJson is Map && errJson['message'] != null) {
            errMsg = errJson['message'].toString();
          }
        } catch (_) {}
        Utils.showToast(Get.context!, errMsg);
      }
    } catch (e) {
      log("Analyze Selfie Error :: $e");
      final errStr = e.toString();
      final msg = errStr.contains('SocketException') || errStr.contains('Connection')
          ? "Network error. Please check your connection and try again."
          : errStr.contains('timed out')
              ? "Request timed out. Please try again."
              : "Failed to analyze image. Please try again.";
      Utils.showToast(Get.context!, msg);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  /// Chat with AI concierge
  onChatWithAiApiCall({
    required String message,
    String? userId,
    List<Map<String, dynamic>>? conversationHistory,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({
        "message": message,
        "userId": userId ?? Constant.storage.read<String>('userId') ?? "",
        "conversationHistory": conversationHistory ?? [],
      });

      log("AI Chat Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.aiConciergeChat);
      log("AI Chat URL :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      log("AI Chat Headers :: $headers");

      final response = await http
          .post(url, headers: headers, body: body)
          .timeout(const Duration(seconds: 30));

      log("AI Chat Status Code :: ${response.statusCode}");
      log("AI Chat Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true) {
          return jsonResponse['data']['response'];
        } else {
          Utils.showToast(Get.context!,
              jsonResponse['message'] ?? "Failed to get AI response");
        }
      } else {
        Utils.showToast(
            Get.context!, "Failed to get AI response. Please try again.");
      }
    } catch (e) {
      log("AI Chat Error :: $e");
      Utils.showToast(Get.context!, "Error: ${e.toString()}");
      throw Exception(e);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  /// Check AI service status
  onCheckAiServiceStatusApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final url =
          Uri.parse(ApiConstant.BASE_URL + ApiConstant.aiConciergeStatus);
      log("AI Status URL :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
      };

      final response = await http.get(url, headers: headers);

      log("AI Status Status Code :: ${response.statusCode}");
      log("AI Status Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        return jsonResponse;
      }
    } catch (e) {
      log("AI Status Error :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  /// Clear selected image
  clearImage() {
    image = null;
    selectImageFile = null;
    update();
  }

  /// Reset analysis results
  resetAnalysis() {
    beautyAnalysis = null;
    recommendations = null;
    aiConciergeModel = null;
    update();
  }
}
