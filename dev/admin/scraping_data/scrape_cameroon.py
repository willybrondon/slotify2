"""
Skedisy Salon Scraper for Cameroon
Scrapes salon, spa, and beauty center data from Google Places API
Focuses on Yaounde and Douala cities
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
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")

# Cameroon cities with multiple search points for better coverage
CAMEROON_CITIES = {
    "YAOUNDE": {
        "name": "Yaounde",
        "search_points": [
            {"lat": 3.8480, "lng": 11.5021, "name": "Yaounde Centre"},
            {"lat": 3.8600, "lng": 11.5200, "name": "Bastos"},
            {"lat": 3.8700, "lng": 11.5000, "name": "Etoa-Meki"},
            {"lat": 3.8400, "lng": 11.4800, "name": "Mvog-Ada"},
            {"lat": 3.8300, "lng": 11.5100, "name": "Elig-Edzoa"},
            {"lat": 3.8500, "lng": 11.5300, "name": "Nlongkak"},
            {"lat": 3.8200, "lng": 11.4900, "name": "Mvog-Betsi"},
            {"lat": 3.8600, "lng": 11.4800, "name": "Ekounou"},
            {"lat": 3.8800, "lng": 11.5100, "name": "Mvog-Mbi"},
            {"lat": 3.8400, "lng": 11.5400, "name": "Mvog-Atangana Mballa"},
        ]
    },
    "DOUALA": {
        "name": "Douala",
        "search_points": [
            {"lat": 4.0511, "lng": 9.7679, "name": "Douala Centre"},
            {"lat": 4.0600, "lng": 9.7800, "name": "Bonanjo"},
            {"lat": 4.0500, "lng": 9.7500, "name": "Akwa"},
            {"lat": 4.0400, "lng": 9.7600, "name": "Makepe"},
            {"lat": 4.0700, "lng": 9.7700, "name": "Logpom"},
            {"lat": 4.0300, "lng": 9.7400, "name": "Kotto"},
            {"lat": 4.0800, "lng": 9.7600, "name": "Bepanda"},
            {"lat": 4.0400, "lng": 9.7800, "name": "New-Bell"},
            {"lat": 4.0600, "lng": 9.7300, "name": "Bali"},
            {"lat": 4.0500, "lng": 9.7900, "name": "Deido"},
        ]
    }
}

# Salon, spa, and beauty center keywords in French and English
# Adapted for Cameroon market
SALON_KEYWORDS = [
    # French keywords
    "salon de coiffure",
    "coiffure",
    "coiffeur",
    "coiffeuse",
    "salon de beauté",
    "institut de beauté",
    "soins esthétiques",
    "manucure",
    "pédicure",
    "onglerie",
    "épilation",
    "massage",
    "spa",
    "barbier",
    "barber shop",
    "coiffure afro",
    "coiffure africaine",
    "tissage",
    "dreadlocks",
    "coiffure homme",
    "coiffure femme",
    "salon mixte",
    # English keywords (also used in Cameroon)
    "hair salon",
    "beauty salon",
    "beauty center",
    "nail salon",
    "nail art",
    "hair braiding",
    "hair styling",
    "barbershop",
    "haircut",
    "beauty spa",
    "wellness center",
    # Local terms
    "salon",
    "coiffure mixte",
    "soins capillaires",
    "traitement capillaire",
]


class GooglePlacesScraper:
    """Scraper for Google Places API (Legacy - Free Tier)"""
    
    BASE_URL = "https://maps.googleapis.com/maps/api/place"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.seen_place_ids = set()  # Track seen place IDs to avoid duplicates
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
    
    def scrape_location(self, lat: float, lng: float, location_name: str, 
                       keywords: List[str], city_code: str) -> List[Dict]:
        """Scrape salons from a specific location with multiple keywords"""
        all_salons = []
        
        print(f"  📍 Searching in {location_name}...")
        
        for keyword in keywords:
            print(f"    🔍 Keyword: '{keyword}'", end=" ... ")
            data = self.search_nearby(lat, lng, radius=5000, keyword=keyword)
            
            if not data:
                print("❌ No results")
                time.sleep(0.2)  # Rate limiting
                continue
            
            results = data.get("results", [])
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
                    salon_data = self._format_google_data(details.get("result", {}), city_code)
                    if salon_data:
                        all_salons.append(salon_data)
                        new_results += 1
                
                time.sleep(0.2)  # Rate limiting for Google API
            
            print(f"✅ Found {new_results} new salons")
            time.sleep(0.3)  # Rate limiting between keywords
        
        return all_salons
    
    def scrape_city(self, city_code: str, keywords: List[str]) -> List[Dict]:
        """Scrape all salons for a city using multiple search points"""
        all_salons = []
        city_info = CAMEROON_CITIES[city_code]
        
        print(f"\n{'='*60}")
        print(f"Processing {city_info['name']} ({city_code})")
        print(f"{'='*60}")
        
        for search_point in city_info["search_points"]:
            salons = self.scrape_location(
                search_point["lat"],
                search_point["lng"],
                search_point["name"],
                keywords,
                city_code
            )
            all_salons.extend(salons)
            time.sleep(0.5)  # Rate limiting between locations
        
        print(f"\n✅ Found {len(all_salons)} total salons in {city_info['name']}")
        return all_salons
    
    def _format_google_data(self, data: Dict, city_code: str) -> Optional[Dict]:
        """Format Google Places API (Legacy) data to Skedisy format"""
        try:
            # Extract address (legacy API format)
            address_parts = data.get("formatted_address", "").split(",")
            address_line1 = address_parts[0].strip() if address_parts else ""
            city = CAMEROON_CITIES[city_code]["name"]
            
            # Try to extract postal code if available
            postal_code = ""
            for part in address_parts:
                part = part.strip()
                # Look for postal code pattern (Cameroon postal codes are typically 5 digits)
                if re.match(r'^\d{5}$', part):
                    postal_code = part
                    break
            
            # Extract coordinates (legacy API format)
            geometry = data.get("geometry", {})
            location = geometry.get("location", {})
            latitude = location.get("lat", "")
            longitude = location.get("lng", "")
            
            # Extract phone (legacy API format)
            phone = data.get("formatted_phone_number", "").replace(" ", "").replace(".", "").replace("-", "").replace("+", "")
            
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
                    "state": "Cameroon",
                    "country": "Cameroon",
                    "postalCode": postal_code
                },
                "locationCoordinates": {
                    "latitude": str(latitude) if latitude else "",
                    "longitude": str(longitude) if longitude else ""
                },
                "about": f"Salon trouvé via Google Places à {city}",
                "mainImage": main_image,
                "image": images,
                "city": city_code,
                "website": data.get("website", ""),
                "opening_hours": opening_hours,
                "raw_data": data
            }
        except Exception as e:
            print(f"      Error formatting Google data: {e}")
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
                "city": salon_data.get("city", ""),
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
    print("Skedisy Cameroon Salon Scraper")
    print("Scraping salons, spas, and beauty centers in Yaounde and Douala")
    print("=" * 60)
    
    all_salons = []
    
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
    
    # Scrape each city
    for city_code, city_info in CAMEROON_CITIES.items():
        print(f"\n{'='*60}")
        print(f"Processing {city_info['name']} ({city_code})")
        print(f"{'='*60}")
        
        # Scrape from Google Places with diverse keywords
        if gp_scraper:
            salons = gp_scraper.scrape_city(city_code, SALON_KEYWORDS)
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
    json_file = os.path.join(script_dir, f"salons_cameroon_{timestamp}.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(skedisy_salons, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(skedisy_salons)} salons to {json_file}")
    
    # Save as CSV for review
    csv_file = os.path.join(script_dir, f"salons_cameroon_{timestamp}.csv")
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

