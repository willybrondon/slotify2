# Cameroon Salon Scraper Guide

This script scrapes salon, spa, and beauty center data from Google Places API for Yaounde and Douala cities in Cameroon.

## Prerequisites

1. **Python 3.7+** installed
2. **Google Places API Key** - You need to:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select an existing one
   - Enable the **Places API** (Legacy - not the new one)
   - Create an API key
   - Add billing information (Google provides free credits)

3. **Required Python packages**:
   ```bash
   pip install requests python-dotenv
   ```

## Setup

1. **Create a `.env` file** in the `scraping_data` directory:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

2. **Make sure the script is executable** (optional):
   ```bash
   chmod +x scrape_cameroon.py
   ```

## Usage

Run the script:
```bash
cd slotify2/dev/admin/scraping_data
python scrape_cameroon.py
```

## What it does

1. **Searches multiple locations** in each city:
   - **Yaounde**: Centre, Bastos, Etoa-Meki, Mvog-Ada, Elig-Edzoa, Nlongkak, Mvog-Betsi, Ekounou, Mvog-Mbi, Mvog-Atangana Mballa
   - **Douala**: Centre, Bonanjo, Akwa, Makepe, Logpom, Kotto, Bepanda, New-Bell, Bali, Deido

2. **Uses diverse keywords** to find all types of salons:
   - French: salon de coiffure, coiffure afro, institut de beauté, spa, etc.
   - English: hair salon, beauty salon, barbershop, etc.
   - Local terms: tissage, dreadlocks, etc.

3. **Extracts data**:
   - Name, address, phone number
   - Coordinates (latitude/longitude)
   - Photos (downloaded and saved locally)
   - Website (if available)
   - Opening hours (if available)

4. **Removes duplicates** based on name and address

5. **Formats data** for Skedisy platform

6. **Saves output**:
   - JSON file: `salons_cameroon_YYYYMMDD_HHMMSS.json`
   - CSV file: `salons_cameroon_YYYYMMDD_HHMMSS.csv` (for easy review)
   - Images: saved in `images/` directory

## Output Files

### JSON File
Contains all salon data formatted for Skedisy import, including:
- Salon details (name, email, phone, address)
- Location coordinates
- Images (relative paths)
- Default salon hours
- Claim token for salon claiming

### CSV File
A simplified view for review with columns:
- name
- email
- mobile
- addressLine1
- city
- latitude
- longitude
- source
- isClaimed

## Important Notes

1. **API Rate Limiting**: The script includes rate limiting to avoid hitting Google API limits. The scraping process may take some time.

2. **Images**: Images are downloaded and saved locally. Make sure you have enough disk space.

3. **Email Extraction**: The script tries to extract emails from websites, but if not found, the email field will be empty. Salons can provide their email when claiming their profile.

4. **Duplicate Detection**: The script uses place_id from Google to avoid processing the same salon multiple times.

5. **Default Values**:
   - Password: Auto-generated (salons will change when claiming)
   - Platform Fee: 10%
   - Salon Hours: 9 AM - 7 PM with 1-2 PM break
   - isActive: False (will be activated when claimed)

## Troubleshooting

### "API Status: REQUEST_DENIED"
- Make sure you enabled **Places API (Legacy)** not the new Places API
- Check that your API key is correct
- Verify billing is enabled in Google Cloud Console

### "No results" for keywords
- Some keywords might not return results in certain areas
- This is normal - the script will continue with other keywords

### Rate limiting errors
- The script includes automatic rate limiting
- If you see many errors, you might need to increase delays between requests

## Next Steps After Scraping

1. **Review the CSV file** to check data quality
2. **Import the JSON file** to your Skedisy database
3. **Upload images** to your server (if using relative paths)
4. **Send claim invitations** to salons using the claim tokens

## Customization

You can customize the script by:
- Adding more search points in `CAMEROON_CITIES`
- Adding more keywords in `SALON_KEYWORDS`
- Adjusting the search radius (currently 5000 meters)
- Modifying default salon hours in `_generate_default_hours()`

