import 'package:get/get.dart';

/// Displays product category names in French when the app locale is FR.
/// API categories are often stored in English in the admin panel.
class ProductCategoryLocalization {
  ProductCategoryLocalization._();

  static const Map<String, String> _frByNormalizedKey = {
    'hair': 'Cheveux',
    'hair care': 'Soins capillaires',
    'haircare': 'Soins capillaires',
    'hair styling': 'Coiffage',
    'hair style': 'Coiffage',
    'hair styling products': 'Produits de coiffage',
    'hair treatment': 'Soins capillaires',
    'hair treatments': 'Soins capillaires',
    'hair oil': 'Huiles capillaires',
    'hair oils': 'Huiles capillaires',
    'hair serum': 'Sérums capillaires',
    'hair mask': 'Masques capillaires',
    'shampoo': 'Shampooings',
    'shampoos': 'Shampooings',
    'conditioner': 'Après-shampooings',
    'conditioners': 'Après-shampooings',
    'skin': 'Peau',
    'skin care': 'Soins de la peau',
    'skincare': 'Soins de la peau',
    'face care': 'Soins du visage',
    'face': 'Visage',
    'body care': 'Soins du corps',
    'body': 'Corps',
    'makeup': 'Maquillage',
    'make up': 'Maquillage',
    'cosmetics': 'Cosmétiques',
    'cosmetic': 'Cosmétiques',
    'beauty': 'Beauté',
    'nail': 'Ongles',
    'nails': 'Ongles',
    'nail care': 'Soins des ongles',
    'manicure': 'Manucure',
    'pedicure': 'Pédicure',
    'fragrance': 'Parfums',
    'fragrances': 'Parfums',
    'perfume': 'Parfums',
    'perfumes': 'Parfums',
    'beard': 'Barbe',
    'beard care': 'Soins de barbe',
    'men': 'Homme',
    'men care': 'Soins homme',
    'women': 'Femme',
    'accessories': 'Accessoires',
    'tools': 'Outils & accessoires',
    'styling tools': 'Outils de coiffage',
    'brush': 'Brosses',
    'brushes': 'Brosses',
    'comb': 'Peignes',
    'combs': 'Peignes',
    'oil': 'Huiles',
    'oils': 'Huiles',
    'serum': 'Sérums',
    'serums': 'Sérums',
    'cream': 'Crèmes',
    'creams': 'Crèmes',
    'lotion': 'Laits',
    'lotions': 'Laits',
    'mask': 'Masques',
    'masks': 'Masques',
    'treatment': 'Soins',
    'treatments': 'Soins',
    'styling': 'Coiffage',
    'styling products': 'Produits de coiffage',
    'new arrival': 'Nouveautés',
    'new arrivals': 'Nouveautés',
    'new collection': 'Nouveautés',
    'new products': 'Nouveautés',
    'best seller': 'Meilleures ventes',
    'best sellers': 'Meilleures ventes',
    'bestseller': 'Meilleures ventes',
    'bestsellers': 'Meilleures ventes',
    'organic': 'Bio',
    'natural': 'Naturel',
    'kids': 'Enfants',
    'baby': 'Bébé',
    'sun care': 'Solaire',
    'suncare': 'Solaire',
    'wellness': 'Bien-être',
    'other': 'Autres',
    'others': 'Autres',
    'general': 'Général',
  };

  static String displayName(String? rawName) {
    final name = rawName?.trim() ?? '';
    if (name.isEmpty) return '';

    final locale = Get.locale?.languageCode ?? 'en';
    if (locale != 'fr') return name;

    final normalized = _normalize(name);
    final direct = _frByNormalizedKey[normalized];
    if (direct != null) return direct;

    for (final entry in _frByNormalizedKey.entries) {
      if (normalized.contains(entry.key) || entry.key.contains(normalized)) {
        return entry.value;
      }
    }

    return name;
  }

  static String _normalize(String value) {
    return value
        .toLowerCase()
        .replaceAll(RegExp(r'[àáâãäå]'), 'a')
        .replaceAll(RegExp(r'[èéêë]'), 'e')
        .replaceAll(RegExp(r'[ìíîï]'), 'i')
        .replaceAll(RegExp(r'[òóôõö]'), 'o')
        .replaceAll(RegExp(r'[ùúûü]'), 'u')
        .replaceAll(RegExp(r'[ç]'), 'c')
        .replaceAll(RegExp(r'[^a-z0-9\s]'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }
}
