# Phase 2 - High Priority Fixes: Preparation

**Status:** Ready to implement
**Estimated Timeline:** 5-6 hours total
**Priority Level:** HIGH - Should be completed this week

## Overview

Phase 2 addresses 4 high-priority issues that improve security, UX, and compliance. These are not blockers for MVP deployment but should be done before going to production with multiple users.

---

## Fix 2.1: Refresh Token Blacklist on Logout

**Issue:** When users logout, their refreshToken is still valid. If an attacker gets the token, they can still authenticate indefinitely.

**Current Behavior:**
```javascript
// logout() just clears localStorage
localStorage.removeItem('refreshToken');
// But token is still valid on backend - attacker could use it!
```

**Solution:** Implement token blacklist table

**Database Migration (006):**
```sql
CREATE TABLE IF NOT EXISTS refresh_token_blacklist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_jti VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_blacklist_expires_at 
ON refresh_token_blacklist(expires_at);
```

**Backend Changes (auth.js):**
```javascript
// In logout endpoint
const { refreshToken } = req.body;
if (refreshToken) {
  const decoded = JWTUtils.verifyToken(refreshToken);
  await db.query(
    'INSERT INTO refresh_token_blacklist (user_id, token_jti, expires_at) VALUES ($1, $2, $3)',
    [decoded.userId, decoded.jti, new Date(decoded.exp * 1000)]
  );
}
```

**Backend Changes (jwtUtils.js):**
```javascript
// Include JTI (JWT ID) in token for blacklist tracking
static signRefreshToken(payload) {
  const jti = `${payload.userId}-${Date.now()}`;
  return jwt.sign(
    { ...payload, jti },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// Check blacklist on verify
static verifyRefreshToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  // Check if in blacklist
  const blacklisted = db.query(
    'SELECT id FROM refresh_token_blacklist WHERE token_jti = $1',
    [decoded.jti]
  );
  if (blacklisted.rows.length > 0) {
    throw new Error('Token has been revoked');
  }
  return decoded;
}
```

**Files to Modify:**
- `Backend/db/migrations/006_add_refresh_token_blacklist.sql` (NEW)
- `Backend/auth/jwtUtils.js` - Add JTI and blacklist check
- `Backend/routes/auth.js` - Add blacklist on logout

**Effort:** ~1.5 hours

---

## Fix 2.2: Password Reset Flow

**Issue:** Users with email/password accounts have no way to reset forgotten passwords.

**Current State:** No password reset endpoints exist

**Solution:** Implement full password reset flow

**Database Migration (007):**
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reset_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_expires_at 
ON password_reset_tokens(expires_at);
```

**Backend Endpoints (auth.js):**

1. **POST /api/auth/forgot-password**
```javascript
// Request password reset email
// Body: { email }
// Response: { message: 'Reset link sent to email' }

// Flow:
// 1. Find user by email
// 2. Generate secure reset token (crypto.randomBytes(32))
// 3. Save token with 1h expiry
// 4. Send email with reset link
// 5. Return success (don't reveal if email exists for security)
```

2. **POST /api/auth/reset-password**
```javascript
// Use reset token to set new password
// Body: { email, reset_token, new_password }
// Response: { message: 'Password reset successful' }

// Flow:
// 1. Find token and verify not expired
// 2. Validate new_password strength
// 3. Hash new password
// 4. Update users.password_hash
// 5. Mark token as used
// 6. Optionally send confirmation email
```

**Frontend Pages:**
- `Frontend/src/pages/ForgotPasswordPage.jsx` - Email input, send reset link
- `Frontend/src/pages/ResetPasswordPage.jsx` - Reset token input, new password form

**Files to Modify:**
- `Backend/db/migrations/007_add_password_reset_tokens.sql` (NEW)
- `Backend/routes/auth.js` - Add /forgot-password and /reset-password
- `Backend/utils/email.js` - Add password reset email template
- `Frontend/src/pages/ForgotPasswordPage.jsx` (NEW)
- `Frontend/src/pages/ResetPasswordPage.jsx` (NEW)
- `Frontend/src/App.js` - Add routes

**Effort:** ~2 hours

---

## Fix 2.3: Rate Limiting on Registration & Verification

**Issue:** No rate limiting on email verification endpoints allows brute-force OTP attacks and spam registration.

**Current State:** loginRateLimiter exists but not applied to /register or /verify-email

**Solution:** Add rate limiters to auth endpoints

**Backend Changes (middleware/rateLimiter.js):**
```javascript
const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 registration attempts per IP
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  message: 'Too many registration attempts, please try again later'
});

const verifyEmailRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 5,  // 5 verification attempts per email
  keyGenerator: (req) => req.body.email || req.ip,
  message: 'Too many verification attempts, please try again later'
});

const resendOtpRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,  // 2 minutes
  max: 3,  // 3 resend attempts
  keyGenerator: (req) => req.body.email || req.ip,
  message: 'Please wait before requesting another OTP'
});
```

**Backend Changes (server.js):**
```javascript
// Apply rate limiters to auth endpoints
app.use('/api/auth/register', registerRateLimiter);
app.use('/api/auth/verify-email', verifyEmailRateLimiter);
app.use('/api/auth/resend-otp', resendOtpRateLimiter);
```

**Files to Modify:**
- `Backend/middleware/rateLimiter.js` - Add new limiters
- `Backend/server.js` - Apply limiters

**Effort:** ~1 hour

---

## Fix 2.4: Fix is_active Timing Issue

**Issue:** Users set `is_active=true` immediately on registration, before OTP verification. This means unverified users are counted as active.

**Current Code (auth.js - registration):**
```javascript
// WRONG: Sets is_active=true immediately
const user = await db.query(
  `INSERT INTO users (email, password_hash, client_id, role, is_active, ...)
   VALUES ($1, $2, $3, $4, true, ...)`,  // ❌ Should be false!
  [email, hashedPassword, client.id, 'admin']
);
```

**Solution:** Set is_active=false on registration, only set to true after OTP verification

**Backend Changes (auth.js):**

1. **In registration endpoint:**
```javascript
const user = await db.query(
  `INSERT INTO users (email, password_hash, client_id, role, is_active, ...)
   VALUES ($1, $2, $3, $4, false, ...)`,  // ✅ false until verified
  [email, hashedPassword, client.id, 'admin']
);

// Also set clients.active = false
await db.query(
  'UPDATE clients SET active = false WHERE id = $1',
  [client.id]
);
```

2. **In verify-email endpoint (after OTP check):**
```javascript
// After OTP verified:
await db.query(
  'UPDATE users SET is_active = true WHERE id = $1',
  [user.id]
);

// Also activate client
await db.query(
  'UPDATE clients SET active = true WHERE id = $1',
  [user.client_id]
);
```

**Files to Modify:**
- `Backend/routes/auth.js` - Update registration and verify-email endpoints

**Effort:** ~30 minutes

---

## Combined Phase 2 Implementation Plan

### Week Structure:
- **Day 1:** Fix 2.1 (Blacklist) - 1.5 hours
- **Day 2:** Fix 2.2 (Password Reset) - 2 hours  
- **Day 3:** Fix 2.3 (Rate Limiting) - 1 hour
- **Day 3:** Fix 2.4 (is_active timing) - 0.5 hours
- **Buffer:** 1 hour for testing and fixes

**Total Time:** 6-7 hours
**Execution Order:** 2.1 → 2.2 → 2.3 → 2.4 (order doesn't matter much as they're independent)

---

## Testing Phase 2 Fixes

### Fix 2.1 Testing:
```bash
1. User logs in
2. Get refreshToken value
3. User logs out (token should be blacklisted)
4. Try to use refreshToken to get new access token
✓ Should fail with "Token has been revoked"
```

### Fix 2.2 Testing:
```bash
1. Click "Forgot Password"
2. Enter email
3. Check email for reset link
4. Click reset link (verify token is valid)
5. Enter new password
6. Login with new password
✓ Should successfully login
```

### Fix 2.3 Testing:
```bash
1. Try to register 6 times from same IP
✓ 6th attempt should get rate limit error
1. Try to verify OTP 6 times
✓ 6th attempt should get rate limit error
```

### Fix 2.4 Testing:
```bash
1. Register new account
✓ is_active should be false
✓ clients.active should be false
1. Verify email with OTP
✓ is_active should be true
✓ clients.active should be true
```

---

## Rollback Plan

Each fix should be independently deployable. If one breaks:

```bash
# Revert specific commit
git revert <commit-hash>

# Or rollback entire Phase 2
git revert <phase2-start-hash>
```

Previous stable: eb8d1fc (Phase 1)

---

## Security Improvements from Phase 2

✅ **Session Management:**
- Refresh tokens can be revoked (logout is truly final)
- Password reset with secure tokens

✅ **Account Security:**
- Users can recover forgotten passwords
- is_active properly reflects email verification status

✅ **Abuse Prevention:**
- Rate limits prevent brute-force attacks
- Rate limits prevent spam registration

---

## Dependencies Between Phases

```
Phase 1 (Complete) ✅
    ↓
Phase 2 (Next) ← Ready to start
    ↓
Phase 3 (Medium Priority)
    ↓
Phase 4 (Nice to have)
```

Phase 2 can start immediately - no dependencies on Phase 1 completion.

---

## Monitoring During Phase 2

Watch for:
- Rate limit effectiveness (are legitimate users getting blocked?)
- Token blacklist performance (blacklist grows over time)
- Email delivery (password reset emails sent successfully)
- User signup flow (is_active changes don't break onboarding)

---

**Status:** Ready to implement
**Approval:** Awaiting user confirmation to proceed
**Estimated Completion:** ~6 hours
