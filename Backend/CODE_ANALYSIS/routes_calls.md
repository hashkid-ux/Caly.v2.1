# routes/calls.js - Code Analysis

## Overview
REST API endpoints for querying call records. Provides filtering, pagination, and aggregation for call analytics. Used by dashboard frontend for viewing call history.

---

## ✅ GOOD SIDES

### 1. **Proper Pagination**
- ✅ Limit and offset parameters
- ✅ Default limit (50) prevents huge responses
- ✅ Total count returned for UI pagination
- ✅ Sensible defaults

### 2. **Query Filtering**
- ✅ Filter by client_id
- ✅ Filter by resolution status
- ✅ Filter by phone number
- ✅ Multiple filter combinations supported

### 3. **Parameterized Queries**
- ✅ Uses `$1, $2, $3...` placeholders
- ✅ No SQL injection risk
- ✅ Proper value escaping

### 4. **Dynamic Query Building**
- ✅ Queries built based on provided filters
- ✅ Only includes WHERE clauses for provided filters
- ✅ Avoids unnecessary database load

### 5. **Sorted Results**
- ✅ Ordered by `start_ts DESC` (newest first)
- ✅ Sensible default for call history
- ✅ User sees recent calls first

### 6. **Associated Data Retrieval**
- ✅ Gets actions for each call
- ✅ Gets entities for each call
- ✅ Complete call context returned
- ✅ Reduces frontend queries

### 7. **Error Handling**
- ✅ Try-catch wrapper
- ✅ Meaningful error messages
- ✅ Proper HTTP status codes
- ✅ Logs errors with context

---

## ❌ BAD SIDES / ISSUES

### 1. **Duplicate Database Queries**
- ❌ **Problem**: Total count query doesn't use LIMIT/OFFSET
- ❌ **Example**:
  ```javascript
  // Query 1: Get paginated results
  const result = await db.query(query + ` LIMIT $${...} OFFSET $${...}`);
  
  // Query 2: Get total count (re-queries entire table)
  const countResult = await db.query(countQuery);
  ```
- ❌ **Impact**: 2x database load
- ⚠️ **Risk Level**: MEDIUM

### 2. **No LIMIT Enforcement**
- ❌ **Problem**: User can set `limit=999999`
- ❌ **Missing**: Max limit check
- ❌ **Impact**: Can crash server by requesting huge responses
- ⚠️ **Risk Level**: MEDIUM

### 3. **Inefficient Count Query**
- ❌ **Problem**: Count query rebuilds WHERE clause separately
- ❌ **Missing**: Reuse WHERE clause logic
- ❌ **Code Duplication**: Filter logic appears twice
- ⚠️ **Risk Level**: LOW-MEDIUM

### 4. **String Parsing for Boolean**
- ❌ **Problem**:
  ```javascript
  resolved: resolved === 'true'
  ```
- ❌ **Issue**: Trusting URL string instead of parsing
- ❌ **Missing**: Proper boolean validation
- ⚠️ **Risk Level**: LOW

### 5. **No Data Validation**
- ❌ **Problem**: `client_id`, `limit`, `offset` not validated
- ❌ **Missing**: Schema validation
- ❌ **Example**: `client_id=-1` accepted
- ⚠️ **Risk Level**: MEDIUM

### 6. **N+1 Query Problem**
- ❌ **Problem**: For each call, fetches actions and entities separately
- ❌ **Example**: 50 calls = 1 + 50 + 50 = 101 queries
- ❌ **Missing**: JOIN or batch query
- ⚠️ **Risk Level**: MEDIUM-HIGH

### 7. **No Caching**
- ❌ **Problem**: Same query executed repeatedly
- ❌ **Missing**: Cache for frequently accessed calls
- ❌ **Impact**: Unnecessary database load
- ⚠️ **Risk Level**: MEDIUM

### 8. **No Authentication/Authorization**
- ❌ **Problem**: Any caller can view any call
- ❌ **Missing**: Client ownership validation
- ❌ **Security**: Client A sees Client B's calls
- ⚠️ **Risk Level**: HIGH (security issue)

### 9. **Slow Full-Table Scans**
- ❌ **Problem**: No indexes on WHERE clause columns
- ❌ **Missing**: Indexes on `client_id`, `phone_from`, `resolved`
- ⚠️ **Risk Level**: MEDIUM

### 10. **No Search Functionality**
- ❌ **Problem**: Can't search by customer name or issue description
- ❌ **Missing**: Full-text search on transcript
- ⚠️ **Risk Level**: LOW

### 11. **No Sorting Options**
- ❌ **Problem**: Always sorts by `start_ts DESC`
- ❌ **Missing**: `sort_by` and `sort_order` parameters
- ⚠️ **Risk Level**: LOW

### 12. **Empty Calls Array on Error**
- ❌ **Problem**: If query fails, returns empty array (misleading)
- ❌ **Missing**: Error response should indicate failure
- ⚠️ **Risk Level**: LOW

### 13. **Large Response Payload**
- ❌ **Problem**: Returns all fields including full transcripts
- ❌ **Missing**: Field selection / sparse responses
- ❌ **Impact**: Slow network for large responses
- ⚠️ **Risk Level**: LOW

---

## 🔧 RECOMMENDATIONS

### High Priority (P0)
1. **Add authentication/authorization**
   ```javascript
   router.get('/', async (req, res) => {
     const userId = req.user.id;
     const clientId = req.query.client_id;
     
     // Verify user owns this client
     const hasAccess = await db.checkClientAccess(userId, clientId);
     if (!hasAccess) {
       return res.status(403).json({ error: 'Forbidden' });
     }
     // ... continue
   });
   ```

2. **Fix N+1 query problem**
   ```javascript
   // Instead of:
   // const actions = await db.actions.getByCall(id);
   // const entities = await db.entities.getByCall(id);
   
   // Use JOIN:
   const result = await db.query(`
     SELECT c.*, a.*, e.*
     FROM calls c
     LEFT JOIN actions a ON c.id = a.call_id
     LEFT JOIN entities e ON c.id = e.call_id
     WHERE c.client_id = $1
   `, [clientId]);
   
   // Aggregate into call objects
   const calls = aggregateResults(result.rows);
   ```

3. **Add input validation**
   ```javascript
   if (limit > 1000) limit = 1000; // Max limit
   if (offset < 0) offset = 0;
   if (!Number.isInteger(client_id)) {
     return res.status(400).json({ error: 'Invalid client_id' });
   }
   ```

4. **Combine count and data queries**
   ```javascript
   // Use window function
   const result = await db.query(`
     SELECT *, COUNT(*) OVER() as total
     FROM calls
     WHERE client_id = $1
     LIMIT $2 OFFSET $3
   `, [clientId, limit, offset]);
   
   const total = result.rows[0]?.total || 0;
   ```

### Medium Priority (P1)
5. Add database indexes on filter columns
6. Add caching for frequently accessed calls
7. Add search functionality (full-text search)
8. Add sorting options
9. Add field selection / sparse responses
10. Add rate limiting

### Low Priority (P2)
11. Add audit logging for data access
12. Add data export (CSV/JSON)
13. Add metrics (response time, query count)

---

## 📊 Query Performance

| Query | Count | Time | Impact |
|-------|-------|------|--------|
| Paginated list | 1 | Fast | ✅ |
| Total count | 1 | Slow | ⚠️ (N+1 query) |
| Actions per call | 50 | Slow | ❌ (N+1 problem) |
| Entities per call | 50 | Slow | ❌ (N+1 problem) |
| **Total** | **102** | **Very Slow** | **❌** |

---

## 📊 Railway Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Connection Pooling | ✅ Good | Database pooling used |
| Memory | ✅ Good | Pagination prevents memory spikes |
| Query Performance | ⚠️ Warning | N+1 queries problematic |
| Security | ❌ Missing | No authentication |

**Deployment Status**: ⚠️ **Functional but needs security & optimization**

---

## 📝 Summary

**Code Quality**: 6/10  
**Production Ready**: 5/10

**Strengths**: Good pagination, filtering, data aggregation  
**Weaknesses**: N+1 queries, no auth, no optimization  
**Critical Issues**: No authentication, N+1 problem, inefficient count query
