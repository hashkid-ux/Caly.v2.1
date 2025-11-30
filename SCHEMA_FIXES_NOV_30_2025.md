# Critical Schema Fixes - November 30, 2025

## Problem Summary
Production errors caused by database schema column name mismatches:
- `column "is_available" does not exist` in `sector_agents` table
- `column "call_status" does not exist` in `calls` table  
- Missing columns for performance aggregation and call tracking

## Root Cause
Code queries referenced columns that don't exist in the actual schema:
- Schema uses `enabled` (BOOLEAN), code was querying `is_available`
- Schema uses `resolved` (BOOLEAN), code was querying `call_status` 
- Performance metrics required tracking fields missing from `calls` table

## Changes Made

### 1. **Backend/db/schema.sql** - Updated Table Definitions

#### `calls` table additions:
```sql
-- Added columns for performance tracking
escalated BOOLEAN DEFAULT FALSE,        -- Track escalated calls
agent_type VARCHAR(100),                -- Agent that handled the call
team_member_id UUID,                    -- Team member assignment
team_id UUID,                           -- Team assignment

-- Added ALTER statements for existing databases
ALTER TABLE IF EXISTS calls ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS calls ADD COLUMN IF NOT EXISTS agent_type VARCHAR(100);
ALTER TABLE IF EXISTS calls ADD COLUMN IF NOT EXISTS team_member_id UUID;
ALTER TABLE IF EXISTS calls ADD COLUMN IF NOT EXISTS team_id UUID;
```

#### `sector_agents` table additions:
```sql
-- Added columns for routing optimization
success_rate FLOAT DEFAULT 0.8,         -- Agent success rate
avg_handling_time INTEGER DEFAULT 300,  -- Average handling time in seconds

-- Added ALTER statements for existing databases
ALTER TABLE IF EXISTS sector_agents ADD COLUMN IF NOT EXISTS success_rate FLOAT DEFAULT 0.8;
ALTER TABLE IF EXISTS sector_agents ADD COLUMN IF NOT EXISTS avg_handling_time INTEGER DEFAULT 300;
```

### 2. **Backend/services/agentRouter.js** - Fixed Query References

**Changed `is_available` → `enabled`:**
- Line 38: `WHERE is_available = true` → `WHERE enabled = true`
- Line 317: `WHERE client_id = $1 AND sector = $2 AND is_available = true` → `WHERE ... AND enabled = true`
- Line 337: `SUM(CASE WHEN is_available = true THEN 1 ELSE 0 END)` → `SUM(CASE WHEN enabled = true THEN 1 ELSE 0 END)`

### 3. **Backend/services/performanceAggregator.js** - Fixed Query References

**Changed `call_status` → proper boolean checks:**
- Line 65: Removed `AND call_status IN ('completed', 'escalated', 'transferred')` filter
- Line 80: `call.call_status === 'completed'` → `call.resolved === true`
- Line 109: `call.call_status === 'escalated'` → `call.escalated === true`
- Line 132: `call.call_status === 'completed'` → `call.resolved === true`
- Line 135: `call.call_status === 'escalated'` → `call.escalated === true`

**Changed field references:**
- `call.satisfaction_score` → `call.customer_satisfaction` (matches schema)

**Enhanced `updateAgentSuccessRates()` with table existence checks:**
- Added check for `agent_metrics_v2` table existence before querying
- Added check for `success_rate` column existence in `sector_agents`
- Gracefully skips update if tables/columns don't exist (no crashes)
- Changed `WHERE is_available = true` → `WHERE enabled = true`

### 4. **Backend/.github/copilot-instructions.md** - Documented Fix

Added new pitfall section documenting:
- The schema mismatch issues
- Correct column names to use
- Why these fixes matter for production stability

## Testing Recommendations

1. **Run database initialization:**
   ```bash
   npm run init-db
   ```
   This will apply all schema changes via ALTER TABLE (safe for existing databases)

2. **Test AgentRouter:**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/agents/available
   ```

3. **Verify no more column errors:**
   - AgentRouter should load agents without "is_available" errors
   - PerformanceAggregator should process calls without "call_status" errors

4. **Monitor logs for:**
   - No more "column does not exist" errors
   - Graceful handling of missing tables (info-level, not error)

## Files Modified

1. `Backend/db/schema.sql` - Added missing columns and ALTER TABLE statements
2. `Backend/services/agentRouter.js` - Fixed 3 query references
3. `Backend/services/performanceAggregator.js` - Fixed 10+ query references, added table checks
4. `.github/copilot-instructions.md` - Documented schema fixes as common pitfall

## Deployment Notes

- ✅ All changes are backward compatible (using `IF NOT EXISTS` / `IF EXISTS`)
- ✅ Safe to deploy to existing production databases
- ✅ Idempotent (can run multiple times without issues)
- ✅ No data migration required
- ✅ No downtime needed for changes to take effect

## Related Issues Fixed

- ✅ "Error loading agents" - Agent Router now uses correct column name
- ✅ "Error during daily aggregation" - PerformanceAggregator now uses correct schema
- ✅ "Failed to initialize AgentRouter" - No more unhandled column exceptions
