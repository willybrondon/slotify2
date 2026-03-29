"""
Skedisy Afro/Black Salon Scraper for Île-de-France
Focused scraping to find 1000 black and afro salons
Uses Google Places API with targeted keywords and locations
"""

import requests
import json
import time
import csv
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import hashlib
import re
import math

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "AIzaSyBRPBAMyYhXs12DKij8ew7c8NowhrGzjNQ")

# Target volume & "not too popular" salons (lower Google review counts first)
TARGET_SALON_COUNT = 1000
# Start by keeping salons with at most this many Google ratings; relax if we cannot reach TARGET_SALON_COUNT
INITIAL_MAX_USER_RATINGS_TOTAL = 80
MAX_RELAXED_USER_RATINGS_TOTAL = 400

# Optional: copy scraping_services_config.example.json to scraping_services_config.json and set MongoDB ObjectIds
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICES_CONFIG_PATH = os.path.join(SCRIPT_DIR, "scraping_services_config.json")


def _print_google_places_api_error(result: Optional[Dict], where: str = "") -> None:
    """Log status + error_message from Legacy Places JSON; hints for REQUEST_DENIED."""
    if not result:
        return
    status = result.get("status") or ""
    if status == "OK":
        return
    err = (result.get("error_message") or "").strip()
    loc = f" ({where})" if where else ""
    print(f"      ⚠️  Google Places API{loc}: {status}")
    if err:
        print(f"      📋 {err}")
    if status == "REQUEST_DENIED":
        print("      💡 Fix: (1) Enable **Places API** (Maps Platform → Places API, legacy endpoint maps.googleapis.com)")
        print("      💡 (2) Turn on **billing** for the GCP project (required for Places).")
        print("      💡 (3) API key restrictions: for a local script use **None** or **IP**, not HTTP referrer / mobile-only.")
        print("      💡 Console: https://console.cloud.google.com/google/maps-apis/api-list")


def load_services_config() -> Dict:
    """Load default Service ObjectIds from backend (women/men/mixed pools)."""
    if not os.path.isfile(SERVICES_CONFIG_PATH):
        return {"women": [], "men": [], "mixed": []}
    try:
        with open(SERVICES_CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {
            "women": data.get("women") or [],
            "men": data.get("men") or [],
            "mixed": data.get("mixed") or [],
        }
    except Exception:
        return {"women": [], "men": [], "mixed": []}


def _stable_hash_int(seed: str) -> int:
    return int(hashlib.sha256(seed.encode("utf-8")).hexdigest()[:12], 16)


def _word_in_name(name: str, *words: str) -> bool:
    t = (name or "").lower()
    for w in words:
        if re.search(rf"\b{re.escape(w.lower())}\b", t, re.I):
            return True
    return False


def classify_salon_gender_target(name: str, types: Optional[List[str]] = None) -> str:
    """
    Return 'men', 'women', or 'mixed' for service & expert defaults.
    Uses Google types + French/English keywords in the business name.
    """
    types = types or []
    types_l = [x.lower() for x in types]

    if "barber_shop" in types_l and "beauty_salon" not in types_l:
        return "men"

    if _word_in_name(name, "homme", "hommes", "barber", "barbier", "barbershop", "masculin", "garçon", "garcon"):
        if not _word_in_name(name, "femme", "femmes", "féminin", "feminin", "women", "ladies"):
            return "men"

    if _word_in_name(name, "femme", "femmes", "féminin", "feminin", "women", "woman", "ladies", "dames"):
        return "women"

    return "mixed"


def pick_default_services(services_config: Dict, gender_target: str) -> List[Dict]:
    """Pick up to 2 default service entries {id, price} from config for the salon."""
    pool_key = gender_target if gender_target in ("men", "women") else "mixed"
    pool = services_config.get(pool_key) or []
    if not pool:
        pool = services_config.get("mixed") or services_config.get("women") or services_config.get("men") or []
    out = []
    for item in pool[:2]:
        if isinstance(item, dict) and item.get("id"):
            out.append({"id": str(item["id"]), "price": item.get("price", 0)})
    return out


def build_experts_for_salon(
    place_id: str,
    gender_target: str,
    service_ids_hex: List[str],
) -> List[Dict]:
    """1–2 experts per salon; deterministic names from place_id; serviceId aligned to salon services."""
    n = 1 + (_stable_hash_int(place_id + ":expert_count") % 2)
    first_m = [
        "Amadou", "Ibrahim", "Kofi", "Mamadou", "Youssef", "Jean-Baptiste", "Hakim", "Samuel",
    ]
    last_m = [
        "Diallo", "Koné", "Traoré", "N'Diaye", "Benali", "Mensah", "Ouedraogo", "Sow",
    ]
    first_f = [
        "Aïcha", "Fatou", "Aminata", "Mariam", "Sophie", "Nadia", "Élodie", "Christelle",
    ]
    last_f = [
        "Diop", "Sarr", "Fall", "Camara", "Koné", "Touré", "Bâ", "Sylla",
    ]
    first_x = first_m + first_f
    last_x = last_m + last_f

    experts = []
    for i in range(n):
        seed = f"{place_id}:ex:{i}"
        h = _stable_hash_int(seed)
        if gender_target == "men":
            fn = first_m[h % len(first_m)]
            ln = last_m[(h // 7) % len(last_m)]
            g = "Male"
        elif gender_target == "women":
            fn = first_f[h % len(first_f)]
            ln = last_f[(h // 7) % len(last_f)]
            g = "Female"
        else:
            fn = first_x[h % len(first_x)]
            ln = last_x[(h // 11) % len(last_x)]
            g = "Female" if h % 2 == 0 else "Male"

        sid = service_ids_hex[i % len(service_ids_hex)] if service_ids_hex else ""
        experts.append({
            "fname": fn,
            "lname": ln,
            "gender": g,
            "serviceId": [sid] if sid else [],
        })
    return experts


def select_salons_by_popularity(
    salons: List[Dict],
    target: int,
    initial_max_reviews: int,
    max_relaxed_reviews: int,
) -> Tuple[List[Dict], int]:
    """
    Prefer salons that are 'not too popular' (fewer Google ratings).
    Relax the review ceiling until we have enough rows or cap out.
    Returns (selected_salons, effective_max_reviews_used).
    """
    max_r = initial_max_reviews
    while max_r <= max_relaxed_reviews:
        filtered = []
        for s in salons:
            total = s.get("user_ratings_total")
            if total is None:
                total = 0
            if total <= max_r:
                filtered.append(s)
        ranked = sorted(
            filtered,
            key=lambda x: (x.get("user_ratings_total") is None, x.get("user_ratings_total") or 0),
        )
        if len(ranked) >= target:
            return ranked[:target], max_r
        max_r += 40

    ranked = sorted(
        salons,
        key=lambda x: (x.get("user_ratings_total") is None, x.get("user_ratings_total") or 0),
    )
    return ranked[:target], max_relaxed_reviews

# Île-de-France departments with multiple search points for better coverage
ILE_DE_FRANCE_DEPARTMENTS = {
    "75": {
        "name": "Paris",
        "search_points": [
            {"lat": 48.8566, "lng": 2.3522, "name": "Paris Centre"},
            {"lat": 48.9026, "lng": 2.3656, "name": "18e arrondissement"},
            {"lat": 48.8974, "lng": 2.3833, "name": "19e arrondissement"},
            {"lat": 48.8200, "lng": 2.3600, "name": "13e arrondissement"},
            {"lat": 48.8350, "lng": 2.3650, "name": "14e arrondissement"},
            {"lat": 48.8500, "lng": 2.3000, "name": "15e arrondissement"},
            {"lat": 48.8400, "lng": 2.3200, "name": "16e arrondissement"},
            {"lat": 48.8800, "lng": 2.3300, "name": "17e arrondissement"},
            {"lat": 48.9000, "lng": 2.3400, "name": "10e arrondissement"},
            {"lat": 48.8700, "lng": 2.3700, "name": "20e arrondissement"},
        ]
    },
    "77": {
        "name": "Seine-et-Marne",
        "search_points": [
            {"lat": 48.6289, "lng": 2.7389, "name": "Melun"},
            {"lat": 48.9544, "lng": 2.8881, "name": "Meaux"},
            {"lat": 48.4028, "lng": 2.7000, "name": "Fontainebleau"},
            {"lat": 48.8500, "lng": 2.6000, "name": "Chelles"},
        ]
    },
    "78": {
        "name": "Yvelines",
        "search_points": [
            {"lat": 48.8014, "lng": 2.1301, "name": "Versailles"},
            {"lat": 48.8947, "lng": 2.2386, "name": "Sartrouville"},
            {"lat": 48.7756, "lng": 2.0403, "name": "Mantes-la-Jolie"},
            {"lat": 48.7500, "lng": 2.2000, "name": "Rambouillet"},
        ]
    },
    "91": {
        "name": "Essonne",
        "search_points": [
            {"lat": 48.5293, "lng": 2.2386, "name": "Évry"},
            {"lat": 48.6333, "lng": 2.4500, "name": "Corbeil-Essonnes"},
            {"lat": 48.7000, "lng": 2.2000, "name": "Palaiseau"},
            {"lat": 48.6000, "lng": 2.3000, "name": "Massy"},
        ]
    },
    "92": {
        "name": "Hauts-de-Seine",
        "search_points": [
            {"lat": 48.8444, "lng": 2.2067, "name": "Nanterre"},
            {"lat": 48.9000, "lng": 2.2500, "name": "Colombes"},
            {"lat": 48.7833, "lng": 2.2333, "name": "Boulogne-Billancourt"},
            {"lat": 48.8500, "lng": 2.2000, "name": "Asnières-sur-Seine"},
            {"lat": 48.9200, "lng": 2.2800, "name": "Gennevilliers"},
        ]
    },
    "93": {
        "name": "Seine-Saint-Denis",
        "search_points": [
            {"lat": 48.9352, "lng": 2.3530, "name": "Bobigny"},
            {"lat": 48.9000, "lng": 2.4000, "name": "Saint-Denis"},
            {"lat": 48.9500, "lng": 2.3500, "name": "Aubervilliers"},
            {"lat": 48.9100, "lng": 2.4200, "name": "Montreuil"},
            {"lat": 48.8700, "lng": 2.4500, "name": "Noisy-le-Grand"},
            {"lat": 48.9200, "lng": 2.3800, "name": "Pantin"},
            {"lat": 48.8800, "lng": 2.4000, "name": "Villepinte"},
        ]
    },
    "94": {
        "name": "Val-de-Marne",
        "search_points": [
            {"lat": 48.7872, "lng": 2.4033, "name": "Créteil"},
            {"lat": 48.8000, "lng": 2.5000, "name": "Nogent-sur-Marne"},
            {"lat": 48.7500, "lng": 2.4000, "name": "Vitry-sur-Seine"},
            {"lat": 48.7800, "lng": 2.4500, "name": "Champigny-sur-Marne"},
            {"lat": 48.8200, "lng": 2.4200, "name": "Fontenay-sous-Bois"},
        ]
    },
    "95": {
        "name": "Val-d'Oise",
        "search_points": [
            {"lat": 49.0928, "lng": 2.0400, "name": "Pontoise"},
            {"lat": 48.9500, "lng": 2.3000, "name": "Argenteuil"},
            {"lat": 49.0000, "lng": 2.1000, "name": "Cergy"},
            {"lat": 48.9800, "lng": 2.2000, "name": "Sarcelles"},
            {"lat": 49.0500, "lng": 2.1500, "name": "Garges-lès-Gonesse"},
        ]
    },
}

# Focused keywords for Afro/Black salons
AFRO_SALON_KEYWORDS = [
    # Primary keywords - most specific
    "coiffure afro",
    "coiffure africaine",
    "salon afro",
    "salon africain",
    "coiffeur afro",
    "coiffeuse afro",
    "coiffure cheveux crépus",
    "coiffure cheveux bouclés",
    "coiffure naturelle",
    "salon black",
    "coiffure black",
    "coiffeur black",
    "coiffeuse black",
    "barber shop afro",
    "barbier afro",
    "coiffure ethnique",
    "salon ethnique",
    "coiffure métisse",
    "coiffure mixte afro",
    "tissage",
    "coiffure tissage",
    "coiffure tresse",
    "coiffure tresse africaine",
    "coiffure braids",
    "coiffure locks",
    "coiffure dreadlocks",
    "coiffure rasta",
    "coiffure défrisage",
    "coiffure lissage",
    "coiffure afro homme",
    "coiffure afro femme",
    "salon de coiffure afro",
    "institut coiffure afro",
    "coiffure afro paris",
    "coiffure afro 93",
    "coiffure afro 94",
    "coiffure afro 75",
    "coiffure afro 92",
    "salon de beauté afro",
    "beauté afro",
    "coiffure cheveux afro",
    "coiffure cheveux noirs",
    "coiffure cheveux crépus paris",
    "coiffure cheveux bouclés paris",
    "coiffure afro banlieue",
    "coiffure afro seine-saint-denis",
    "coiffure afro val-de-marne",
    "coiffure afro hauts-de-seine",
    "coiffure afro val-d'oise",
    "coiffure afro essonne",
    "coiffure afro yvelines",
    "coiffure afro seine-et-marne",
    # Additional variations
    "coiffure pour cheveux crépus",
    "coiffure pour cheveux bouclés",
    "coiffure pour cheveux afro",
    "salon spécialisé cheveux crépus",
    "salon spécialisé cheveux afro",
    "coiffure spécialisée afro",
    "coiffure spécialisée africaine",
    "salon de coiffure spécialisé afro",
    "coiffure afro professionnel",
    "coiffure afro expert",
    "coiffure afro spécialiste",
    "coiffure afro maître",
    "coiffure afro artisanal",
    "coiffure afro traditionnel",
    "coiffure afro moderne",
    "salon afro parisien",
    "coiffure afro parisienne",
    "coiffure afro banlieue parisienne",
    "coiffure afro région parisienne",
    "coiffure afro île-de-france",
    "coiffure afro idf",
    # English variations (some salons use English)
    "afro hair salon",
    "african hair salon",
    "black hair salon",
    "afro barber shop",
    "african barber shop",
    "black barber shop",
    "afro hairstylist",
    "african hairstylist",
    "black hairstylist",
    "afro hair stylist",
    "african hair stylist",
    "black hair stylist",
    "afro hair salon paris",
    "african hair salon paris",
    "black hair salon paris",
    "afro hair salon france",
    "african hair salon france",
    "black hair salon france",
    # Service-specific keywords
    "tissage cheveux",
    "tissage cheveux afro",
    "tissage cheveux africain",
    "tresse cheveux",
    "tresse cheveux afro",
    "tresse cheveux africain",
    "braids cheveux",
    "braids cheveux afro",
    "locks cheveux",
    "dreadlocks cheveux",
    "défrisage cheveux",
    "défrisage cheveux afro",
    "lissage cheveux",
    "lissage cheveux afro",
    "coiffure cheveux crépus homme",
    "coiffure cheveux crépus femme",
    "coiffure cheveux bouclés homme",
    "coiffure cheveux bouclés femme",
    "coiffure cheveux afro homme",
    "coiffure cheveux afro femme",
    "coiffure cheveux noirs homme",
    "coiffure cheveux noirs femme",
    # Location-specific (areas with high afro population)
    "coiffure afro château rouge",
    "coiffure afro barbès",
    "coiffure afro gare du nord",
    "coiffure afro la goutte d'or",
    "coiffure afro belleville",
    "coiffure afro montreuil",
    "coiffure afro aubervilliers",
    "coiffure afro saint-denis",
    "coiffure afro créteil",
    "coiffure afro argenteuil",
    "coiffure afro sarcelles",
    "coiffure afro gennevilliers",
    "coiffure afro colombes",
    "coiffure afro nanterre",
    "coiffure afro asnières",
    "coiffure afro boulogne",
    "coiffure afro vitry",
    "coiffure afro champigny",
    "coiffure afro fontenay",
    "coiffure afro nogent",
    "coiffure afro villepinte",
    "coiffure afro noisy",
    "coiffure afro pantin",
    "coiffure afro bobigny",
    "coiffure afro garges",
    "coiffure afro cergy",
    "coiffure afro pontoise",
    "coiffure afro massy",
    "coiffure afro palaiseau",
    "coiffure afro évry",
    "coiffure afro corbeil",
    "coiffure afro melun",
    "coiffure afro meaux",
    "coiffure afro chelles",
    "coiffure afro versailles",
    "coiffure afro sartrouville",
    "coiffure afro mantes",
    "coiffure afro rambouillet",
]


class GooglePlacesScraper:
    """Scraper for Google Places API (Legacy - Free Tier) - Optimized for Afro salons"""
    
    BASE_URL = "https://maps.googleapis.com/maps/api/place"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        # Create images directory if it doesn't exist
        self.images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
        os.makedirs(self.images_dir, exist_ok=True)
        self.seen_place_ids = set()  # Track seen place IDs to avoid duplicates
    
    def _extract_email_from_website(self, website_url: str) -> Optional[str]:
        """Try to extract email address from a website URL"""
        if not website_url:
            return None
        
        try:
            # Add protocol if missing
            if not website_url.startswith(('http://', 'https://')):
                website_url = 'https://' + website_url
            
            # Try to fetch the website
            response = self.session.get(website_url, timeout=5, allow_redirects=True)
            if response.status_code == 200:
                # Look for email patterns in the HTML
                email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                emails = re.findall(email_pattern, response.text)
                
                # Filter out common non-contact emails
                filtered_emails = [
                    email for email in emails 
                    if not any(skip in email.lower() for skip in ['noreply', 'no-reply', 'donotreply', 'example', 'test'])
                ]
                
                if filtered_emails:
                    # Return the first valid email found
                    return filtered_emails[0]
        except Exception as e:
            # Silently fail - website might not be accessible
            pass
        
        return None
    
    def _download_and_save_image(self, photo_url: str, photo_ref: str = None) -> Optional[str]:
        """Download image from URL and save locally, return relative path"""
        try:
            # Generate unique filename
            if photo_ref:
                filename = f"{hashlib.md5(photo_ref.encode()).hexdigest()}.jpg"
            else:
                filename = f"{hashlib.md5(photo_url.encode()).hexdigest()}.jpg"
            
            filepath = os.path.join(self.images_dir, filename)
            
            # Check if image already exists
            if os.path.exists(filepath):
                return f"images/{filename}"
            
            # Download image
            response = self.session.get(photo_url, timeout=10)
            if response.status_code == 200:
                # Save image
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return f"images/{filename}"
            else:
                return None
        except Exception as e:
            return None
    
    def search_nearby(self, lat: float, lng: float, radius: int = 5000, 
                     keyword: str = "coiffure afro") -> Optional[Dict]:
        """Search for places near a location using Legacy Places API (Free)"""
        try:
            url = f"{self.BASE_URL}/nearbysearch/json"
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": keyword,
                "key": self.api_key,
                "language": "fr"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            status = result.get("status")
            if status != "OK":
                _print_google_places_api_error(result, "nearbysearch")
                return None
            
            return result
        except requests.exceptions.RequestException as e:
            return None

    def search_nearby_all_pages(
        self, lat: float, lng: float, radius: int = 5000, keyword: str = "coiffure afro"
    ) -> List[Dict]:
        """Nearby search with pagination (up to 3 pages / 60 results per keyword-location)."""
        all_results: List[Dict] = []
        page_token: Optional[str] = None
        for _ in range(3):
            url = f"{self.BASE_URL}/nearbysearch/json"
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": keyword,
                "key": self.api_key,
                "language": "fr",
            }
            if page_token:
                params["pagetoken"] = page_token
            try:
                response = self.session.get(url, params=params, timeout=15)
                response.raise_for_status()
                result = response.json()
            except requests.exceptions.RequestException:
                break

            status = result.get("status")
            if status != "OK":
                _print_google_places_api_error(result, "nearbysearch paginated")
                break

            batch = result.get("results", [])
            all_results.extend(batch)
            page_token = result.get("next_page_token")
            if not page_token:
                break
            time.sleep(2)

        return all_results
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed information about a place using Legacy Places API (Free)"""
        try:
            url = f"{self.BASE_URL}/details/json"
            params = {
                "place_id": place_id,
                "key": self.api_key,
                "language": "fr",
                "fields": "place_id,name,formatted_address,formatted_phone_number,website,geometry,photos,reviews,opening_hours,types,business_status,rating,user_ratings_total"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            if result.get("status") != "OK":
                return None
                
            return result
        except requests.exceptions.RequestException as e:
            return None
    
    def scrape_location(self, lat: float, lng: float, location_name: str, 
                       keywords: List[str], department_code: str) -> List[Dict]:
        """Scrape salons from a specific location with multiple keywords"""
        all_salons = []
        
        print(f"  📍 Searching in {location_name}...")
        
        for keyword in keywords:
            print(f"    🔍 Keyword: '{keyword}'", end=" ... ")
            results = self.search_nearby_all_pages(lat, lng, radius=5000, keyword=keyword)
            
            if not results:
                print("❌ No results")
                time.sleep(0.2)  # Rate limiting
                continue
            
            new_results = 0
            
            for result in results:
                place_id = result.get("place_id")
                if not place_id or place_id in self.seen_place_ids:
                    continue
                
                # Mark as seen
                self.seen_place_ids.add(place_id)
                
                # Get detailed information
                details = self.get_place_details(place_id)
                if details and details.get("status") == "OK":
                    detail_result = details.get("result", {})
                    if detail_result.get("business_status") == "CLOSED_PERMANENTLY":
                        continue
                    salon_data = self._format_google_data(detail_result, department_code)
                    if salon_data:
                        # Prefer listing signal for popularity when details omit it
                        if salon_data.get("user_ratings_total") in (None, 0) and result.get("user_ratings_total") is not None:
                            salon_data["user_ratings_total"] = result.get("user_ratings_total")
                        if salon_data.get("rating") is None and result.get("rating") is not None:
                            salon_data["rating"] = result.get("rating")
                        all_salons.append(salon_data)
                        new_results += 1
                
                time.sleep(0.2)  # Rate limiting for Google API
            
            print(f"✅ Found {new_results} new salons")
            time.sleep(0.3)  # Rate limiting between keywords
        
        return all_salons

    def scrape_department_centre(
        self,
        department_code: str,
        department_name: str,
        centre_lat: float,
        centre_lng: float,
        keywords: List[str],
        radius_m: int = 50000,
    ) -> List[Dict]:
        """
        Same flow as scrape_ile_de_france.py: one centre per department, large radius (default 50 km).
        Uses pagination + place details + afro-specific fields (rating, types, etc.).
        """
        all_salons: List[Dict] = []
        print(f"Scraping Google Places (centre + {radius_m}m) for {department_name} ({department_code})...")

        for keyword in keywords:
            print(f"  Searching for '{keyword}'...")
            results = self.search_nearby_all_pages(centre_lat, centre_lng, radius=radius_m, keyword=keyword)

            if not results:
                print(f"    ⚠️  No data returned for '{keyword}'")
                time.sleep(0.2)
                continue

            print(f"    ✅ Found {len(results)} raw results for '{keyword}'")
            new_results = 0

            for result in results:
                place_id = result.get("place_id")
                if not place_id or place_id in self.seen_place_ids:
                    continue

                self.seen_place_ids.add(place_id)

                details = self.get_place_details(place_id)
                if details and details.get("status") == "OK":
                    detail_result = details.get("result", {})
                    if detail_result.get("business_status") == "CLOSED_PERMANENTLY":
                        continue
                    salon_data = self._format_google_data(detail_result, department_code)
                    if salon_data:
                        if salon_data.get("user_ratings_total") in (None, 0) and result.get("user_ratings_total") is not None:
                            salon_data["user_ratings_total"] = result.get("user_ratings_total")
                        if salon_data.get("rating") is None and result.get("rating") is not None:
                            salon_data["rating"] = result.get("rating")
                        all_salons.append(salon_data)
                        new_results += 1

                time.sleep(0.2)

            print(f"    → {new_results} new salons after details for '{keyword}'")
            time.sleep(0.3)

        print(f"Found {len(all_salons)} salons from Google Places in {department_name} (centre search)")
        return all_salons
    
    def scrape_department(self, department_code: str, keywords: List[str]) -> List[Dict]:
        """Scrape salons from all search points in a department"""
        all_salons = []
        dept_info = ILE_DE_FRANCE_DEPARTMENTS[department_code]
        
        print(f"\n{'='*60}")
        print(f"🏛️  Processing {dept_info['name']} ({department_code})")
        print(f"{'='*60}")
        
        for search_point in dept_info["search_points"]:
            salons = self.scrape_location(
                search_point["lat"],
                search_point["lng"],
                search_point["name"],
                keywords,
                department_code
            )
            all_salons.extend(salons)
            print(f"    📊 Total so far in {dept_info['name']}: {len(all_salons)} salons")
            time.sleep(0.5)  # Rate limiting between locations
        
        print(f"\n✅ Found {len(all_salons)} unique salons in {dept_info['name']}")
        return all_salons
    
    def _format_google_data(self, data: Dict, department_code: str) -> Optional[Dict]:
        """Format Google Places API (Legacy) data to Skedisy format"""
        try:
            # Extract address (legacy API format)
            address_parts = data.get("formatted_address", "").split(",")
            address_line1 = address_parts[0].strip() if address_parts else ""
            city = address_parts[-2].strip() if len(address_parts) > 1 else ""
            
            # Extract coordinates (legacy API format)
            geometry = data.get("geometry", {})
            location = geometry.get("location", {})
            latitude = location.get("lat", "")
            longitude = location.get("lng", "")
            
            # Extract phone (legacy API format)
            phone = data.get("formatted_phone_number", "").replace(" ", "").replace(".", "").replace("-", "")
            
            # Extract photos (legacy API format)
            photos = data.get("photos", [])
            main_image = ""
            images = []
            if photos and self.api_key:
                # Download images and save locally
                for i, photo in enumerate(photos[:5]):  # Limit to 5 images
                    photo_ref = photo.get("photo_reference", "")
                    if photo_ref:
                        try:
                            # Download image using API key
                            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_ref}&key={self.api_key}"
                            saved_path = self._download_and_save_image(photo_url, photo_ref)
                            if saved_path:
                                if i == 0:
                                    main_image = saved_path
                                images.append(saved_path)
                                time.sleep(0.1)  # Rate limiting for image downloads
                        except Exception as e:
                            continue
            elif photos:
                # No API key - store photo references for later use
                photo_ref = photos[0].get("photo_reference", "")
                if photo_ref:
                    # Store reference that can be used later with API key
                    main_image = f"photo_reference:{photo_ref}"
                    images = [main_image]
            
            # Extract opening hours (legacy API format)
            opening_hours = data.get("opening_hours", {}).get("weekday_text", [])
            
            # Try to extract email from website, otherwise leave empty
            website = data.get("website", "")
            email = ""
            if website:
                email = self._extract_email_from_website(website)
            
            return {
                "source": "google_places",
                "source_id": data.get("place_id", ""),
                "name": data.get("name", "").strip(),
                "email": email,  # Empty if not found - salon will provide when claiming
                "mobile": phone,
                "addressDetails": {
                    "addressLine1": address_line1,
                    "city": city,
                    "state": "Île-de-France",
                    "country": "France"
                },
                "locationCoordinates": {
                    "latitude": str(latitude) if latitude else "",
                    "longitude": str(longitude) if longitude else ""
                },
                "about": f"Salon afro/black trouvé via Google Places",
                "mainImage": main_image,
                "image": images,
                "department": department_code,
                "website": data.get("website", ""),
                "opening_hours": opening_hours,
                "rating": data.get("rating"),
                "user_ratings_total": data.get("user_ratings_total"),
                "types": data.get("types") or [],
                "business_status": data.get("business_status"),
                "raw_data": data
            }
        except Exception as e:
            return None


class SkedisySalonFormatter:
    """Format scraped data for Skedisy platform"""
    
    @staticmethod
    def format_for_skedisy(salon_data: Dict, services_config: Dict) -> Dict:
        """Format salon data to match Skedisy salon model + experts (import script strips experts onto Expert collection)."""
        import secrets
        default_password = secrets.token_urlsafe(12)
        
        import random
        unique_id = random.randint(1000000, 9999999)

        gender_target = classify_salon_gender_target(
            salon_data.get("name", ""),
            salon_data.get("types"),
        )
        service_entries = pick_default_services(services_config, gender_target)
        service_ids_hex = [s["id"] for s in service_entries if s.get("id")]
        place_id = salon_data.get("source_id") or salon_data.get("name", "unknown")
        experts = build_experts_for_salon(place_id, gender_target, service_ids_hex)
        
        return {
            "name": salon_data.get("name", ""),
            "email": salon_data.get("email", ""),
            "mobile": salon_data.get("mobile", ""),
            "password": default_password,  # Will be changed when salon claims
            "addressDetails": salon_data.get("addressDetails", {}),
            "locationCoordinates": salon_data.get("locationCoordinates", {}),
            "about": salon_data.get("about", "Salon afro/black ajouté automatiquement. Informations à compléter."),
            "mainImage": salon_data.get("mainImage", ""),
            "image": salon_data.get("image", []),
            "uniqueId": unique_id,
            "platformFee": 10,  # Default 10% commission
            "isActive": False,  # Will be activated when salon claims
            "isDelete": False,
            "isClaimed": False,  # New field for claim status
            "claimToken": secrets.token_urlsafe(32),  # Token for claiming
            "source": salon_data.get("source", ""),
            "source_id": salon_data.get("source_id", ""),
            "salonTime": SkedisySalonFormatter._generate_default_hours(),
            "serviceIds": service_entries,
            "experts": experts,
            "createdAt": datetime.now().isoformat(),
            "metadata": {
                "scraped_at": datetime.now().isoformat(),
                "department": salon_data.get("department", ""),
                "website": salon_data.get("website", ""),
                "salon_type": "afro_black",
                "google_rating": salon_data.get("rating"),
                "user_ratings_total": salon_data.get("user_ratings_total"),
                "gender_target": gender_target,
            }
        }
    
    @staticmethod
    def _generate_default_hours():
        """Generate default salon hours"""
        default_time = {
            "openTime": "09:00 AM",
            "closedTime": "07:00 PM",
            "isActive": True,
            "breakStartTime": "01:00 PM",
            "breakEndTime": "02:00 PM",
            "time": 15,
            "isBreak": True
        }
        
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return [{**default_time, "day": day} for day in days]


def main():
    """Main scraping function - Focused on finding 1000 afro/black salons"""
    print("=" * 60)
    print("Skedisy Afro/Black Salon Scraper - Île-de-France")
    print("Target: 1000 salons")
    print("=" * 60)
    
    all_salons = []
    
    # Initialize scraper
    if not GOOGLE_PLACES_API_KEY:
        print("❌ Google Places API key not found! Please set GOOGLE_PLACES_API_KEY in .env file")
        return
    
    gp_scraper = GooglePlacesScraper(GOOGLE_PLACES_API_KEY)
    services_config = load_services_config()
    if not any(services_config.get(k) for k in ("women", "men", "mixed")):
        print(
            "⚠️  No scraping_services_config.json (or empty pools). "
            "Copy scraping_services_config.example.json → scraping_services_config.json with your Service ObjectIds."
        )
    print("✅ Google Places scraper initialized")
    print(f"📋 Using {len(AFRO_SALON_KEYWORDS)} focused keywords for afro/black salons")
    
    # Scrape each department
    for dept_code in ILE_DE_FRANCE_DEPARTMENTS.keys():
        salons = gp_scraper.scrape_department(dept_code, AFRO_SALON_KEYWORDS)
        all_salons.extend(salons)
        
        print(f"\n📊 Total salons found so far: {len(all_salons)}")
        
        # If we've reached enough raw candidates, stop early (popularity filter happens later)
        if len(all_salons) >= TARGET_SALON_COUNT * 5:
            print(f"\n🎯 Enough raw candidates for filtering ({len(all_salons)}). Stopping department loop early.")
            break
        
        # Rate limiting between departments
        time.sleep(1)
    
    # Remove duplicates (by place_id - already handled, but double-check by name + address)
    print(f"\n{'='*60}")
    print("Removing duplicates...")
    seen = set()
    unique_salons = []
    for salon in all_salons:
        key = (
            salon.get("name", "").lower().strip(),
            salon.get("addressDetails", {}).get("addressLine1", "").lower().strip(),
            salon.get("addressDetails", {}).get("city", "").lower().strip()
        )
        if key not in seen and key[0]:  # Ensure name is not empty
            seen.add(key)
            unique_salons.append(salon)
    
    print(f"Total salons found: {len(all_salons)}")
    print(f"Unique salons: {len(unique_salons)}")

    ranked, effective_max = select_salons_by_popularity(
        unique_salons,
        TARGET_SALON_COUNT,
        INITIAL_MAX_USER_RATINGS_TOTAL,
        MAX_RELAXED_USER_RATINGS_TOTAL,
    )
    print(
        f"\n📉 Popularity filter: prioritizing lower Google review counts "
        f"(effective max user_ratings_total: {effective_max})"
    )
    print(f"   → Selected {len(ranked)} salons for export (target {TARGET_SALON_COUNT})")

    if len(ranked) < TARGET_SALON_COUNT:
        print(f"\n⚠️  Only {len(ranked)} salons after filtering; target was {TARGET_SALON_COUNT}")
        print("💡 Consider: more search points, more keywords, or running again another day.")
    else:
        print(f"\n✅ Ready to export {len(ranked)} salons (capped at target).")
    
    # Format for Skedisy
    print("\nFormatting data for Skedisy...")
    formatter = SkedisySalonFormatter()
    skedisy_salons = [formatter.format_for_skedisy(salon, services_config) for salon in ranked]
    
    # Save to files
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Save as JSON
    json_file = os.path.join(script_dir, f"salons_afro_ile_de_france_{timestamp}.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(skedisy_salons, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(skedisy_salons)} salons to {json_file}")
    
    # Save as CSV for review
    csv_file = os.path.join(script_dir, f"salons_afro_ile_de_france_{timestamp}.csv")
    if skedisy_salons:
        fieldnames = ["name", "email", "mobile", "addressLine1", "city", "latitude", "longitude", "source", "isClaimed", "department"]
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for salon in skedisy_salons:
                writer.writerow({
                    "name": salon.get("name", ""),
                    "email": salon.get("email", ""),
                    "mobile": salon.get("mobile", ""),
                    "addressLine1": salon.get("addressDetails", {}).get("addressLine1", ""),
                    "city": salon.get("addressDetails", {}).get("city", ""),
                    "latitude": salon.get("locationCoordinates", {}).get("latitude", ""),
                    "longitude": salon.get("locationCoordinates", {}).get("longitude", ""),
                    "source": salon.get("source", ""),
                    "isClaimed": salon.get("isClaimed", False),
                    "department": salon.get("metadata", {}).get("department", "")
                })
        print(f"✅ Saved CSV to {csv_file}")
    
    print(f"\n{'='*60}")
    print("Scraping complete!")
    print(f"{'='*60}")
    print(f"\n📊 Summary:")
    print(f"   - Unique candidates: {len(unique_salons)}")
    print(f"   - Exported after popularity filter: {len(ranked)}")
    print(f"   - Target: {TARGET_SALON_COUNT} salons")
    print(f"   - Coverage: {'✅ Target reached!' if len(ranked) >= TARGET_SALON_COUNT else '⚠️  Below target'}")
    print(f"\nNext steps:")
    print(f"1. Review {csv_file}")
    print(f"2. Images saved to 'images/' directory (relative paths in JSON)")
    print(f"3. Import {json_file} to Skedisy database using: node import_to_skedisy.js {json_file}")
    print(f"4. Send claim invitations to salons")
    print(f"\nNote: Image paths in JSON are relative (e.g., 'images/abc123.jpg')")
    print(f"      Make sure to include the 'images/' directory when deploying.")


if __name__ == "__main__":
    main()

