# 🚀 Caly Voice Agent - Setup Guide

## Phase 1: Foundation Setup (Complete!)

This guide will help you get Caly up and running step by step.

---

## 📁 Project Structure

```
caly-voice-agent/
├── server.js              # Main server entry point
├── package.json           # Dependencies
├── .env                   # Environment variables (create from .env.example)
├── db/
│   └── postgres.js        # Database connection and queries
├── routes/
│   ├── exotel.js         # Exotel webhook handlers
│   ├── calls.js          # Calls API endpoints
│   ├── actions.js        # Actions API endpoints
│   └── analytics.js      # Analytics and KPIs
├── utils/
│   └── logger.js         # Winston logger
├── logs/                 # Log files (auto-created)
├── asr/                  # ASR integrations (Phase 2)
├── llm/                  # LLM session manager (Phase 2)
├── tts/                  # TTS streaming (Phase 2)
├── backend/              # Shopify/Shiprocket connectors (Phase 3)
└── storage/              # Wasabi uploader (Phase 4)
```

---

## ✅ Step 1: Prerequisites

Install the following on your machine:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Download](https://www.postgresql.org/download/))
- **Redis** (for job queues) ([Download](https://redis.io/download/))
- **Git**

---

## ✅ Step 2: Database Setup

### 2.1 Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE caly_db;

# Exit
\q
```

### 2.2 Run Database Schema

```bash
# Run the schema.sql file you received
psql -U postgres -d caly_db -f schema.sql
```

This will create all tables: `calls`, `actions`, `entities`, `clients`, `audit_logs`

---

## ✅ Step 3: Project Setup

### 3.1 Clone/Create Project Directory

```bash
mkdir caly-voice-agent
cd caly-voice-agent
```

### 3.2 Initialize Node.js Project

```bash
# Copy the package.json content provided
npm install
```

### 3.3 Create Environment File

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required values to fill in `.env`:**

```bash
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/caly_db

# Exotel (get from Exotel dashboard)
EXOTEL_API_KEY=your_key
EXOTEL_API_TOKEN=your_token
EXOTEL_SID=your_sid
EXOTEL_PHONE_NUMBER=+911234567890
EXOTEL_WEBHOOK_BASE_URL=https://your-domain.com  # Use ngrok for testing

# OpenAI
OPENAI_API_KEY=sk-your-key-here
```

### 3.4 Create Project Files

Create the following files with the content I provided:

```
server.js
db/postgres.js
utils/logger.js
routes/exotel.js
routes/calls.js
routes/actions.js
routes/analytics.js
```

---

## ✅ Step 4: Exotel Setup

### 4.1 Sign Up for Exotel

1. Go to [Exotel](https://exotel.com/)
2. Sign up and verify your account
3. Buy a phone number (Indian number with voice support)

### 4.2 Configure Webhooks

In Exotel dashboard:

1. Go to **App Settings**
2. Set **App URL** to: `https://your-domain.com/webhooks/exotel/call-start`
3. Enable **Call Recording**
4. Set **Recording Webhook** to: `https://your-domain.com/webhooks/exotel/recording`

### 4.3 Get API Credentials

From Exotel dashboard, copy:
- API Key
- API Token
- SID (Account ID)
- Your phone number

Add these to your `.env` file.

---

## ✅ Step 5: Local Testing Setup

### 5.1 Install ngrok (for webhook testing)

```bash
# Install ngrok
npm install -g ngrok

# Or download from https://ngrok.com/
```

### 5.2 Start Redis

```bash
# Start Redis server
redis-server
```

### 5.3 Start Caly Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

You should see:
```
🚀 Caly server running on 0.0.0.0:3000
📞 Exotel webhooks ready
🎧 WebSocket audio server on ws://0.0.0.0:3000/audio
✅ Database connection successful
```

### 5.4 Expose Local Server with ngrok

```bash
# In a new terminal
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update:
- Your `.env` file (`EXOTEL_WEBHOOK_BASE_URL`)
- Exotel dashboard webhook URLs

---

## ✅ Step 6: Test the Setup

### 6.1 Test Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T...",
  "service": "caly-voice-agent",
  "version": "1.0.0"
}
```

### 6.2 Test Database Connection

Check server logs for:
```
✅ Database connection successful
```

### 6.3 Test Exotel Integration

**Make a test call:**
1. Call your Exotel number from your phone
2. You should hear: "Namaste, main Caly hoon..."
3. Check server logs for webhook events
4. Check database: `SELECT * FROM calls;`

---

## ✅ Step 7: Verify Database Records

```bash
# Connect to database
psql -U postgres -d caly_db

# Check calls table
SELECT * FROM calls;

# Check clients table
SELECT * FROM clients;

# Exit
\q
```

---

## 🎯 What's Working Now (Phase 1 Complete!)

✅ Database schema with all tables  
✅ Express server with WebSocket support  
✅ Exotel webhook handlers (call start, end, recording)  
✅ Call logging to database  
✅ Basic API endpoints (calls, actions, analytics)  
✅ Winston logging system  
✅ Health checks and monitoring  

---

## 🔜 Next Steps (Phase 2 - Audio Pipeline)

Coming next:
1. ASR integration (Deepgram/Whisper)
2. OpenAI Realtime API connection
3. TTS output streaming
4. Audio flow management

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
sudo service postgresql restart
```

### Exotel Webhooks Not Working
- Make sure ngrok is running
- Check that webhook URLs in Exotel dashboard match ngrok URL
- Check server logs for incoming requests

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## 📚 Useful Commands

```bash
# View logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# Check database size
psql -U postgres -d caly_db -c "SELECT pg_size_pretty(pg_database_size('caly_db'));"

# List all calls
curl http://localhost:3000/api/calls

# Get call by ID
curl http://localhost:3000/api/calls/<call-id>

# View analytics
curl http://localhost:3000/api/analytics/kpis
```

---

## 📞 Support

If you encounter issues:
1. Check server logs: `logs/combined.log`
2. Verify `.env` configuration
3. Test database connection
4. Ensure all services are running (PostgreSQL, Redis)

---

**Phase 1 Status: ✅ COMPLETE**

Ready to move to Phase 2! 🚀