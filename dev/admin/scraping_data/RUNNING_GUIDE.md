# Running the Scraper - Local vs VPS Guide

## 🏠 **Recommended: Run Locally First**

### Why Start Locally:
1. ✅ **Quick Setup** - No server configuration needed
2. ✅ **Easy Debugging** - See output in real-time
3. ✅ **No Cost** - Free to run on your machine
4. ✅ **Direct Access** - Files saved directly to your computer
5. ✅ **Test First** - Verify it works before scaling

### How to Run Locally:

```bash
# 1. Navigate to scraping directory
cd scraping_data

# 2. Activate virtual environment (if using one)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Set up .env file with your API key
# Create .env file and add:
# GOOGLE_PLACES_API_KEY=your_key_here

# 4. Run the script
python scrape_ile_de_france.py
```

### Expected Runtime:
- **8 departments** × **4 keywords** × **~20 results each** = **~640 API calls**
- With **0.2s delay** between requests = **~2-4 hours total**
- Script will save progress to JSON/CSV files

### Tips for Local Run:
- ✅ Keep your computer awake (disable sleep mode)
- ✅ Keep terminal/command prompt open
- ✅ Monitor progress in console output
- ✅ Files saved in `scraping_data/` directory

---

## 🖥️ **When to Use VPS:**

### Use VPS If:
- ❌ Script takes too long (need to run overnight)
- ❌ Want to run unattended
- ❌ Need to run multiple times/scheduled
- ❌ Production environment

### VPS Setup Steps:

#### 1. **Choose a VPS Provider:**
   - **DigitalOcean**: $5-10/month (recommended)
   - **Linode**: $5-10/month
   - **AWS EC2**: Pay-as-you-go
   - **Vultr**: $5-10/month

#### 2. **Connect to VPS:**
```bash
# SSH into your VPS
ssh user@your-vps-ip
```

#### 3. **Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3
sudo apt install python3 python3-pip python3-venv -y

# Install git (if needed)
sudo apt install git -y
```

#### 4. **Upload Script to VPS:**
```bash
# Option A: Clone from git (if in repository)
git clone your-repo-url
cd scraping_data

# Option B: Use SCP to copy files
# From your local machine:
scp -r scraping_data/ user@vps-ip:/home/user/
```

#### 5. **Set Up Environment:**
```bash
cd scraping_data

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
# Add: GOOGLE_PLACES_API_KEY=your_key_here
# Save: Ctrl+X, Y, Enter
```

#### 6. **Run Script (with Screen/Tmux for Long Runs):**
```bash
# Install screen (keeps script running if connection drops)
sudo apt install screen -y

# Start a screen session
screen -S scraper

# Run the script
python3 scrape_ile_de_france.py

# Detach from screen: Ctrl+A, then D
# Reattach later: screen -r scraper
```

#### 7. **Download Results:**
```bash
# From your local machine, download the output files:
scp user@vps-ip:/home/user/scraping_data/salons_ile_de_france_*.json ./
scp user@vps-ip:/home/user/scraping_data/salons_ile_de_france_*.csv ./
```

---

## 🔄 **Hybrid Approach (Best of Both):**

1. **Test locally first** with 1-2 departments
2. **Verify output** looks correct
3. **Run full scrape on VPS** if needed

### Test Run (Local):
```bash
# Temporarily modify script to test with just Paris (75)
# Or create a test version that only scrapes 1 department
python scrape_ile_de_france.py  # Test with full run, but monitor closely
```

---

## 📊 **Monitoring Progress:**

### Local:
- Watch console output
- Check file sizes growing
- Look for error messages

### VPS:
```bash
# Check if script is running
ps aux | grep python

# Monitor output file size
ls -lh scraping_data/salons_ile_de_france_*.json

# View recent logs (if logging to file)
tail -f scraper.log
```

---

## ⚠️ **Important Notes:**

1. **API Rate Limits:**
   - Google Places: 1000 Nearby Search requests/day (free tier)
   - Script includes 0.2s delays to avoid hitting limits
   - If you hit limits, wait 24 hours or upgrade API tier

2. **Network Stability:**
   - VPS: More stable connection
   - Local: Depends on your internet

3. **Data Backup:**
   - Always backup output files
   - Consider running in batches (few departments at a time)

4. **Cost Considerations:**
   - Local: Free (your electricity)
   - VPS: $5-10/month (but can run 24/7)

---

## 🎯 **Final Recommendation:**

**Start with LOCAL run:**
- Quick to set up
- Easy to monitor
- No additional cost
- Can test and verify

**Move to VPS if:**
- Script takes too long
- Need to run multiple times
- Want automation/scheduling
- Production environment

---

## 🚀 **Quick Start (Local):**

```bash
cd scraping_data
# Create .env file with: GOOGLE_PLACES_API_KEY=your_key
python scrape_ile_de_france.py
```

That's it! Let it run and check the output files when done.

