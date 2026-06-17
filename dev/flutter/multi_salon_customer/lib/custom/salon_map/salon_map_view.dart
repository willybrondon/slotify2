import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import 'package:salon_2/custom/salon_map/salon_map_marker_data.dart';
import 'package:salon_2/ui/home_screen/model/get_all_salon_model.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

/// Carte salons — tuiles OpenStreetMap (comme Leaflet sur skedisy.com).
class SalonMapView extends StatefulWidget {
  const SalonMapView({
    super.key,
    required this.markers,
    required this.onSalonTap,
    this.userLatitude,
    this.userLongitude,
  });

  final List<SalonMapMarkerData> markers;
  final void Function(SalonMapMarkerData marker) onSalonTap;
  final double? userLatitude;
  final double? userLongitude;

  static const idfCenter = LatLng(48.8566, 2.3522);

  @override
  State<SalonMapView> createState() => _SalonMapViewState();
}

class _SalonMapViewState extends State<SalonMapView> {
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fitMarkers());
  }

  @override
  void didUpdateWidget(covariant SalonMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.markers != widget.markers) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _fitMarkers());
    }
  }

  void _fitMarkers() {
    final points = widget.markers
        .map((m) => LatLng(m.latitude, m.longitude))
        .toList();
    if (widget.userLatitude != null && widget.userLongitude != null) {
      points.add(LatLng(widget.userLatitude!, widget.userLongitude!));
    }
    if (points.isEmpty) {
      _mapController.move(SalonMapView.idfCenter, 11);
      return;
    }
    if (points.length == 1) {
      _mapController.move(points.first, 13);
      return;
    }
    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: LatLngBounds.fromPoints(points),
        padding: const EdgeInsets.all(48),
      ),
    );
  }

  static String _salonInitials(String? name) {
    final parts = (name ?? '')
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) {
      final word = parts.first;
      return (word.length >= 2 ? word.substring(0, 2) : word).toUpperCase();
    }
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  Widget _initialsThumb(String initials, {double size = 72}) {
    return Container(
      width: size,
      height: size,
      color: AppColors.primaryAppColor,
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          fontFamily: AppFontFamily.sfProDisplayBold,
          fontSize: size * 0.28,
          color: AppColors.whiteColor,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _salonThumb(Datum salon, {double size = 72}) {
    final imageUrl = (salon.mainImage ?? '').trim();
    final initials = _salonInitials(salon.name);

    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: size,
        height: size,
        child: imageUrl.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                width: size,
                height: size,
                errorWidget: (_, __, ___) => _initialsThumb(initials, size: size),
                placeholder: (_, __) => ColoredBox(
                  color: AppColors.grey.withOpacity(0.15),
                  child: const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                ),
              )
            : _initialsThumb(initials, size: size),
      ),
    );
  }

  void _showSalonSheet(SalonMapMarkerData marker) {
    final salon = marker.salon;
    final addressParts = <String>[
      if ((salon.addressDetails?.addressLine1 ?? '').trim().isNotEmpty)
        salon.addressDetails!.addressLine1!.trim(),
      if ((salon.addressDetails?.city ?? '').trim().isNotEmpty)
        salon.addressDetails!.city!.trim(),
    ];
    final address = addressParts.join(', ');
    final hasRating = (salon.review ?? 0) > 0;

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.whiteColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _salonThumb(salon),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            marker.name,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              fontSize: 17,
                              color: AppColors.blackColor,
                            ),
                          ),
                          if (address.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              address,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayRegular,
                                fontSize: 13,
                                color: AppColors.grey,
                                height: 1.35,
                              ),
                            ),
                          ],
                          if (hasRating) ...[
                            const SizedBox(height: 8),
                            Text(
                              '★ ${salon.review!.toStringAsFixed(1)} (${salon.reviewCount ?? 0})',
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 13,
                                color: AppColors.iconAccent,
                              ),
                            ),
                          ],
                          if (salon.distance != null) ...[
                            const SizedBox(height: 6),
                            Text(
                              '${salon.distance!.toStringAsFixed(1)} ${'txtKMs'.tr}',
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 12,
                                color: AppColors.primaryAppColor,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      widget.onSalonTap(marker);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryAppColor,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'txtViewSalon'.tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        color: AppColors.whiteColor,
                      ),
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

  @override
  Widget build(BuildContext context) {
    if (widget.markers.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'txtNoSalonMapCoords'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayRegular,
              fontSize: 15,
              color: AppColors.grey,
            ),
          ),
        ),
      );
    }

    final mapMarkers = widget.markers.map((m) {
      return Marker(
        point: LatLng(m.latitude, m.longitude),
        width: 44,
        height: 44,
        child: GestureDetector(
          onTap: () => _showSalonSheet(m),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.primaryAppColor,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.whiteColor, width: 2),
              boxShadow: [
                BoxShadow(
                  color: AppColors.blackColor.withOpacity(0.2),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(
              Icons.storefront,
              color: Colors.white,
              size: 22,
            ),
          ),
        ),
      );
    }).toList();

    if (widget.userLatitude != null && widget.userLongitude != null) {
      mapMarkers.add(
        Marker(
          point: LatLng(widget.userLatitude!, widget.userLongitude!),
          width: 36,
          height: 36,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.whiteColor, width: 2),
            ),
            child: const Icon(Icons.person_pin_circle, color: Colors.white, size: 20),
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: FlutterMap(
        mapController: _mapController,
        options: MapOptions(
          initialCenter: SalonMapView.idfCenter,
          initialZoom: 11,
          interactionOptions: const InteractionOptions(
            flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
          ),
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.skedisy.customer',
          ),
          MarkerLayer(markers: mapMarkers),
        ],
      ),
    );
  }
}
