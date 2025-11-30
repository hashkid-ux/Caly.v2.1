# Quick Reference: Column Name Mappings

## sector_agents Table
```javascript
// ❌ WRONG
db.query(`SELECT * FROM sector_agents WHERE is_available = true`);

// ✅ CORRECT
db.query(`SELECT * FROM sector_agents WHERE enabled = true`);
```

| Column Name | Type | Purpose | Notes |
|------------|------|---------|-------|
| `id` | UUID | Primary key | |
| `sector` | VARCHAR(50) | Sector type | ecommerce, healthcare, realestate, etc. |
| `agent_type` | VARCHAR(100) | Agent class name | OrderStatusAgent, AppointmentBookingAgent, etc. |
| `agent_class` | VARCHAR(255) | Full class path | For dynamic loading |
| **`enabled`** | BOOLEAN | Availability flag | **NOT `is_available`** |
| `priority` | INTEGER | Routing priority | Lower = higher priority |
| `success_rate` | FLOAT | Agent success % | For routing optimization |
| `avg_handling_time` | INTEGER | Avg duration (sec) | For routing optimization |
| `created_at` | TIMESTAMP | Creation time | |
| `updated_at` | TIMESTAMP | Last update | |

---

## calls Table
```javascript
// ❌ WRONG (multiple issues)
db.query(`SELECT * FROM calls 
  WHERE call_status IN ('completed', 'escalated')`);

// ✅ CORRECT
db.query(`SELECT * FROM calls 
  WHERE resolved = true OR escalated = true`);
```

| Column Name | Type | Purpose | Notes |
|------------|------|---------|-------|
| `id` | UUID | Primary key | |
| `client_id` | UUID | Tenant ID | Multi-tenancy |
| `call_sid` | TEXT | External call ID | From Exotel |
| `phone_from` | TEXT | Caller number | |
| `phone_to` | TEXT | Called number | |
| `start_ts` | TIMESTAMP | Call start time | |
| `end_ts` | TIMESTAMP | Call end time | |
| `duration_seconds` | INTEGER | Call duration | |
| `transcript_full` | TEXT | Full transcript | |
| `recording_url` | TEXT | Recording S3 URL | |
| **`resolved`** | BOOLEAN | Call resolved? | **NOT `call_status`** |
| **`escalated`** | BOOLEAN | Call escalated? | **NEW (Nov 30)** |
| **`customer_satisfaction`** | INTEGER | 1-5 rating | **NOT `satisfaction_score`** |
| **`agent_type`** | VARCHAR(100) | Agent handler | **NEW (Nov 30)** |
| **`team_member_id`** | UUID | Assigned team member | **NEW (Nov 30)** |
| **`team_id`** | UUID | Assigned team | **NEW (Nov 30)** |
| `created_at` | TIMESTAMP | Record creation | |
| `updated_at` | TIMESTAMP | Last update | |

---

## Common Query Patterns

### ✅ Get available agents for a sector
```javascript
const result = await db.query(
  `SELECT * FROM sector_agents 
   WHERE sector = $1 AND enabled = true 
   ORDER BY priority`,
  [sector]
);
```

### ✅ Get today's resolved calls
```javascript
const result = await db.query(
  `SELECT * FROM calls 
   WHERE DATE(created_at) = CURRENT_DATE 
   AND client_id = $1 
   AND resolved = true`,
  [clientId]
);
```

### ✅ Count escalated calls by agent
```javascript
const result = await db.query(
  `SELECT agent_type, COUNT(*) as escalation_count
   FROM calls 
   WHERE client_id = $1 
   AND escalated = true 
   AND DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
   GROUP BY agent_type`,
  [clientId]
);
```

### ✅ Check if table exists before using
```javascript
const tableCheck = await db.query(
  `SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'agent_metrics_v2'
  )`
);

if (!tableCheck.rows[0].exists) {
  logger.warn('Table not available, skipping operation');
  return;
}

// Safe to query now
await db.query(`SELECT * FROM agent_metrics_v2 ...`);
```

---

## When Adding New Columns

1. **Add to schema first** (`Backend/db/schema.sql`):
   ```sql
   CREATE TABLE IF NOT EXISTS calls (
     ...
     new_column_name TYPE DEFAULT value,
   );
   
   -- Safe for existing databases
   ALTER TABLE IF EXISTS calls ADD COLUMN IF NOT EXISTS new_column_name TYPE DEFAULT value;
   ```

2. **Run initialization**:
   ```bash
   npm run init-db
   ```

3. **Then use in code**:
   ```javascript
   const result = await db.query(
     `SELECT id, new_column_name FROM calls WHERE ...`
   );
   ```

---

## References
- Schema definition: `Backend/db/schema.sql`
- Full report: `BACKEND_SCHEMA_FIX_REPORT.md`
- Copilot guide: `.github/copilot-instructions.md` (Pitfall #6)
