# 🚀 RAILWAY DEPLOYMENT - STEP-BY-STEP ENV SETUP

## 🔴 CRITICAL: Email Won't Work Without These!

Your application won't send emails until you add these variables to Railway.

---

## 📋 RAILWAY ENVIRONMENT VARIABLES

Copy-paste these into Railway dashboard:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=noreply@caly.com
SMTP_SECURE=false
NODE_ENV=production
```

---

## 🔑 HOW TO GET YOUR SMTP CREDENTIALS

### For Gmail (Recommended)

**⚠️ Important: Use App Password, NOT Your Regular Password**

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Select:** 
   - App: `Mail`
   - Device: `Windows Computer`
3. **Generate:** Click "Generate"
4. **Copy:** You'll see a 16-character password like: `abcd efgh ijkl mnop`
5. **Paste:** Into `SMTP_PASS` in Railway

**Note:** The spaces in the password are normal - copy them as-is!

### For SendGrid

1. Go to https://app.sendgrid.com/settings/api_keys
2. Create API key with "Mail Send" permission
3. Use these credentials:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxx...
   SMTP_FROM=noreply@yourdomain.com
   ```

### For Mailgun

1. Go to https://app.mailgun.com/app/domains
2. Find your domain
3. Use these credentials:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@yourdomain.mailgun.org
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.mailgun.org
   ```

### For AWS SES

1. Go to https://console.aws.amazon.com/ses/
2. Create SMTP credentials
3. Use these:
   ```
   SMTP_HOST=email-smtp.region.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=verified@yourdomain.com
   ```

---

## 🎯 STEP-BY-STEP RAILWAY SETUP

### Step 1: Open Railway Dashboard
```
https://railway.app/project/[YOUR-PROJECT-ID]
```

### Step 2: Go to Variables
1. Click your service (probably "backend")
2. Click "Variables" tab
3. You'll see a list of existing variables

### Step 3: Add Email Variables
Create these new variables (click "New Variable"):

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | Your 16-char app password |
| `SMTP_FROM` | `noreply@caly.com` |
| `SMTP_SECURE` | `false` |

### Step 4: Save Variables
- Click "Save" or press Enter after each
- All variables should appear in the list

### Step 5: Deploy
- Railway auto-deploys when variables change
- Wait 1-2 minutes for deployment
- Check the Deploy tab for "Active" status

---

## ✅ VERIFY SETUP

Once deployed, test your email:

### Test 1: Connection Test
```bash
curl https://YOUR_RAILWAY_URL/api/test/email-connection
```

Should return:
```json
{
  "success": true,
  "message": "✅ Email service is working!"
}
```

### Test 2: Send OTP
```bash
curl -X POST https://YOUR_RAILWAY_URL/api/test/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

Check your email - you should get the OTP!

### Test 3: Health Check
```bash
curl https://YOUR_RAILWAY_URL/api/test/health
```

Should return:
```json
{
  "success": true,
  "services": {
    "email": "✅ Working",
    "database": "✅ Working"
  }
}
```

---

## 🆘 TROUBLESHOOTING

### "Email service connection failed"
**Problem:** Wrong SMTP credentials
**Solution:** 
1. Double-check credentials
2. For Gmail: Use 16-char app password (not your regular password)
3. Check spelling and spaces
4. Redeploy after changes

### "Authentication failed"
**Problem:** SMTP_PASS incorrect
**Solution:**
1. Go to myaccount.google.com/apppasswords
2. Generate a NEW 16-char password
3. Update SMTP_PASS in Railway
4. Redeploy

### "Connection timeout"
**Problem:** SMTP_HOST or SMTP_PORT wrong
**Solution:**
1. Verify SMTP_HOST = `smtp.gmail.com`
2. Verify SMTP_PORT = `587`
3. Check Railway network allows outbound SMTP
4. Try alternative email provider

### "No variables showing"
**Problem:** Variables not saved
**Solution:**
1. Click each variable row
2. Make sure "Save" button is visible
3. Click Save after entering value
4. Refresh page to verify

---

## 📊 ENVIRONMENT VARIABLES REFERENCE

### Required Variables (for email to work)
| Variable | Example | Required |
|----------|---------|----------|
| `SMTP_HOST` | `smtp.gmail.com` | ✅ YES |
| `SMTP_PORT` | `587` | ✅ YES |
| `SMTP_USER` | `your-email@gmail.com` | ✅ YES |
| `SMTP_PASS` | `abcd efgh ijkl mnop` | ✅ YES |
| `SMTP_FROM` | `noreply@caly.com` | ⚠️ Optional (defaults to SMTP_USER) |
| `SMTP_SECURE` | `false` | ⚠️ Optional (defaults to false) |

### Optional Variables (other features)
| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `production` | Enable production optimizations |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `DATABASE_URL` | PostgreSQL connection | Database (usually auto-set) |

---

## 🎯 QUICK CHECKLIST

- [ ] Go to Railway dashboard
- [ ] Go to Variables tab
- [ ] Add SMTP_HOST = smtp.gmail.com
- [ ] Add SMTP_PORT = 587
- [ ] Add SMTP_USER = your-email@gmail.com
- [ ] Get 16-char app password from Gmail
- [ ] Add SMTP_PASS = 16-char password
- [ ] Add SMTP_FROM = noreply@caly.com
- [ ] Add SMTP_SECURE = false
- [ ] Wait for auto-deployment
- [ ] Run `/api/test/email-connection`
- [ ] Should see ✅ success message
- [ ] Run `/api/test/send-otp` with your email
- [ ] Check email inbox for OTP
- [ ] Test full registration flow

Once all checked ✅, email system is working!

---

## 📞 STILL NOT WORKING?

1. **Verify deployment succeeded:**
   - Check Railway "Activity" tab
   - Should show "Build" and "Deploy" completed

2. **Check Railway logs:**
   - Click "Logs" tab
   - Look for error messages
   - Share errors if asking for help

3. **Test manually:**
   - Use `/api/test/email-connection` endpoint
   - Check exact error message
   - Verify credentials one more time

4. **Alternative email provider:**
   - If Gmail not working, try SendGrid
   - SendGrid is very reliable for transactional emails
   - Easy to set up (see instructions above)

---

**That's it! 🎉 Email should now be working on Railway!**
