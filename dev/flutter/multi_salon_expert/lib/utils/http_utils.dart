import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:http/http.dart' as http;

class HttpUtils {
  static Future<http.Response> get(
    Uri url, {
    Map<String, String>? headers,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      final client = http.Client();
      try {
        return await client.get(url, headers: headers).timeout(timeout);
      } finally {
        client.close();
      }
    } on HandshakeException catch (e) {
      log("HandshakeException in GET request: $e");
      return await _handleSslException(
          () => http.get(url, headers: headers), timeout);
    } catch (e) {
      log("Error in GET request: $e");
      rethrow;
    }
  }

  static Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      final client = http.Client();
      try {
        return await client
            .post(url, headers: headers, body: body)
            .timeout(timeout);
      } finally {
        client.close();
      }
    } on HandshakeException catch (e) {
      log("HandshakeException in POST request: $e");
      return await _handleSslException(
          () => http.post(url, headers: headers, body: body), timeout);
    } catch (e) {
      log("Error in POST request: $e");
      rethrow;
    }
  }

  static Future<http.Response> patch(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      final client = http.Client();
      try {
        return await client
            .patch(url, headers: headers, body: body)
            .timeout(timeout);
      } finally {
        client.close();
      }
    } on HandshakeException catch (e) {
      log("HandshakeException in PATCH request: $e");
      return await _handleSslException(
          () => http.patch(url, headers: headers, body: body), timeout);
    } catch (e) {
      log("Error in PATCH request: $e");
      rethrow;
    }
  }

  static Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      final client = http.Client();
      try {
        return await client
            .put(url, headers: headers, body: body)
            .timeout(timeout);
      } finally {
        client.close();
      }
    } on HandshakeException catch (e) {
      log("HandshakeException in PUT request: $e");
      return await _handleSslException(
          () => http.put(url, headers: headers, body: body), timeout);
    } catch (e) {
      log("Error in PUT request: $e");
      rethrow;
    }
  }

  static Future<http.Response> _handleSslException(
    Future<http.Response> Function() requestFunction,
    Duration timeout,
  ) async {
    try {
      // Create HttpClient with SSL certificate handling
      final client = HttpClient()
        ..badCertificateCallback =
            (X509Certificate cert, String host, int port) {
          log("Accepting certificate for $host:$port");
          return true; // Accept all certificates
        };

      // Execute the original request function with SSL handling
      return await requestFunction().timeout(timeout);
    } catch (e) {
      log("SSL exception handling failed: $e");
      rethrow;
    }
  }
}
