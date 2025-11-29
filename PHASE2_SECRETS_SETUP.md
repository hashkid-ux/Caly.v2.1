# ✅ PHASE 2: SECRETS GENERATION & RAILWAY SETUP

**Status:** Phase 1 COMPLETE ✅ - .env removed from git
**Current Phase:** Phase 2 - Generate & Set New Secrets
**Timeline:** ~40 minutes total

---

## 📋 YOUR NEW SECRETS (Generated Nov 29, 2025)

**⚠️ SAVE THESE IMMEDIATELY - These are ONE-TIME only!**

### 3 Auto-Generated Secrets (Ready to Use)

```
JWT_SECRET=fZnFwZgqZHy44/RBWpREaJ3ErKL9MbRN
SESSION_SECRET=fmTCCFHfiK2iGGeSmrSDCFNVmfjUI4K+
ENCRYPTION_KEY=HrSrNgihQwwbvWAQq3uYZ/6/Ni6QIh5v
```

### 8 External API Secrets (Must Create Manually)

These must be created/rotated in their respective dashboards:

---

## 🚀 STEP-BY-STEP: SET SECRETS IN RAILWAY

### Prerequisites:
- ✅ Railway account (https://railway.app)
- ✅ Caly backend project created
- ✅ PostgreSQL database linked

### Steps:

#### 1. Access Railway Dashboard

```
1. Go to https://railway.app/dashboard
2. Select "Caly" project
3. Click on "Backend" service
4. Click "Variables" tab
```

#### 2. Set the 3 Generated Secrets

In Railway Variables section, add:

```
KEY: JWT_SECRET
VALUE: fZnFwZgqZHy44/RBWpREaJ3ErKL9MbRN

KEY: SESSION_SECRET
VALUE: fmTCCFHfiK2iGGeSmrSDCFNVmfjUI4K+

KEY: ENCRYPTION_KEY
VALUE: HrSrNgihQwwbvWAQq3uYZ/6/Ni6QIh5v
```

#### 3. Verify DATABASE_URL Exists

```
KEY: DATABASE_URL
VALUE: postgresql://user:password@host:port/caly_db

⚠️  This should already be set by Railway PostgreSQL plugin
    If missing, copy from PostgreSQL plugin connection string
```

#### 4. Set FRONTEND_URL

```
KEY: FRONTEND_URL
VALUE: https://caly-omega.vercel.app

(or your actual Vercel deployment URL)
```

#### 5. Set NODE_ENV

```
KEY: NODE_ENV
VALUE: production
```

---

## 🔑 EXTERNAL APIS: Rotation Guide

### 1️⃣ OpenAI API Key

**Current Status:** EXPOSED - MUST REVOKE

**Revoke & Create New:**

```
1. Go to https://platform.openai.com/api-keys
2. Click old key → Delete it
3. Click "+ Create new secret key"
4. Copy new key
5. In Railway, set:

KEY: OPENAI_API_KEY
VALUE: sk-proj-xxxx... (new key)
```

⏱️ Time: ~2 minutes
🔴 Priority: HIGHEST - Revoke immediately

---

### 2️⃣ Exotel VoIP Credentials

**Current Status:** EXPOSED - MUST REVOKE

**Revoke & Create New:**

```
1. Go to https://exotel.com/dashboard
2. Account Settings → API Settings
3. Regenerate API Key
4. Copy new credentials
5. In Railway, set:

KEY: EXOTEL_API_KEY
VALUE: (new API key)

KEY: EXOTEL_SID
VALUE: (your account SID)

KEY: EXOTEL_TOKEN
VALUE: (regenerated token)

KEY: EXOTEL_WEBHOOK_SECRET
VALUE: (your webhook secret)
```

⏱️ Time: ~5 minutes
🔴 Priority: HIGH - Needed for calls

---

### 3️⃣ Wasabi S3 Storage Credentials

**Current Status:** EXPOSED - MUST REVOKE

**Revoke & Create New:**

```
1. Go to https://wasabi.com/console
2. Access Keys → Create New Key Pair
3. Verify new credentials
4. Delete old key pair
5. In Railway, set:

KEY: WASABI_ACCESS_KEY_ID
VALUE: (new access key)

KEY: WASABI_SECRET_ACCESS_KEY
VALUE: (new secret key)

KEY: WASABI_REGION
VALUE: us-west-1

KEY: WASABI_BUCKET_NAME
VALUE: caly-recordings
```

⏱️ Time: ~5 minutes
🔴 Priority: HIGH - Needed for recording storage

---

### 4️⃣ Google OAuth Credentials

**Current Status:** EXPOSED - MUST REVOKE

**Revoke & Create New:**

```
1. Go to https://console.developers.google.com/
2. OAuth 2.0 → Credentials
3. Delete old credential
4. Create new "OAuth 2.0 Client ID" (Web)
5. Copy new Client Secret
6. In Railway, set:

KEY: GOOGLE_CLIENT_ID
VALUE: (new client ID)

KEY: GOOGLE_CLIENT_SECRET
VALUE: (new secret)

KEY: GOOGLE_CALLBACK_URL
VALUE: https://your-backend-domain.com/api/auth/google/callback
```

⏱️ Time: ~5 minutes
🔴 Priority: HIGH - Needed for social login

---

### 5️⃣ Sentry Error Tracking (Optional)

**Current Status:** EXPOSED - Can update or create new

**Create New Project or Update:**

```
1. Go to https://sentry.io
2. Create new project or use existing
3. Copy DSN
4. In Railway, set:

KEY: SENTRY_DSN
VALUE: https://xxxx@xxxx.ingest.sentry.io/xxxxx
```

⏱️ Time: ~3 minutes
🟡 Priority: MEDIUM - Optional

---

## 📋 COMPLETE RAILWAY VARIABLES CHECKLIST

Copy this and fill in all values:

```
✅ REQUIRED - Auto-Generated (Copy from above):
DATABASE_URL = postgresql://...
JWT_SECRET = fZnFwZgqZHy44/RBWpREaJ3ErKL9MbRN
SESSION_SECRET = fmTCCFHfiK2iGGeSmrSDCFNVmfjUI4K+
ENCRYPTION_KEY = HrSrNgihQwwbvWAQq3uYZ/6/Ni6QIh5v

✅ REQUIRED - Deployment Settings:
NODE_ENV = production
PORT = 8080
FRONTEND_URL = https://caly-omega.vercel.app

✅ REQUIRED - External APIs (Create/Rotate manually):
OPENAI_API_KEY = sk-proj-...
EXOTEL_API_KEY = ...
EXOTEL_SID = ...
EXOTEL_TOKEN = ...
WASABI_ACCESS_KEY_ID = ...
WASABI_SECRET_ACCESS_KEY = ...
WASABI_REGION = us-west-1
WASABI_BUCKET_NAME = caly-recordings
GOOGLE_CLIENT_ID = ...
GOOGLE_CLIENT_SECRET = ...
GOOGLE_CALLBACK_URL = https://your-backend-domain.com/api/auth/google/callback

✅ OPTIONAL - Monitoring:
SENTRY_DSN = https://...@sentry.io/...
```

---

## ✅ VERIFICATION STEPS

After setting all variables in Railway:

### 1. Redeploy Backend

```
Railway Dashboard → Backend Service → Deploy
```

### 2. Check Startup Logs

```
You should see:
✅ All production environment variables validated
✅ Database connection verified
✅ Schema initialization successful
✅ 13 migrations applied
✅ 54+ agents registered
✅ WebSocket server ready
✅ Graceful shutdown handlers attached
```

### 3. Test Health Endpoint

```bash
curl https://your-backend-domain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "caly-voice-agent",
  "timestamp": "2025-11-29T...",
  "database": true,
  "agents": { "total": 54, "registered": 54 }
}
```

### 4. Monitor for Errors

```
Railway Dashboard → Logs
Should NOT see:
❌ JWT_SECRET not configured
❌ DATABASE_URL missing
❌ Cannot connect to database
```

---

## 🔄 Recommended Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Generate secrets (DONE) | 1 min | ✅ |
| 2 | Set 3 auto-generated secrets in Railway | 5 min | ⏳ |
| 3 | Rotate OpenAI API key | 5 min | ⏳ |
| 4 | Rotate Exotel credentials | 5 min | ⏳ |
| 5 | Rotate Wasabi keys | 5 min | ⏳ |
| 6 | Rotate Google OAuth secret | 5 min | ⏳ |
| 7 | Redeploy backend | 2 min | ⏳ |
| 8 | Verify startup logs | 2 min | ⏳ |
| 9 | Test health endpoint | 2 min | ⏳ |
| **TOTAL** | | **32 min** | |

---

## 🚨 TROUBLESHOOTING

### Issue: "JWT_SECRET not configured"

**Fix:**
1. Check Railway Variables tab
2. Ensure JWT_SECRET is set exactly: `fZnFwZgqZHy44/RBWpREaJ3ErKL9MbRN`
3. Redeploy backend
4. Check logs again

### Issue: "Cannot connect to database"

**Fix:**
1. Verify DATABASE_URL is set in Railway
2. Check PostgreSQL plugin is still running
3. Ensure password hasn't changed
4. Test connection: `psql $DATABASE_URL`

### Issue: "OpenAI API error"

**Fix:**
1. Verify OPENAI_API_KEY is set correctly
2. Check API key isn't revoked
3. Ensure key has correct permissions
4. Check usage/quota at platform.openai.com

### Issue: "Cannot upload recordings to Wasabi"

**Fix:**
1. Verify WASABI_ACCESS_KEY_ID is correct
2. Verify WASABI_SECRET_ACCESS_KEY is correct
3. Ensure bucket exists in Wasabi
4. Check bucket name matches: caly-recordings

### Issue: "Google OAuth not working"

**Fix:**
1. Verify GOOGLE_CLIENT_ID matches dashboard
2. Verify GOOGLE_CLIENT_SECRET is correct
3. Verify GOOGLE_CALLBACK_URL is exact
4. Check redirect URIs in Google Console

---

## 📞 NEXT STEPS

After Phase 2 complete (secrets set in Railway):

### Phase 3: Execute Database Migrations
- Run 13 pending migrations
- Register 54+ agents
- Create all required tables

### Phase 4: Deploy to Railway
- Backend deployed with new secrets
- WebSocket server ready
- Health checks passing

### Phase 5: Deploy to Vercel
- Frontend deployed
- Connected to Railway backend
- Testing begins

### Phase 6: Production Testing
- Authentication flow
- Voice call flow
- Recording upload
- Multi-tenancy validation

---

## ✅ Phase 2 Complete When:

- [ ] 3 auto-generated secrets set in Railway
- [ ] DATABASE_URL verified in Railway
- [ ] All 8 external API secrets rotated and set
- [ ] Backend redeployed
- [ ] Health endpoint returns 200 OK
- [ ] No JWT/database configuration errors in logs
- [ ] Ready for Phase 3 (migrations)

**Estimated Time to Phase 3 Ready: ~40 minutes**

---

**Ready to proceed? Start with OpenAI API key rotation!** 🚀
