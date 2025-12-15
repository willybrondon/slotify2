# Afro/Black Salon Scraping Guide

## Overview

This script (`scrape_afro_salons_ile_de_france.py`) is specifically designed to find **1000 afro and black salons** in Île-de-France. It uses targeted keywords and multiple search points to maximize coverage.

## Key Features

### 🎯 Focused Keywords
- **150+ specific keywords** for afro/black salons including:
  - "coiffure afro", "coiffure africaine", "salon afro"
  - "coiffure cheveux crépus", "coiffure cheveux bouclés"
  - "tissage", "tresse africaine", "braids", "locks"
  - Location-specific keywords (Château Rouge, Barbès, Montreuil, etc.)
  - English variations (afro hair salon, black barber shop, etc.)

### 📍 Multiple Search Points
- **10 search points in Paris** (including arrondissements with high afro population)
- **4-7 search points per department** (93, 94, 92, 95 have more points)
- Focus on areas known for afro salons:
  - Paris: 18e, 19e, 20e, 13e, 10e arrondissements
  - Seine-Saint-Denis (93): Montreuil, Aubervilliers, Saint-Denis, etc.
  - Val-de-Marne (94): Créteil, Vitry, Champigny, etc.
  - Hauts-de-Seine (92): Gennevilliers, Colombes, Nanterre, etc.

### 🔍 Smart Deduplication
- Tracks place IDs to avoid duplicates
- Double-checks by name + address + city
- Ensures unique results

## Setup

### 1. Install Dependencies

```bash
cd dev/admin/scraping_data
pip install -r requirements.txt
```

### 2. Configure API Key

Create or update `.env` file:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

**Important:** Use the **Legacy Places API** (not the new Places API):
- Enable: "Places API" (not "Places API (New)")
- Link: https://console.cloud.google.com/apis/library/places-backend.googleapis.com

### 3. Run the Script

```bash
python scrape_afro_salons_ile_de_france.py
```

## Expected Output

The script will:
1. Search each department with all keywords
2. Show progress for each location and keyword
3. Display running total of unique salons found
4. Stop early if 1000 salons are reached
5. Generate two output files:
   - `salons_afro_ile_de_france_YYYYMMDD_HHMMSS.json` - Full data for import
   - `salons_afro_ile_de_france_YYYYMMDD_HHMMSS.csv` - Quick review file

## Output Files

### JSON File
Contains full salon data formatted for Skedisy:
- Name, email, phone, address
- Coordinates, images
- Metadata including `salon_type: "afro_black"`
- Ready for import via `import_to_skedisy.js`

### CSV File
Quick review format with:
- Name, email, mobile
- Address, city
- Coordinates
- Department
- Claim status

## Import to Database

After scraping, import the JSON file:

```bash
node import_to_skedisy.js salons_afro_ile_de_france_YYYYMMDD_HHMMSS.json
```

## Tips for Reaching 1000 Salons

If the script finds fewer than 1000 salons:

1. **Run multiple times** - Google Places may return different results
2. **Add more search points** - Edit `ILE_DE_FRANCE_DEPARTMENTS` in the script
3. **Expand keywords** - Add more variations to `AFRO_SALON_KEYWORDS`
4. **Increase radius** - Change `radius=5000` to `radius=10000` (slower but more results)
5. **Focus on high-density areas** - Run separately for 93, 94, 92, 75

## Rate Limiting

The script includes rate limiting to avoid API quota issues:
- 0.2s delay between place detail requests
- 0.3s delay between keywords
- 0.5s delay between locations
- 1s delay between departments

**Estimated runtime:** 2-4 hours for full scan (depends on API quota)

## Differences from General Scraper

| Feature | General Scraper | Afro Salon Scraper |
|---------|----------------|-------------------|
| Keywords | 20 general keywords | 150+ afro-specific keywords |
| Search Points | 1 per department | 4-10 per department |
| Focus | All salons | Afro/black salons only |
| Target | No specific target | 1000 salons |
| Metadata | General | Includes `salon_type: "afro_black"` |

## Troubleshooting

### "API Status: REQUEST_DENIED"
- Check that "Places API" (Legacy) is enabled
- Verify API key is correct
- Check API quota in Google Cloud Console

### "Found 0 new salons"
- Try different keywords
- Increase search radius
- Check if location coordinates are correct

### "Target not reached"
- Run script multiple times
- Add more search points in high-density areas
- Expand keyword list with more variations

## Next Steps

After importing:
1. Review the CSV file to verify salon quality
2. Send claim invitations to salons
3. Monitor claim rates
4. Consider running again to find more salons if needed

