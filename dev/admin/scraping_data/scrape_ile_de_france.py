"""
Skedisy Salon Scraper for Île-de-France
Scrapes salon data from Google Places API
(PagesJaunes API commented out - requires API key)
Outputs data formatted for Skedisy platform
"""

import requests
import json
import time
import csv
from typing import List, Dict, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import hashlib
import re

# Load environment variables
load_dotenv()

# Configuration
# PAGESJAUNES_API_KEY = os.getenv("PAGESJAUNES_API_KEY", "")  # Commented out - no API key
PAGESJAUNES_API_KEY = ""  # Disabled - no API key available
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")

# Île-de-France departments
ILE_DE_FRANCE_DEPARTMENTS = {
    "75": {"name": "Paris", "centre": {"lat": 48.8566, "lng": 2.3522}},
    "77": {"name": "Seine-et-Marne", "centre": {"lat": 48.6289, "lng": 2.7389}},
    "78": {"name": "Yvelines", "centre": {"lat": 48.8014, "lng": 2.1301}},
    "91": {"name": "Essonne", "centre": {"lat": 48.5293, "lng": 2.2386}},
    "92": {"name": "Hauts-de-Seine", "centre": {"lat": 48.8444, "lng": 2.2067}},
    "93": {"name": "Seine-Saint-Denis", "centre": {"lat": 48.9352, "lng": 2.3530}},
    "94": {"name": "Val-de-Marne", "centre": {"lat": 48.7872, "lng": 2.4033}},
    "95": {"name": "Val-d'Oise", "centre": {"lat": 49.0928, "lng": 2.0400}},
}

# Salon search categories
SALON_CATEGORIES = [
    "coiffure",
    "institut-beaute",
    "salon-de-beaute",
    "soins-esthetiques",
    "manucure",
    "epilation",
    "massage",
    "spa",
]

# Diverse salon keywords to ensure we get salons with lower visibility
# Including both black (afro) and white (européen) salons
DIVERSE_SALON_KEYWORDS = [
    "salon de coiffure",
    "coiffure afro",
    "coiffure africaine",
    "coiffure homme",
    "coiffure femme",
    "institut de beauté",
    "salon de beauté",
    "coiffeur",
    "coiffeuse",
    "spa",
    "manucure",
    "onglerie",
    "barber shop",
    "barbier",
    "coiffure mixte",
    "salon mixte",
]


# ============================================================================
# PAGESJAUNES SCRAPER - COMMENTED OUT (No API key available)
# ============================================================================
# To enable PagesJaunes scraping:
# 1. Get API key from https://developer.pagesjaunes.fr/
# 2. Add PAGESJAUNES_API_KEY to .env file
# 3. Uncomment this class and the PagesJaunes code in main()
# ============================================================================

# class PagesJaunesScraper:
#     """Scraper for PagesJaunes API"""
#     
#     BASE_URL = "https://api.pagesjaunes.fr/v1"
#     
#     def __init__(self, api_key: str):
#         self.api_key = api_key
#         self.session = requests.Session()
#         self.session.headers.update({
#             "Authorization": f"Bearer {api_key}",
#             "Content-Type": "application/json"
#         })
#     
#     def search_salons(self, department: str, category: str, page: int = 1, per_page: int = 20) -> Optional[Dict]:
#         """
#         Search for salons in a department
#         API endpoint: GET /search
#         """
#         try:
#             url = f"{self.BASE_URL}/search"
#             params = {
#                 "what": category,
#                 "where": department,
#                 "page": page,
#                 "per_page": per_page,
#                 "proximity": "0"  # Search in entire department
#             }
#             
#             response = self.session.get(url, params=params, timeout=10)
#             response.raise_for_status()
#             
#             return response.json()
#         except requests.exceptions.RequestException as e:
#             print(f"Error fetching PagesJaunes data: {e}")
#             return None
#     
#     def get_establishment_details(self, establishment_id: str) -> Optional[Dict]:
#         """Get detailed information about an establishment"""
#         try:
#             url = f"{self.BASE_URL}/establishments/{establishment_id}"
#             response = self.session.get(url, timeout=10)
#             response.raise_for_status()
#             return response.json()
#         except requests.exceptions.RequestException as e:
#             print(f"Error fetching establishment details: {e}")
#             return None
#     
#     def scrape_department(self, department_code: str, category: str) -> List[Dict]:
#         """Scrape all salons for a department and category"""
#         all_salons = []
#         page = 1
#         max_pages = 50  # Safety limit
#         
#         print(f"Scraping {category} in {ILE_DE_FRANCE_DEPARTMENTS[department_code]['name']}...")
#         
#         while page <= max_pages:
#             data = self.search_salons(department_code, category, page=page)
#             
#             if not data or "results" not in data:
#                 break
#             
#             results = data.get("results", [])
#             if not results:
#                 break
#             
#             for result in results:
#                 salon_data = self._format_pagesjaunes_data(result, department_code)
#                 if salon_data:
#                     all_salons.append(salon_data)
#             
#             # Check if there are more pages
#             total_results = data.get("total_results", 0)
#             current_count = len(all_salons)
#             
#             if current_count >= total_results or len(results) < 20:
#                 break
#             
#             page += 1
#             time.sleep(0.5)  # Rate limiting
#         
#         print(f"Found {len(all_salons)} salons for {category} in {department_code}")
#         return all_salons
#     
#     def _format_pagesjaunes_data(self, data: Dict, department_code: str) -> Optional[Dict]:
#         """Format PagesJaunes data to Skedisy format"""
#         try:
#             # Extract address
#             address = data.get("address", {})
#             address_line1 = address.get("street", "")
#             city = address.get("city", "")
#             postal_code = address.get("postal_code", "")
#             
#             # Extract coordinates
#             location = data.get("location", {})
#             latitude = location.get("lat", "")
#             longitude = location.get("lng", "")
#             
#             # Extract contact
#             contact = data.get("contact", {})
#             phone = contact.get("phone", "")
#             email = contact.get("email", "")
#             
#             # Extract description
#             description = data.get("description", "")
#             
#             # Extract images
#             images = data.get("images", [])
#             main_image = images[0] if images else ""
#             
#             return {
#                 "source": "pagesjaunes",
#                 "source_id": data.get("id", ""),
#                 "name": data.get("name", "").strip(),
#                 "email": email or f"contact@{data.get('name', '').lower().replace(' ', '')}.fr",
#                 "mobile": phone.replace(" ", "").replace(".", ""),
#                 "addressDetails": {
#                     "addressLine1": address_line1,
#                     "city": city,
#                     "state": "Île-de-France",
#                     "country": "France",
#                     "postalCode": postal_code
#                 },
#                 "locationCoordinates": {
#                     "latitude": str(latitude) if latitude else "",
#                     "longitude": str(longitude) if longitude else ""
#                 },
#                 "about": description,
#                 "mainImage": main_image,
#                 "image": images[:5] if images else [],
#                 "department": department_code,
#                 "category": data.get("category", ""),
#                 "website": data.get("website", ""),
#                 "raw_data": data  # Keep for reference
#             }
#         except Exception as e:
#             print(f"Error formatting data: {e}")
#             return None


class GooglePlacesScraper:
    """Scraper for Google Places API (Legacy - Free Tier)"""
    
    BASE_URL = "https://maps.googleapis.com/maps/api/place"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        # Create images directory if it doesn't exist
        self.images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
        os.makedirs(self.images_dir, exist_ok=True)
    
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
                print(f"      ⚠️  Could not download image: HTTP {response.status_code}")
                return None
        except Exception as e:
            print(f"      ⚠️  Error downloading image: {e}")
            return None
    
    def search_nearby(self, lat: float, lng: float, radius: int = 5000, 
                     keyword: str = "salon de coiffure") -> Optional[Dict]:
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
            
            # Debug: Print API response status
            status = result.get("status")
            if status != "OK":
                error_msg = result.get("error_message", "No error message")
                print(f"      API Status: {status} - {error_msg}")
                if status == "REQUEST_DENIED":
                    print(f"      💡 Tip: Enable 'Places API' (not 'Places API (New)') in Google Cloud Console")
                    print(f"      💡 Link: https://console.cloud.google.com/apis/library/places-backend.googleapis.com")
                return None
            
            return result
        except requests.exceptions.RequestException as e:
            print(f"      ❌ Error fetching Google Places data: {e}")
            return None
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed information about a place using Legacy Places API (Free)"""
        try:
            url = f"{self.BASE_URL}/details/json"
            params = {
                "place_id": place_id,
                "key": self.api_key,
                "language": "fr",
                "fields": "name,formatted_address,formatted_phone_number,website,geometry,photos,reviews,opening_hours,types"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            if result.get("status") != "OK":
                return None
                
            return result
        except requests.exceptions.RequestException as e:
            print(f"      Error fetching place details: {e}")
            return None
    
    def scrape_department_centre(self, department_code: str, keywords: List[str]) -> List[Dict]:
        """Scrape salons using department centre point"""
        all_salons = []
        centre = ILE_DE_FRANCE_DEPARTMENTS[department_code]["centre"]
        
        print(f"Scraping Google Places for {ILE_DE_FRANCE_DEPARTMENTS[department_code]['name']}...")
        
        for keyword in keywords:
            print(f"  Searching for '{keyword}'...")
            data = self.search_nearby(centre["lat"], centre["lng"], radius=50000, keyword=keyword)
            
            if not data:
                print(f"    ⚠️  No data returned for '{keyword}'")
                continue
            
            # Legacy API structure: results are in "results" array
            results = data.get("results", [])
            print(f"    ✅ Found {len(results)} results for '{keyword}'")
            
            for result in results:
                place_id = result.get("place_id")
                if not place_id:
                    continue
                
                # Get detailed information
                details = self.get_place_details(place_id)
                if details and details.get("status") == "OK":
                    salon_data = self._format_google_data(details.get("result", {}), department_code)
                    if salon_data:
                        all_salons.append(salon_data)
                
                time.sleep(0.2)  # Rate limiting for Google API
        
        print(f"Found {len(all_salons)} salons from Google Places in {department_code}")
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
                            print(f"      ⚠️  Could not download image {i+1}: {e}")
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
            
            # If no email found, leave it empty - salon will fill it when claiming
            # This ensures we don't create fake emails
            
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
                "about": f"Salon trouvé via Google Places",
                "mainImage": main_image,
                "image": images,
                "department": department_code,
                "website": data.get("website", ""),
                "opening_hours": opening_hours,
                "raw_data": data
            }
        except Exception as e:
            print(f"      Error formatting Google data: {e}")
            return None
    
    def _format_google_data_new_api(self, data: Dict, department_code: str) -> Optional[Dict]:
        """Format Google Places API (New) data to Skedisy format"""
        try:
            # Extract address (new API format)
            address = data.get("formattedAddress", "")
            address_parts = address.split(",") if address else []
            address_line1 = address_parts[0].strip() if address_parts else ""
            city = address_parts[-2].strip() if len(address_parts) > 1 else ""
            
            # Extract coordinates (new API format)
            location = data.get("location", {})
            latitude = location.get("latitude", "")
            longitude = location.get("longitude", "")
            
            # Extract phone (new API format)
            phone = ""
            national_phone = data.get("nationalPhoneNumber", "")
            international_phone = data.get("internationalPhoneNumber", "")
            phone = national_phone or international_phone or ""
            phone = phone.replace(" ", "").replace(".", "").replace("-", "")
            
            # Extract photos (new API format)
            photos = data.get("photos", [])
            main_image = ""
            images = []
            if photos and self.api_key:
                # Download images and save locally
                for i, photo in enumerate(photos[:5]):  # Limit to 5 images
                    photo_name = photo.get("name", "")
                    if photo_name:
                        try:
                            # Construct photo URL with API key
                            photo_url = f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=800&maxWidthPx=800&key={self.api_key}"
                            # Download and save image
                            saved_path = self._download_and_save_image(photo_url, photo_name)
                            if saved_path:
                                if i == 0:
                                    main_image = saved_path
                                images.append(saved_path)
                                time.sleep(0.1)  # Rate limiting
                        except Exception as e:
                            print(f"      ⚠️  Could not download image {i+1}: {e}")
                            continue
            elif photos:
                # No API key - store photo name for later use
                photo_name = photos[0].get("name", "")
                if photo_name:
                    main_image = f"photo_name:{photo_name}"
                    images = [main_image]
            
            # Extract opening hours (new API format)
            current_opening_hours = data.get("currentOpeningHours", {})
            weekday_text = current_opening_hours.get("weekdayDescriptions", [])
            
            # Extract name and ID (new API format)
            name = data.get("displayName", {}).get("text", "") or data.get("name", "").strip()
            place_id = data.get("id", "")
            
            # Extract website
            website = ""
            uri = data.get("uri", "")
            if uri:
                website = uri
            
            # Try to extract email from website, otherwise leave empty
            email = ""
            if website:
                email = self._extract_email_from_website(website)
            
            return {
                "source": "google_places",
                "source_id": place_id,
                "name": name,
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
                "about": f"Salon trouvé via Google Places",
                "mainImage": main_image,
                "image": images,
                "department": department_code,
                "website": website,
                "opening_hours": weekday_text,
                "raw_data": data
            }
        except Exception as e:
            print(f"      Error formatting Google data (new API): {e}")
            return None


class SkedisySalonFormatter:
    """Format scraped data for Skedisy platform"""
    
    @staticmethod
    def format_for_skedisy(salon_data: Dict) -> Dict:
        """Format salon data to match Skedisy salon model"""
        # Generate default password (salon will change when claiming)
        import secrets
        default_password = secrets.token_urlsafe(12)
        
        # Generate unique ID
        import random
        unique_id = random.randint(1000000, 9999999)
        
        return {
            "name": salon_data.get("name", ""),
            "email": salon_data.get("email", ""),
            "mobile": salon_data.get("mobile", ""),
            "password": default_password,  # Will be changed when salon claims
            "addressDetails": salon_data.get("addressDetails", {}),
            "locationCoordinates": salon_data.get("locationCoordinates", {}),
            "about": salon_data.get("about", "Salon ajouté automatiquement. Informations à compléter."),
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
            "serviceIds": [],  # Will be added manually or via service mapping
            "createdAt": datetime.now().isoformat(),
            "metadata": {
                "scraped_at": datetime.now().isoformat(),
                "department": salon_data.get("department", ""),
                "website": salon_data.get("website", "")
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
    """Main scraping function"""
    print("=" * 60)
    print("Skedisy Île-de-France Salon Scraper")
    print("=" * 60)
    
    all_salons = []
    
    # Initialize scrapers
    # PagesJaunes scraper - DISABLED (no API key)
    # pj_scraper = None
    # if PAGESJAUNES_API_KEY:
    #     pj_scraper = PagesJaunesScraper(PAGESJAUNES_API_KEY)
    #     print("✅ PagesJaunes scraper initialized")
    # else:
    #     print("⚠️  PagesJaunes API key not found, skipping PagesJaunes scraping")
    pj_scraper = None
    print("ℹ️  PagesJaunes scraping disabled (no API key)")
    
    # Google Places scraper
    gp_scraper = None
    if GOOGLE_PLACES_API_KEY:
        gp_scraper = GooglePlacesScraper(GOOGLE_PLACES_API_KEY)
        print("✅ Google Places scraper initialized")
    else:
        print("⚠️  Google Places API key not found! Please set GOOGLE_PLACES_API_KEY in .env file")
    
    if not gp_scraper:
        print("❌ Google Places API key required! Please set GOOGLE_PLACES_API_KEY in .env file")
        return
    
    # Scrape each department
    for dept_code, dept_info in ILE_DE_FRANCE_DEPARTMENTS.items():
        print(f"\n{'='*60}")
        print(f"Processing {dept_info['name']} ({dept_code})")
        print(f"{'='*60}")
        
        # Scrape from PagesJaunes - DISABLED (no API key)
        # if pj_scraper:
        #     for category in SALON_CATEGORIES:
        #         salons = pj_scraper.scrape_department(dept_code, category)
        #         all_salons.extend(salons)
        #         time.sleep(1)  # Rate limiting
        
        # Scrape from Google Places with diverse keywords
        # This ensures we get salons with lower visibility (both black/afro and white/européen salons)
        if gp_scraper:
            salons = gp_scraper.scrape_department_centre(dept_code, DIVERSE_SALON_KEYWORDS)
            all_salons.extend(salons)
    
    # Remove duplicates (by name + address)
    print(f"\n{'='*60}")
    print("Removing duplicates...")
    seen = set()
    unique_salons = []
    for salon in all_salons:
        key = (salon.get("name", "").lower(), salon.get("addressDetails", {}).get("addressLine1", "").lower())
        if key not in seen:
            seen.add(key)
            unique_salons.append(salon)
    
    print(f"Total salons found: {len(all_salons)}")
    print(f"Unique salons: {len(unique_salons)}")
    
    # Format for Skedisy
    print("\nFormatting data for Skedisy...")
    formatter = SkedisySalonFormatter()
    skedisy_salons = [formatter.format_for_skedisy(salon) for salon in unique_salons]
    
    # Save to files
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Save as JSON
    json_file = os.path.join(script_dir, f"salons_ile_de_france_{timestamp}.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(skedisy_salons, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(skedisy_salons)} salons to {json_file}")
    
    # Save as CSV for review
    csv_file = os.path.join(script_dir, f"salons_ile_de_france_{timestamp}.csv")
    if skedisy_salons:
        fieldnames = ["name", "email", "mobile", "addressLine1", "city", "latitude", "longitude", "source", "isClaimed"]
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
                    "isClaimed": salon.get("isClaimed", False)
                })
        print(f"✅ Saved CSV to {csv_file}")
    
    print(f"\n{'='*60}")
    print("Scraping complete!")
    print(f"{'='*60}")
    print(f"\nNext steps:")
    print(f"1. Review {csv_file}")
    print(f"2. Images saved to 'images/' directory (relative paths in JSON)")
    print(f"3. Import {json_file} to Skedisy database")
    print(f"4. Send claim invitations to salons")
    print(f"\nNote: Image paths in JSON are relative (e.g., 'images/abc123.jpg')")
    print(f"      Make sure to include the 'images/' directory when deploying.")


if __name__ == "__main__":
    main()

