# Skedisy Salon Scraper - Île-de-France

This scraper collects salon data from PagesJaunes and Google Places APIs for the Île-de-France region.

## Setup

1. **Install dependencies:**
```bash
cd scraping_data
pip install -r requirements.txt
```

2. **Get API Keys:**
   - **Google Places**: Get API key from https://console.cloud.google.com/apis/credentials
   - **PagesJaunes** (optional): Sign up at https://developer.pagesjaunes.fr/ (currently disabled in code)

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your Google Places API key:
# GOOGLE_PLACES_API_KEY=your_key_here
```

## Usage

```bash
python scrape_ile_de_france.py
```

The script will:
1. Scrape all 8 departments in Île-de-France using Google Places API
2. Search for salons using multiple keywords (salon de coiffure, institut de beauté, spa, manucure)
3. Remove duplicates
4. Format data for Skedisy platform
5. Save results to JSON and CSV files

**Note**: PagesJaunes scraping is currently disabled (commented out) as it requires an API key. The script will only use Google Places API.

## Output Files

- `salons_ile_de_france_TIMESTAMP.json` - Full data in JSON format (ready for database import)
- `salons_ile_de_france_TIMESTAMP.csv` - Summary in CSV format (for review)

## Data Fields

Each salon includes:
- Basic info: name, email, mobile, address
- Location: latitude, longitude, city, department
- Images: main image and gallery
- Metadata: source, source_id, claim token
- Status: isClaimed (false), isActive (false) - will be activated when salon claims

## Next Steps After Scraping

1. **Review the CSV file** to check data quality
2. **Import JSON to database** using Skedisy admin API
3. **Send claim invitations** to salons via email/SMS
4. **Monitor claim rate** and optimize messaging

## API Rate Limits

- **Google Places**: 
  - Nearby Search: 1000 requests/day (free tier)
  - Place Details: 100,000 requests/day (free tier)
  - Add delays between requests to avoid hitting limits
- **PagesJaunes**: Currently disabled (commented out in code)

## Legal Notes

⚠️ **Important**: 
- Only use scraped data for initial listing
- Send opt-in email to salons before activating
- Allow salons to request removal
- Comply with GDPR regulations

## Troubleshooting

**No API keys found:**
- Make sure `.env` file exists and contains valid keys

**Rate limit errors:**
- Add longer delays between requests
- Use API key with higher limits

**Missing data:**
- Some salons may not have complete information
- Review and manually complete critical fields

