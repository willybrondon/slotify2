import 'package:salon_2/ui/home_screen/model/get_all_salon_model.dart';

/// Salon position for map markers (OpenStreetMap — même logique que le site).
class SalonMapMarkerData {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final Datum salon;

  const SalonMapMarkerData({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.salon,
  });
}

List<SalonMapMarkerData> salonMarkersFromData(List<Datum>? salons) {
  if (salons == null || salons.isEmpty) return [];
  final markers = <SalonMapMarkerData>[];
  for (final salon in salons) {
    final lat = double.tryParse(salon.locationCoordinates?.latitude ?? '');
    final lng = double.tryParse(salon.locationCoordinates?.longitude ?? '');
    if (lat == null || lng == null) continue;
    if (salon.id == null || salon.id!.isEmpty) continue;
    markers.add(
      SalonMapMarkerData(
        id: salon.id!,
        name: salon.name ?? '',
        latitude: lat,
        longitude: lng,
        salon: salon,
      ),
    );
  }
  return markers;
}
