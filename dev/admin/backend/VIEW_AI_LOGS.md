# How to View AI Concierge Logs on VPS

## Quick Commands

### 1. View All AI Concierge Logs (Real-time)

```bash
pm2 logs backend --lines 100 | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

### 2. View All Server Logs (Real-time)

```bash
pm2 logs backend --lines 100
```

### 3. View Only Recent AI Concierge Logs

```bash
pm2 logs backend --lines 50 | grep -E "\[Selfie Analysis\]|\[AI Concierge\]|GEMINI|OLLAMA"
```

### 4. View Logs from Last 10 Minutes (if using log files)

```bash
tail -f ~/.pm2/logs/backend-out.log | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

---

## Detailed Commands

### PM2 Commands (Most Common)

#### View Real-time Logs with Filter
```bash
# Follow logs and filter for AI-related messages
pm2 logs backend --lines 200 | grep --line-buffered -i "selfie\|gemini\|ollama\|concierge\|ai analysis"
```

#### View Only Error Logs
```bash
pm2 logs backend --err --lines 100 | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

#### View Only Output Logs
```bash
pm2 logs backend --out --lines 100 | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

#### View Logs for Specific Time Period
```bash
# View logs from last 30 minutes
pm2 logs backend --lines 500 | grep -i "selfie\|gemini\|ollama\|ai\|concierge" | tail -100
```

#### View All Logs and Save to File
```bash
pm2 logs backend --lines 1000 | grep -i "selfie\|gemini\|ollama\|ai\|concierge" > ai_concierge_logs.txt
cat ai_concierge_logs.txt
```

### Direct Log File Access

#### Find PM2 Log Directory
```bash
pm2 info backend | grep "log path"
```

#### View Log Files Directly
```bash
# View output log (stdout)
tail -f ~/.pm2/logs/backend-out.log | grep -i "selfie\|gemini\|ollama\|ai\|concierge"

# View error log (stderr)
tail -f ~/.pm2/logs/backend-err.log | grep -i "selfie\|gemini\|ollama\|ai\|concierge"

# View both logs
tail -f ~/.pm2/logs/backend-out.log ~/.pm2/logs/backend-err.log | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

#### Search Log Files for Specific Errors
```bash
# Search for "API key not configured" errors
grep -r "API key not configured" ~/.pm2/logs/

# Search for Gemini initialization
grep -r "Gemini API initialized" ~/.pm2/logs/

# Search for Ollama errors
grep -r "Ollama" ~/.pm2/logs/

# Search for selfie analysis errors
grep -r "Failed to analyze selfie" ~/.pm2/logs/
```

---

## Specific Diagnostic Commands

### Check if Gemini API Key is Loaded

```bash
pm2 logs backend --lines 50 | grep -E "GEMINI_API_KEY|Gemini API initialized"
```

### Check for Environment Variable Issues

```bash
pm2 logs backend --lines 100 | grep -E "Environment|\.env|GEMINI_API_KEY|OLLAMA_HOST"
```

### Monitor AI Concierge Requests in Real-time

```bash
pm2 logs backend --lines 0 | grep --line-buffered -E "analyzeSelfie|AI Concierge|Selfie Analysis"
```

### Check for Specific Error Messages

```bash
# Check for "Both AI services failed"
pm2 logs backend --lines 200 | grep -A 5 "Both AI services failed"

# Check for configuration errors
pm2 logs backend --lines 200 | grep -E "not configured|not found|failed"
```

---

## Useful Log Patterns to Search For

### Success Indicators ✅
```bash
pm2 logs backend --lines 100 | grep -E "Gemini API initialized|genAI is initialized|Successfully used model|Selfie analyzed successfully"
```

### Error Indicators ❌
```bash
pm2 logs backend --lines 100 | grep -E "API key not configured|Both AI services failed|Failed to initialize|not found in environment"
```

### Diagnostic Information 🔍
```bash
pm2 logs backend --lines 100 | grep -E "\[Selfie Analysis\]|GEMINI_API_KEY|diagnostic|Reloaded"
```

---

## Advanced Log Analysis

### Count Error Occurrences
```bash
grep -c "API key not configured" ~/.pm2/logs/backend-err.log
grep -c "Both AI services failed" ~/.pm2/logs/backend-err.log
```

### View Logs with Timestamps
```bash
pm2 logs backend --timestamp --lines 100 | grep -i "selfie\|gemini\|ollama\|ai\|concierge"
```

### Export Recent Errors to File
```bash
pm2 logs backend --err --lines 500 | grep -i "selfie\|gemini\|ollama\|ai\|concierge\|error\|failed" > ai_errors_$(date +%Y%m%d_%H%M%S).txt
```

---

## Most Useful Commands (Copy & Paste)

### 1. Real-time Monitoring (Best for Debugging)
```bash
pm2 logs backend --lines 0 | grep --line-buffered -E "\[Selfie Analysis\]|\[AI Concierge\]|GEMINI|OLLAMA|analyzeSelfie"
```

### 2. View Last 50 AI-Related Log Entries
```bash
pm2 logs backend --lines 200 | grep -E "Selfie Analysis|AI Concierge|GEMINI|OLLAMA|Gemini|Ollama" | tail -50
```

### 3. Check Startup Logs for Gemini Initialization
```bash
pm2 logs backend --lines 100 | grep -E "Environment|Gemini API initialized|GEMINI_API_KEY"
```

### 4. Monitor Errors Only
```bash
pm2 logs backend --err --lines 0 | grep --line-buffered -E "Selfie|Gemini|Ollama|AI|Concierge"
```

---

## If PM2 Process Name is Different

If your PM2 process has a different name, first check the process name:

```bash
pm2 list
```

Then replace `backend` in the commands above with your actual process name.

Common process names:
- `backend`
- `slotify-backend`
- `app`
- `server`

---

## Quick Reference

| What you want to see | Command |
|---------------------|---------|
| Real-time AI logs | `pm2 logs backend --lines 0 \| grep --line-buffered -i "selfie\|gemini\|ollama\|ai"` |
| Last 100 AI logs | `pm2 logs backend --lines 200 \| grep -i "selfie\|gemini\|ollama\|ai" \| tail -100` |
| Only errors | `pm2 logs backend --err --lines 100 \| grep -i "selfie\|gemini\|ollama\|ai"` |
| Save to file | `pm2 logs backend --lines 500 \| grep -i "selfie\|gemini\|ollama\|ai" > logs.txt` |
| Check Gemini init | `pm2 logs backend --lines 50 \| grep -E "Gemini API initialized\|GEMINI_API_KEY"` |

---

## Example Output

When you run these commands, you should see logs like:

```
[Selfie Analysis] Gemini API initialized successfully
[Selfie Analysis] GEMINI_API_KEY found: AIzaSy...abcd
[Selfie Analysis] ✅ genAI is initialized, proceeding with analysis
[Selfie Analysis] Successfully used model: gemini-1.5-flash-latest
```

Or errors like:

```
[Selfie Analysis] ❌ Gemini not configured: GEMINI_API_KEY not found in environment variables
[Selfie Analysis] GEMINI_API_KEY is NOT set in process.env
Both AI services failed:
Gemini: API key not configured. Add GEMINI_API_KEY to your .env file
```

