# PHASE 8 QUICK START GUIDE
## Team Management System

---

## What Was Built

A complete **hybrid human-AI agent platform** where:
- Real team members (humans) are assigned to AI agents
- AI agents handle routine customer support
- Team members can QA, escalate, and train AI agents
- Real-time performance tracking per human
- Sector-specific API configuration per industry

---

## Key URLs

### Dashboard
```
http://localhost:3000/dashboard
```
**Shows:** Team members, performance metrics, call volume

### Team Management
```
http://localhost:3000/teams
```
**Shows:** Full team roster, agent assignments, performance details

### Settings - Sector Config
```
http://localhost:3000/settings
```
**Tab:** "Sector Config" → Dynamic form for API credentials

### Onboarding
```
http://localhost:3000/onboarding
```
**Step 2:** New option to create first team member

---

## API Endpoints

### Get All Team Members
```bash
curl -X GET http://localhost:8080/api/teams \
  -H "Authorization: Bearer $TOKEN"
```

### Create Team Member
```bash
curl -X POST http://localhost:8080/api/teams/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@company.com",
    "title": "Priya Sharma",
    "role": "agent"
  }'
```

### Assign Agents to Team Member
```bash
curl -X PUT http://localhost:8080/api/teams/members/1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignments": [
      {"agent_id": 1, "proficiency_level": 80},
      {"agent_id": 5, "proficiency_level": 60}
    ]
  }'
```

### Get Team Member Performance
```bash
curl -X GET http://localhost:8080/api/teams/members/1/performance \
  -H "Authorization: Bearer $TOKEN"
```

### Save Sector Configuration
```bash
curl -X POST http://localhost:8080/api/sector-config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "ecommerce",
    "config": {
      "shopify_store_url": "https://mystore.myshopify.com",
      "shopify_api_key": "your-key",
      "shopify_access_token": "your-token",
      "exotel_number": "+911234567890",
      "exotel_sid": "your-sid",
      "exotel_token": "your-token"
    }
  }'
```

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `team_members` | Human team members with performance metrics |
| `team_agent_assignments` | Links humans to AI agents with proficiency |
| `teams` | Team groups with sector |
| `team_performance` | Daily performance aggregates |
| `sector_agents` | 54 AI agents across 10 sectors |
| `client_sector_configs` | Sector-specific API credentials |
| `calls` | Call records with team_member_id attribution |

**Migration Required?** NO - All tables created in Phase 7

---

## Performance Scoring Algorithm

```
Performance Score = (S × 0.6) + (C × 0.3) + (T × 0.1)

Where:
  S = Success Rate (0-100)
  C = Customer Satisfaction Score (0-100, from 0-5 rating)
  T = Speed Efficiency (0-100, based on handling time vs baseline)

Result:
  80+  = Excellent (Green)
  60-79 = Good (Blue)
  40-59 = Fair (Yellow)
  <40  = Needs Improvement (Red)
```

---

## Call Attribution Flow

1. **Inbound Call** → Exotel Webhook
2. **Look Up Team Member** → Via agentRouter.selectTeamAgent()
3. **Create Call Record** → With team_member_id + agent_type
4. **Agent Executes** → Handles customer intent
5. **Call Completes** → agent_completed event fires
6. **Update Metrics** → performanceTracker.updateTeamMemberPerformance()
7. **Database Updated** → All performance tables reflect new metrics

---

## Sector Configuration Fields

### E-Commerce
```json
{
  "shopify_store_url": "https://mystore.myshopify.com",
  "shopify_api_key": "...",
  "shopify_access_token": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Healthcare
```json
{
  "emr_provider": "epic|cerner|meditech",
  "emr_api_url": "https://emr.example.com",
  "emr_username": "...",
  "emr_password": "...",
  "practice_id": "...",
  "hipaa_enabled": true|false,
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Real Estate
```json
{
  "mls_api_key": "...",
  "mls_username": "...",
  "mls_password": "...",
  "mls_board_id": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Financial
```json
{
  "stripe_api_key": "pk_...",
  "stripe_secret_key": "sk_...",
  "bank_api_token": "...",
  "kyc_provider": "aadhaar|pan|gstin",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Hospitality
```json
{
  "booking_system": "booking.com|airbnb|custom_pms",
  "booking_api_key": "...",
  "booking_secret": "...",
  "property_id": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Logistics
```json
{
  "tracking_api_url": "https://api.logistics.com",
  "tracking_api_key": "...",
  "tracking_secret": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Education
```json
{
  "lms_provider": "moodle|canvas|blackboard|schoology",
  "lms_api_url": "https://lms.example.com",
  "lms_api_key": "...",
  "institution_id": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Government
```json
{
  "portal_api_url": "https://portal.example.com",
  "portal_api_key": "...",
  "department_id": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### Telecom
```json
{
  "billing_api_url": "https://billing.example.com",
  "billing_api_key": "...",
  "operator_id": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

### SaaS
```json
{
  "saas_api_url": "https://api.saas.example.com",
  "saas_api_key": "...",
  "saas_secret": "...",
  "exotel_number": "+91...",
  "exotel_sid": "...",
  "exotel_token": "..."
}
```

---

## Common Development Tasks

### Add New Team Member Programmatically
```javascript
// In backend route or service
await db.query(
  `INSERT INTO team_members (team_id, user_id, title, role, active)
   VALUES ($1, $2, $3, $4, true)`,
  [teamId, userId, 'John Doe', 'agent']
);
```

### Assign Agent to Team Member
```javascript
await db.query(
  `INSERT INTO team_agent_assignments (team_member_id, agent_id, proficiency_level)
   VALUES ($1, $2, $3)`,
  [memberId, agentId, 80]
);
```

### Get Team Member Performance
```javascript
const result = await db.query(
  `SELECT * FROM team_members WHERE id = $1 AND team_id IN (
     SELECT id FROM teams WHERE client_id = $2
   )`,
  [memberId, clientId]
);
```

### Update Performance After Call
```javascript
const performanceTracker = require('./services/performanceTracker');
await performanceTracker.updateTeamMemberPerformance(memberId, {
  resolved: true,
  escalated: false,
  success: 1,
  handling_time_seconds: 120,
  customer_satisfaction: 5,
  agent_type: 'OrderLookupAgent'
});
```

---

## Testing Scenarios

### Scenario 1: Create Team + Assign Agents
```bash
# 1. Create team member
curl -X POST http://localhost:8080/api/teams/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","title":"Test User","role":"agent"}'

# Note team_id from response

# 2. Assign agents
curl -X PUT http://localhost:8080/api/teams/members/1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assignments":[{"agent_id":1,"proficiency_level":80}]}'

# 3. Verify
curl -X GET http://localhost:8080/api/teams/members/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Configure Sector Credentials
```bash
# Get sector requirements
curl -X GET http://localhost:8080/api/sector-config/ecommerce \
  -H "Authorization: Bearer $TOKEN"

# Save credentials
curl -X POST http://localhost:8080/api/sector-config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "ecommerce",
    "config": {
      "shopify_store_url": "https://mystore.myshopify.com",
      "shopify_api_key": "test-key",
      "shopify_access_token": "test-token",
      "exotel_number": "+919876543210",
      "exotel_sid": "test-sid",
      "exotel_token": "test-token"
    }
  }'
```

### Scenario 3: Monitor Performance in Real-Time
```bash
# Get initial stats
curl -X GET http://localhost:8080/api/teams/members/1/performance \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# (Simulate calls happening)

# Check updated stats
curl -X GET http://localhost:8080/api/teams/members/1/performance \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# Verify:
# - calls_this_week incremented
# - success_rate updated
# - performance_score recalculated
# - agent-specific metrics updated
```

---

## Debugging Tips

### Check if team member is assigned to call
```sql
SELECT call_id, team_member_id, agent_type FROM calls 
WHERE client_id = 'your-client-id' 
ORDER BY created_at DESC LIMIT 10;
```

### Check performance metrics
```sql
SELECT id, title, performance_score, success_rate, calls_total, calls_this_week
FROM team_members 
WHERE team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id');
```

### Check agent assignments
```sql
SELECT tm.title, taa.agent_type, taa.proficiency_level, taa.calls_handled, taa.success_rate
FROM team_agent_assignments taa
JOIN team_members tm ON taa.team_member_id = tm.id
WHERE tm.team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id');
```

### Check daily performance aggregates
```sql
SELECT * FROM team_performance 
WHERE team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id')
ORDER BY date DESC LIMIT 7;
```

---

## Performance Tuning

### Cache sector config (5 minutes)
```javascript
// In agentRouter.js - already implemented
const CACHE_DURATION = 5 * 60 * 1000;
```

### Batch performance updates (async)
```javascript
// In CallSessionManager.js - already implemented
// Performance tracking doesn't block call flow
performanceTracker.updateTeamMemberPerformance(...)
  .catch(err => logger.warn('Performance tracking failed', err));
```

### Index queries for speed
```sql
-- Already created in Phase 7 migration
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_agent_assignments_member_id ON team_agent_assignments(team_member_id);
CREATE INDEX idx_team_performance_team_id ON team_performance(team_id, date);
CREATE INDEX idx_calls_team_member_id ON calls(team_member_id);
```

---

## Monitoring & Alerts

### Track team member adoption
```sql
SELECT COUNT(*) as total_members, 
       SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_members,
       AVG(performance_score) as avg_performance
FROM team_members 
WHERE team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id');
```

### Monitor performance trends
```sql
SELECT DATE(date) as day, AVG(performance_score) as avg_score
FROM team_performance 
WHERE team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id')
GROUP BY DATE(date)
ORDER BY DATE(date) DESC
LIMIT 30;
```

### Alert on underperforming agents
```sql
SELECT title, performance_score, success_rate, avg_rating
FROM team_members 
WHERE team_id IN (SELECT id FROM teams WHERE client_id = 'your-client-id')
AND performance_score < 40
AND calls_total > 10;
```

---

## Next Steps (Phase 9)

1. ✅ **Current:** Team Management System (Phase 8)
2. ⏳ **Next:** QA Workflow & Call Review
3. ⏳ **After:** Performance Badges & Gamification
4. ⏳ **After:** Skill Assessment & Certification
5. ⏳ **After:** Team Schedule & Availability

---

## Support

**Errors?** Check the comprehensive guide: `PHASE_8_IMPLEMENTATION_COMPLETE.md`

**Questions?** Review the copilot instructions: `.github/copilot-instructions.md`

**Need help?** All endpoints have error handling with clear messages
