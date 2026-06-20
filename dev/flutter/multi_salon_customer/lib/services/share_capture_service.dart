import 'dart:async';
import 'dart:developer';

import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:salon_2/main.dart' as app;
import 'package:salon_2/routes/app_routes.dart';

/// Handles images, videos and links shared from Instagram, TikTok, Facebook, Snapchat, etc.
class ShareCaptureService {
  static StreamSubscription<List<SharedMediaFile>>? _mediaSub;
  static bool _initialized = false;
  static String? _lastHandledKey;

  static void init() {
    if (_initialized) return;
    _initialized = true;

    _mediaSub = ReceiveSharingIntent.instance
        .getMediaStream()
        .listen(_onMedia, onError: (e) {
      log('ShareCapture media stream error: $e');
    });

    _pollInitialMedia();
  }

  static void _pollInitialMedia() {
    for (final delayMs in [0, 400, 1000, 2000]) {
      Future.delayed(Duration(milliseconds: delayMs), () async {
        try {
          final files = await ReceiveSharingIntent.instance.getInitialMedia();
          if (files.isNotEmpty) {
            _onMedia(files);
          }
        } catch (e) {
          log('ShareCapture initial media error: $e');
        }
      });
    }
  }

  static void dispose() {
    _mediaSub?.cancel();
    _initialized = false;
    _lastHandledKey = null;
  }

  static bool _isVideoPath(String path) {
    final lower = path.toLowerCase();
    return lower.endsWith('.mp4') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.3gp') ||
        lower.endsWith('.m4v') ||
        lower.contains('.mp4?') ||
        lower.contains('.mov?');
  }

  static void _onMedia(List<SharedMediaFile> files) {
    if (files.isEmpty) return;

    final dedupeKey = '${files.first.type}:${files.first.path}';
    if (_lastHandledKey == dedupeKey) return;
    _lastHandledKey = dedupeKey;

    final file = files.first;

    if (file.type == SharedMediaType.image) {
      final path = file.path;
      if (path.isEmpty) return;
      log('ShareCapture: image received → $path');
      _openCapture(
        sharedImagePath: path,
        fromShare: true,
        autoAnalyze: true,
      );
    } else if (file.type == SharedMediaType.video ||
        (file.type == SharedMediaType.file && _isVideoPath(file.path))) {
      final path = file.path;
      if (path.isEmpty) return;
      log('ShareCapture: video received → $path');
      _openCapture(
        sharedVideoPath: path,
        fromShare: true,
        autoAnalyze: true,
      );
    } else if (file.type == SharedMediaType.text ||
        file.type == SharedMediaType.url) {
      final link = file.path.trim();
      if (!_looksLikeUrl(link)) {
        log('ShareCapture: ignored non-URL text share');
        return;
      }
      log('ShareCapture: link received → $link');
      _openCapture(
        sharedLink: link,
        fromShare: true,
        autoAnalyze: false,
      );
    } else {
      log('ShareCapture: ignored share type ${file.type}');
      return;
    }

    ReceiveSharingIntent.instance.reset();
  }

  static bool _looksLikeUrl(String value) {
    final lower = value.toLowerCase();
    return lower.startsWith('http://') || lower.startsWith('https://');
  }

  static void openFromDeepLink({String? url}) {
    _navigate(null, null, url, false, false);
  }

  static void _openCapture({
    String? sharedImagePath,
    String? sharedVideoPath,
    String? sharedLink,
    required bool fromShare,
    required bool autoAnalyze,
  }) {
    app.markCaptureNavigated();
    _navigateWhenReady(
      sharedImagePath,
      sharedVideoPath,
      sharedLink,
      fromShare,
      autoAnalyze,
    );
  }

  static void _navigateWhenReady(
    String? sharedImagePath,
    String? sharedVideoPath,
    String? sharedLink,
    bool fromShare,
    bool autoAnalyze,
  ) {
    var attempts = 0;

    void tryNavigate() {
      attempts++;
      final hasContext = Get.key.currentContext != null;
      if (hasContext || attempts >= 40) {
        _navigate(
          sharedImagePath,
          sharedVideoPath,
          sharedLink,
          fromShare,
          autoAnalyze,
        );
        return;
      }
      SchedulerBinding.instance.addPostFrameCallback((_) => tryNavigate());
    }

    SchedulerBinding.instance.addPostFrameCallback((_) => tryNavigate());
  }

  static void _navigate(
    String? sharedImagePath,
    String? sharedVideoPath,
    String? sharedLink,
    bool fromShare,
    bool autoAnalyze,
  ) {
    Get.toNamed(
      AppRoutes.aiConcierge,
      arguments: <String, dynamic>{
        'fromShare': fromShare,
        'autoAnalyze': autoAnalyze,
        'sharedImagePath': sharedImagePath,
        'sharedVideoPath': sharedVideoPath,
        'sharedLink': sharedLink,
        'captureMode': true,
      },
    );
  }
}
