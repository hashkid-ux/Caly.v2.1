# server.js - Code Analysis

## Overview
Main Express server entry point that orchestrates HTTP, WebSocket, and database connections. Handles Exotel webhook routing and audio session management.

---

## ✅ GOOD SIDES

### 1. **Proper Middleware Configuration**
- ✅ Security headers via `helmet()`
- ✅ CORS properly configured
- ✅ Multiple body parser types (JSON, form-data, raw audio)
- ✅ Request logging middleware for debugging

### 2. **WebSocket Audio Streaming**
- ✅ Proper connection validation (requires `callId` parameter)
- ✅ Call existence verification before processing
- ✅ Graceful error handling on connection setup
- ✅ Event-based architecture for audio output and actions
- ✅ Proper cleanup on WebSocket close

### 3. **Error Handling**
- ✅ Global error middleware catches unhandled errors
- ✅ Proper HTTP status codes returned
- ✅ Different error messages for development vs production
- ✅ 404 handler implemented

### 4. **Graceful Shutdown**
- ✅ SIGTERM and SIGINT handlers for clean shutdown
- ✅ Server close, WebSocket close, and database close in proper order
- ✅ Proper logging of shutdown events

### 5. **Environment Configuration**
- ✅ Reads PORT from environment (Railway compatible)
- ✅ Reads HOST from environment (Railway compatible)
- ✅ Defaults to sensible values (3000, 0.0.0.0)
- ✅ Health check endpoint for monitoring

### 6. **Code Organization**
- ✅ Clear separation of concerns (routes, handlers)
- ✅ Meaningful comments for each section
- ✅ Consistent logging patterns

---

## ❌ BAD SIDES / ISSUES

### 1. **Memory Leak Risk in WebSocket Handlers**
- ❌ **Problem**: Event listeners on `sessionManager` never removed
- ❌ **Impact**: Multiple connections to same callId cause listener accumulation
- ❌ **Example**:
  ```javascript
  // This listener is added but never removed
  sessionManager.on('audio_output', (data) => {
    if (data.callId === callId && ws.readyState === WebSocket.OPEN) {
      ws.send(data.audioData);
    }
  });
  ```
- ⚠️ **Risk Level**: MEDIUM - Can leak memory under high concurrency

### 2. **No Session Timeout Handling**
- ❌ **Problem**: Sessions that crash silently are never cleaned up
- ❌ **Impact**: Orphaned sessions consume memory indefinitely
- ❌ **Missing**: Timeout mechanism for hung connections
- ⚠️ **Risk Level**: HIGH - Can cause OOM after hours of operation

### 3. **No Connection Pooling / Reuse**
- ❌ **Problem**: New database connection per WebSocket connection
- ❌ **Impact**: Under load (100+ concurrent calls), pool exhausts
- ❌ **Missing**: Connection pooling strategy in `sessionManager`
- ⚠️ **Risk Level**: MEDIUM-HIGH - Scalability bottleneck

### 4. **Race Condition in Session Creation**
- ❌ **Problem**: 
  ```javascript
  await sessionManager.createSession(callId, call);
  
  ws.on('message', async (data) => { ... });
  ```
- ❌ **Issue**: If message arrives before createSession completes, it's lost
- ❌ **Missing**: Async queue or buffer for early messages
- ⚠️ **Risk Level**: MEDIUM - Rare but can cause audio loss

### 5. **No Input Validation**
- ❌ **Problem**: `callId` from URL is used directly without validation
- ❌ **Missing**: UUID format validation, SQL injection checks
- ❌ **Security Risk**: Could allow invalid callIds into system
- ⚠️ **Risk Level**: LOW-MEDIUM (depends on db validation)

### 6. **Mock Action Result Implementation**
- ❌ **Problem**:
  ```javascript
  const mockResult = {
    success: true,
    data: { status: 'in_transit', eta: '2025-11-24T18:00:00+05:30' }
  };
  ```
- ❌ **Issue**: Hardcoded mock data in production code
- ❌ **Missing**: Real action executor or error handling
- ⚠️ **Risk Level**: HIGH - Will return false data to users

### 7. **No Request Timeout**
- ❌ **Problem**: Long-running requests can hang indefinitely
- ❌ **Missing**: Timeout middleware or connection timeout handling
- ⚠️ **Risk Level**: MEDIUM - Can accumulate zombie connections

### 8. **Insufficient Logging in Critical Paths**
- ❌ **Problem**: WebSocket message handling has minimal logging
- ❌ **Missing**: Audio chunk size, processing duration, error details
- ⚠️ **Risk Level**: LOW - Makes debugging harder

### 9. **No Backpressure Handling**
- ❌ **Problem**: If sessionManager is slow, messages accumulate
- ❌ **Missing**: Backpressure awareness, buffer size checks
- ⚠️ **Risk Level**: MEDIUM - Can cause memory spike

### 10. **Database Connection Not Used in WebSocket Handler**
- ❌ **Problem**: `const call = await db.calls.getById(callId)` - what if DB is down?
- ❌ **Missing**: Retry logic, fallback mechanism
- ⚠️ **Risk Level**: MEDIUM - Single DB failure kills all calls

---

## 🔧 RECOMMENDATIONS

### High Priority (P0)
1. **Add event listener cleanup**
   ```javascript
   const audioListener = (data) => { ... };
   sessionManager.on('audio_output', audioListener);
   ws.on('close', () => {
     sessionManager.removeListener('audio_output', audioListener);
   });
   ```

2. **Add session timeout**
   ```javascript
   const sessionTimeout = setTimeout(() => {
     logger.warn('Session timeout', { callId });
     ws.close();
   }, 30 * 60 * 1000); // 30 minutes
   ```

3. **Implement real action executor** (not mock results)

### Medium Priority (P1)
4. Add input validation for callId (UUID format)
5. Add request timeout middleware
6. Add database error retry logic
7. Add message buffering for early arrivals

### Low Priority (P2)
8. Enhanced logging in WebSocket handler
9. Add backpressure monitoring
10. Add connection metrics/telemetry

---

## 📊 Railways Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Environment Variables | ✅ Good | Reads PORT/HOST from env |
| Port Assignment | ✅ Good | Railway dynamic port supported |
| File I/O | ✅ Good | No persistent file writes |
| Memory Management | ⚠️ Warning | Memory leaks possible |
| Graceful Shutdown | ✅ Good | Proper signal handlers |
| Connection Pooling | ⚠️ Warning | No pooling implemented |

**Deployment Status**: ⚠️ **Needs fixes before production**

---

## 📝 Summary

**Code Quality**: 7/10  
**Railway Ready**: 6/10

**Strengths**: Well-structured, proper error handling, good middleware setup  
**Weaknesses**: Memory leaks, mock data in production, no timeout handling  
**Critical Issues**: Event listener cleanup, session timeout, real action executor
