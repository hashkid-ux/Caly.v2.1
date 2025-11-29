# 🧪 EMAIL TESTING - QUICK COMMANDS

Replace `YOUR_DOMAIN` with your actual Railway domain (e.g., `https://caly-prod.up.railway.app`)

## Test 1: Health Check (All Systems)
```bash
curl -X GET "https://YOUR_DOMAIN/api/test/health"
```

Expected: `{"success": true, "services": {"email": "✅ Working", "database": "✅ Working"}}`

---

## Test 2: Email Connection Only
```bash
curl -X GET "https://YOUR_DOMAIN/api/test/email-connection"
```

Expected: `{"success": true, "message": "✅ Email service is working!"}`

---

## Test 3: Send Test OTP (No Email Required)
```bash
curl -X POST "https://YOUR_DOMAIN/api/test/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

Expected: `{"success": true, "otp": "123456", "messageId": "..."}`

Then **check your email** for the OTP!

---

## Test 4: Send Test OTP with Specific Code
```bash
curl -X POST "https://YOUR_DOMAIN/api/test/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","otp":"999999"}'
```

---

## Test 5: Full Registration Flow
```bash
# 1. Register new account
curl -X POST "https://YOUR_DOMAIN/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"SecurePass123!",
    "companyName":"Test Company",
    "firstName":"John",
    "lastName":"Doe",
    "phone":"9876543210"
  }'

# Response: Should show userId and clientId

# 2. Wait for email and get OTP from inbox

# 3. Verify email with OTP
curl -X POST "https://YOUR_DOMAIN/api/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","otp":"123456"}'

# Response: Should show "Email verified successfully"

# 4. Login
curl -X POST "https://YOUR_DOMAIN/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"SecurePass123!"}'

# Response: Should include accessToken ✅
```

---

## 🔴 If Email Tests Fail

### Email Connection Fails?
```
❌ "Cannot connect to SMTP server"
→ Check Railway .env variables:
  - SMTP_HOST set?
  - SMTP_PORT set?
  - SMTP_USER set?
  - SMTP_PASS set?
  - All values spelled correctly?
```

### Authentication Fails?
```
❌ "Authentication failed"
→ For Gmail:
  1. Go to myaccount.google.com/apppasswords
  2. Generate new 16-char password
  3. Update SMTP_PASS in Railway
  4. Redeploy
```

### Email Sent But Not Received?
```
❌ "Email not received"
→ Check:
  1. Spam/Promotions folder
  2. Email address correct?
  3. SMTP_FROM set correctly?
  4. Check email provider didn't block it
```

---

## 🆘 Debug Mode

Run this to see detailed error logs:
```bash
# Railway logs will show:
# - SMTP connection attempts
# - Auth failures
# - Email send results
# - Error messages
```

Check Railway logs for lines starting with:
- `✅ Email service connected`
- `❌ Email service connection failed`
- `✅ OTP email sent successfully`
- `❌ Failed to send OTP email`

---

## ✅ Verification Checklist

- [ ] SMTP vars set in Railway ✅
- [ ] `/api/test/health` returns success ✅
- [ ] `/api/test/email-connection` works ✅
- [ ] `/api/test/send-otp` receives email ✅
- [ ] Full registration flow works ✅
- [ ] User receives OTP in email ✅
- [ ] OTP verification succeeds ✅
- [ ] User can login after verification ✅

Once all ✅, email system is working!
