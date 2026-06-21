import 'dart:async';
import 'dart:developer';

import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:salon_2/main.dart' as app;
import 'package:salon_2/routes/app_routes.dart';

/// Handles images, videos and links shared from Photos, screenshots, social apps, etc.
class ShareCaptureService {
  static StreamSubscription<List<SharedMediaFile>>? _mediaSub;
  static bool _initialized = false;
  static String? _lastHandledKey;
  static _PendingShare? _pendingShare;

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

  static void onAppResumed() {
    if (!_initialized) return;
    _pollInitialMedia();
    _flushPendingShare();
  }

  static void _pollInitialMedia() {
    for (final delayMs in [0, 300, 800, 1500, 2500, 4000, 6000]) {
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
    _pendingShare = null;
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
      _queueCapture(sharedImagePath: path, fromShare: true, autoAnalyze: true);
    } else if (file.type == SharedMediaType.video ||
        (file.type == SharedMediaType.file && _isVideoPath(file.path))) {
      final path = file.path;
      if (path.isEmpty) return;
      log('ShareCapture: video received → $path');
      _queueCapture(sharedVideoPath: path, fromShare: true, autoAnalyze: true);
    } else if (file.type == SharedMediaType.text ||
        file.type == SharedMediaType.url) {
      final link = file.path.trim();
      if (!_looksLikeUrl(link)) {
        log('ShareCapture: ignored non-URL text share');
        return;
      }
      log('ShareCapture: link received → $link');
      _queueCapture(sharedLink: link, fromShare: true, autoAnalyze: false);
    } else if (file.type == SharedMediaType.file && !_isVideoPath(file.path)) {
      final path = file.path;
      if (path.isEmpty) return;
      log('ShareCapture: file treated as image → $path');
      _queueCapture(sharedImagePath: path, fromShare: true, autoAnalyze: true);
    } else {
      log('ShareCapture: ignored share type ${file.type}');
      return;
    }
  }

  static bool _looksLikeUrl(String value) {
    final lower = value.toLowerCase();
    return lower.startsWith('http://') || lower.startsWith('https://');
  }

  static void openFromDeepLink({String? url}) {
    _navigate(null, null, url, false, false);
  }

  static void _queueCapture({
    String? sharedImagePath,
    String? sharedVideoPath,
    String? sharedLink,
    required bool fromShare,
    required bool autoAnalyze,
  }) {
    _pendingShare = _PendingShare(
      sharedImagePath: sharedImagePath,
      sharedVideoPath: sharedVideoPath,
      sharedLink: sharedLink,
      fromShare: fromShare,
      autoAnalyze: autoAnalyze,
    );
    app.markCaptureNavigated();
    _flushPendingShare();
  }

  static void _flushPendingShare() {
    final pending = _pendingShare;
    if (pending == null) return;

    _navigateWhenReady(
      pending.sharedImagePath,
      pending.sharedVideoPath,
      pending.sharedLink,
      pending.fromShare,
      pending.autoAnalyze,
      onOpened: () {
        _pendingShare = null;
        // Delay reset so late getInitialMedia polls still see shared data if needed.
        Future.delayed(const Duration(seconds: 3), () {
          ReceiveSharingIntent.instance.reset();
        });
      },
    );
  }

  static void _navigateWhenReady(
    String? sharedImagePath,
    String? sharedVideoPath,
    String? sharedLink,
    bool fromShare,
    bool autoAnalyze, {
    VoidCallback? onOpened,
  }) {
    var attempts = 0;

    void tryNavigate() {
      attempts++;
      final hasContext = Get.key.currentContext != null;
      if (hasContext || attempts >= 60) {
        _navigate(
          sharedImagePath,
          sharedVideoPath,
          sharedLink,
          fromShare,
          autoAnalyze,
        );
        onOpened?.call();
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
    final args = <String, dynamic>{
      'fromShare': fromShare,
      'autoAnalyze': autoAnalyze,
      'sharedImagePath': sharedImagePath,
      'sharedVideoPath': sharedVideoPath,
      'sharedLink': sharedLink,
      'captureMode': true,
    };

    if (fromShare) {
      Get.offAllNamed(AppRoutes.aiConcierge, arguments: args);
    } else {
      Get.toNamed(AppRoutes.aiConcierge, arguments: args);
    }
  }
}

class _PendingShare {
  _PendingShare({
    this.sharedImagePath,
    this.sharedVideoPath,
    this.sharedLink,
    required this.fromShare,
    required this.autoAnalyze,
  });

  final String? sharedImagePath;
  final String? sharedVideoPath;
  final String? sharedLink;
  final bool fromShare;
  final bool autoAnalyze;
}
