# Git Commit Message

## Title
fix: Resolve 401 Unauthorized by supporting dual authentication strategies (httpOnly cookies + Authorization headers)

## Description

### Problem
Users experienced 401 Unauthorized errors when accessing protected endpoints after password login or OAuth callback. The dashboard would fast-redirect but API calls would fail, preventing users from seeing any data.

### Root Cause
Backend authentication used two incompatible token strategies:
1. **Password Login:** Set httpOnly cookies (secure, not accessible to JavaScript)
2. **OAuth Callback:** Returned tokens in URL query parameters (parsed to localStorage)
3. **Auth Middleware:** ONLY checked Authorization header (ignored cookies)
4. **Token Refresh:** Expected httpOnly cookies (ignored Authorization headers)

Result: Password login set cookies but middleware expected Authorization header → 401.

### Solution
Made authentication layer support BOTH strategies simultaneously:
1. **Auth Middleware:** Check Authorization header OR httpOnly cookie
2. **Password Login:** Return tokens in JSON + set httpOnly cookies
3. **Token Refresh:** Accept refresh token from Authorization header, cookie, or body
4. **Axios Interceptor:** Add Authorization header from localStorage on all requests

### Changes

#### Backend
- **`auth/authMiddleware.js`** (Lines 8-35)
  - Dual token extraction: Authorization header OR httpOnly cookie
  - Ensures both password login (cookie-based) and OAuth (header-based) work

- **`routes/auth.js` - POST /api/auth/login** (Lines ~370-410)
  - Return tokens in JSON response body (consistency with OAuth)
  - Continue setting httpOnly cookies (backward compatibility)

- **`routes/auth.js` - POST /api/auth/refresh** (Lines ~420-490)
  - Accept refresh token from 3 sources: header, cookie, or body
  - Return new tokens in JSON response for frontend storage

#### Frontend
- **`utils/axiosInstance.js` - Request Interceptor** (Lines ~27-40)
  - Add Authorization header with localStorage token to all requests
  - Ensures consistent auth header presence for backend

- **`utils/axiosInstance.js` - Response Interceptor** (Lines ~85-130)
  - Send refreshToken via Authorization header (OAuth flow support)
  - Save new tokens from response to localStorage
  - Update Authorization header with new token before retry

### Impact
- ✅ Password login now works (auth middleware accepts cookies)
- ✅ OAuth still works (auth middleware accepts Authorization headers)
- ✅ Token refresh works for both flows
- ✅ No more 401 Unauthorized errors on protected endpoints
- ✅ Backward compatible (existing sessions unaffected)
- ✅ No database migrations required
- ✅ No new dependencies

### Testing
- Manual: Password login → API call → verify 200 OK (not 401)
- Manual: OAuth callback → API call → verify 200 OK
- Manual: Token expiry → auto-refresh → verify request succeeds
- Integration: Full user flow (register → verify → onboarding → dashboard)

### Files Changed
1. `Backend/auth/authMiddleware.js`
2. `Backend/routes/auth.js` (2 endpoints)
3. `Frontend/src/utils/axiosInstance.js` (2 interceptors)

### Deployment
- No database migrations
- No breaking API changes
- No environment variable changes
- Safe to deploy immediately after testing

### Fixes
- Closes: 401 Unauthorized errors on protected endpoints
- Fixes: Password login not creating valid session
- Fixes: OAuth token refresh failures
- Related: Fast redirect to dashboard hiding errors
