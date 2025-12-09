# Free Google Places API Setup Guide

## ✅ Using the Legacy Places API (FREE)

The script has been updated to use the **Legacy Places API**, which has a **free tier**:
- **$200 free credit per month** (equivalent to ~40,000 requests)
- No credit card required for basic usage
- Perfect for scraping salons

## 🔧 Setup Steps

### 1. Enable Legacy Places API (NOT the New one!)

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Places API"** (NOT "Places API (New)")
3. Click on **"Places API"** (the legacy one)
4. Click **"Enable"**

**Important:** Make sure you enable **"Places API"** (legacy), NOT **"Places API (New)"** (paid)

### 2. Verify Your API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Click on it to edit
4. Under "API restrictions", make sure:
   - Either "Don't restrict key" is selected
   - OR "Restrict key" is selected and "Places API" is in the allowed list

### 3. Check Billing (Optional for Free Tier)

- The legacy Places API has $200/month free credit
- You can use it without billing for basic usage
- If you exceed free tier, you'll need billing enabled

## 📊 Free Tier Limits

- **$200 free credit per month**
- **~40,000 requests/month** (depending on request type)
- **Nearby Search**: ~$0.032 per request = ~6,250 requests free
- **Place Details**: ~$0.017 per request = ~11,700 requests free

For scraping Île-de-France (8 departments × 4 keywords × ~20 results):
- ~640 Nearby Search requests = ~$20
- ~640 Place Details requests = ~$11
- **Total: ~$31 (well within $200 free tier!)**

## 🚀 Run the Script

```bash
cd scraping_data
python scrape_ile_de_france.py
```

## ⚠️ Troubleshooting

### Error: "REQUEST_DENIED"
- Make sure you enabled **"Places API"** (legacy), not the new one
- Check API key restrictions
- Verify API key is correct in `.env` file

### Error: "OVER_QUERY_LIMIT"
- You've exceeded the free tier
- Wait until next month OR enable billing

### Error: "ZERO_RESULTS"
- No salons found for that keyword/location
- Try different keywords or locations

## 💡 Alternative Free Options

If Google Places doesn't work, consider:

1. **OpenStreetMap/Nominatim** (completely free, no API key needed)
2. **Web scraping** (legal concerns, but free)
3. **Manual data entry** (time-consuming but free)

Let me know if you want me to add support for these alternatives!

