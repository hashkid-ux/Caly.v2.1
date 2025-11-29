# 🔐 SECRETS ROTATION GUIDE - PHASE 1

## ⚠️ CRITICAL: Secrets Were Exposed in Git

**Status:** `.env` file with ALL production credentials was in git history
**Action Taken:** Removed from git cache
**Next:** Generate new secrets and set in Railway

---

## 📋 SECRETS THAT NEED ROTATION (11 Total)

### 1. **JWT_SECRET** (Authentication Tokens)
```bash
# Current: dd249a48f443b487bcc0c8d3a6111f5e (EXPOSED - MUST CHANGE)
# New: Generate 32-char random value

# Windows PowerShell:
[System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::GetBytes(24)) | Select-Object -First 32

# Or use online generator: https://generate-random.org/base64/
# Requirements: 32+ alphanumeric + special characters
```

**Where it's used:**
- JWT token signing/verification
- All authenticated requests
- OAuth callback tokens

**Rotation Steps:**
1. Generate new 32-char secret
2. Set in Railway dashboard
3. Restart backend server
4. Old tokens remain valid for 24h (expiry time)

---

### 2. **SESSION_SECRET** (Session Encryption)
```bash
# Current: f2109feac234a3f339e8c5c28509dd6b (EXPOSED - MUST CHANGE)
# New: Generate 32-char random value

# Requirements: 32+ alphanumeric + special characters
```

**Where it's used:**
- Express session encryption
- Session data in PostgreSQL
- OAuth session management

**Rotation Steps:**
1. Generate new secret
2. Set in Railway
3. Existing sessions will be invalidated (users re-authenticate)
4. Restart backend

---

### 3. **ENCRYPTION_KEY** (Data Encryption)
```bash
# Current: 1c1KaU9.vi}SRiTk("5AfR0;V_G;,{kmhkmN\XP;[VT<?'vpIE.5-i!8~MJ'<c=o (EXPOSED)
# New: Generate 32-char random value

# Requirements: Exactly 32 bytes for AES-256
```

**Where it's used:**
- Shopify API credentials encryption
- Exotel credentials encryption
- Sensitive data in database

**Rotation Steps:**
1. Generate new key
2. Re-encrypt all stored credentials (migration needed)
3. Set in Railway
4. Restart backend

---

### 4. **OPENAI_API_KEY** (OpenAI API Access)
```bash
# Current: sk-proj-sUYeorA-...3BlbkFJ... (EXPOSED - REVOKE IMMEDIATELY)
# New: Create new at https://platform.openai.com/api-keys

# Steps:
# 1. Go to https://platform.openai.com/api-keys
# 2. Click "+ Create new secret key"
# 3. Copy the new key
# 4. Delete or revoke the old key
# 5. Update in Railway dashboard
```

**Impact:** 
- Real-time speech processing won't work without valid key
- All voice calls will fail

**Urgency:** 🔴 HIGHEST - Revoke immediately

---

### 5. **EXOTEL_API_KEY** (VoIP Credentials)
```bash
# Current: 5f6b48d2f2db5e8411ca236e8be4482bb61afce15976e3b2 (EXPOSED - REVOKE)
# New: Generate new at Exotel dashboard

# Steps:
# 1. Go to https://exotel.com/dashboard
# 2. Account Settings → API Settings
# 3. Regenerate API key
# 4. Update in Railway
```

**Impact:**
- Call routing won't work
- Webhooks will fail
- Recording upload blocked

**Urgency:** 🔴 HIGH - Revoke immediately

---

### 6. **EXOTEL_SID** (Exotel Account SID)
```bash
# Current: caly61 (Usually OK - phone-based identifier)
# Status: May need rotation if account compromised

# Check: Exotel dashboard for current SID
```

---

### 7. **EXOTEL_TOKEN** (Exotel Authentication)
```bash
# Current: fbccb678186edb95082db25cae4bd4002789807d2a615c83 (EXPOSED - REVOKE)
# New: Generate at Exotel dashboard

# Steps:
# 1. Exotel dashboard → API Settings
# 2. Regenerate authentication token
# 3. Update in Railway
```

**Urgency:** 🔴 HIGH - Revoke immediately

---

### 8. **WASABI_ACCESS_KEY_ID** (S3 Storage Access)
```bash
# Current: QLAAUYRMLG4CU4WDKPCZ (EXPOSED - REVOKE)
# New: Generate new at https://wasabi.com/console/

# Steps:
# 1. Go to https://wasabi.com/console/
# 2. Access Keys → Create New
# 3. Copy Access Key ID
# 4. Copy Secret Key
# 5. Delete old key pair
# 6. Update both in Railway
```

**Impact:**
- Recording upload fails
- Download pre-signed URLs fail
- Call recordings lost

**Urgency:** 🔴 HIGH

---

### 9. **WASABI_SECRET_ACCESS_KEY** (S3 Storage Secret)
```bash
# Current: mdEMzdULHPXit2beAAEWDBsgGz6y8pugZQDeeMW5 (EXPOSED - REVOKE)
# New: Generated with ACCESS_KEY_ID above
```

**Urgency:** 🔴 HIGH

---

### 10. **GOOGLE_CLIENT_SECRET** (OAuth Secret)
```bash
# Current: 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 (EXPOSED - REVOKE)
# New: Generate at Google Cloud Console

# Steps:
# 1. Go to https://console.developers.google.com/
# 2. OAuth 2.0 → Credentials
# 3. Edit OAuth consent screen
# 4. Delete old credential
# 5. Create new OAuth 2.0 Client ID
# 6. Copy new secret
# 7. Update in Railway
```

**Impact:**
- Google OAuth login fails
- Social authentication blocked

**Urgency:** 🔴 HIGH

---

### 11. **SENTRY_DSN** (Error Tracking)
```bash
# Current: https://aeb7ad5b75ffeb69653f7ef19eae7ded@... (EXPOSED)
# New: Generate new project at https://sentry.io/

# Steps:
# 1. Go to https://sentry.io/
# 2. Create new project or rotate existing
# 3. Copy new DSN
# 4. Update in Railway
```

**Impact:**
- Error tracking disabled
- Errors won't report to Sentry
- Less visibility into production issues

**Urgency:** 🟡 MEDIUM

---

## 🚀 IMMEDIATE ACTION REQUIRED

### Step 1: Generate All New Secrets

```powershell
# PowerShell script to generate secure random strings:

function Generate-RandomSecret {
    param([int]$Length = 32)
    $bytes = [System.Security.Cryptography.RNGCryptoServiceProvider]::GetBytes($Length)
    return [System.Convert]::ToBase64String($bytes).Substring(0, $Length)
}

# Generate all 3 random secrets
$jwtSecret = Generate-RandomSecret
$sessionSecret = Generate-RandomSecret
$encryptionKey = Generate-RandomSecret

Write-Host "JWT_SECRET=$jwtSecret"
Write-Host "SESSION_SECRET=$sessionSecret"
Write-Host "ENCRYPTION_KEY=$encryptionKey"
```

### Step 2: External APIs (Require Dashboard Access)

These MUST be rotated from their respective dashboards:
- ✅ OpenAI API Key - platform.openai.com/api-keys
- ✅ Exotel Credentials - exotel.com/dashboard
- ✅ Wasabi Keys - wasabi.com/console
- ✅ Google OAuth Secret - console.developers.google.com
- ✅ Sentry DSN - sentry.io

### Step 3: Set in Railway

1. Go to Railway dashboard: https://railway.app/
2. Select Caly backend project
3. Go to Variables section
4. Set all 11 variables with NEW values
5. Redeploy backend

### Step 4: Verify

```bash
# Check backend logs
npm run logs

# Should see: "✅ All production environment variables validated"
# Should see: "✅ Database initialization successful"
```

---

## ✅ Checklist

- [ ] Generated new JWT_SECRET (32 chars)
- [ ] Generated new SESSION_SECRET (32 chars)
- [ ] Generated new ENCRYPTION_KEY (32 chars)
- [ ] Revoked OpenAI API Key (create new)
- [ ] Revoked Exotel credentials (create new)
- [ ] Revoked Wasabi keys (create new)
- [ ] Revoked Google OAuth secret (create new)
- [ ] Updated Sentry DSN (optional)
- [ ] Set all 11 variables in Railway
- [ ] Redeployed backend
- [ ] Verified startup logs
- [ ] Tested authentication flow
- [ ] Tested voice call flow

---

## 📞 SUPPORT

**If you need help:**
1. Check Railway logs for startup errors
2. Verify all 11 variables are set
3. Ensure DATABASE_URL is correct
4. Restart backend after variable changes
5. Check .gitignore has .env (it does ✓)

**Deployed Successfully When:**
✅ Server listening on port 8080
✅ Database initialization successful
✅ All 54+ agents registered
✅ WebSocket server ready
✅ Health checks passing
