## QUICK REFERENCE - MULTI-SECTOR ARCHITECTURE

### For Backend Developers

#### Adding a New Sector

**Step 1: Create Agent File**
```javascript
// Backend/agents/{sector}/{Sector}Agents.js
const BaseAgent = require('../BaseAgent');

class SpecificAgent extends BaseAgent {
  constructor(callId, initialData = {}) {
    super(callId, initialData);
    this.requiredFields = ['field1', 'field2'];
    this.sector = 'newsector';
    this.agentType = 'AGENT_TYPE';
  }

  async execute() {
    try {
      if (!this.hasRequiredData()) {
        this.state = 'WAITING_FOR_INFO';
        this.requestMissingInfo();
        return;
      }
      // Business logic
      this.state = 'COMPLETED';
      this.emit('complete', { status: 'success', data: {} });
    } catch (error) {
      this.emit('error', { message: error.message });
    }
  }

  getPromptForField(field) {
    const prompts = { field1: 'Prompt?', field2: 'Prompt?' };
    return prompts[field];
  }
}

module.exports = { SpecificAgent };
```

**Step 2: Seed Database**
```sql
INSERT INTO sector_agents (sector, agent_id, agent_type, display_name, priority, enabled)
VALUES 
  ('newsector', 'AGENT_1', 'AGENT_TYPE_1', 'Display Name', 1, true),
  ('newsector', 'AGENT_2', 'AGENT_TYPE_2', 'Display Name', 2, true);

INSERT INTO sector_intent_patterns (sector, intent_name, pattern, language, priority)
VALUES 
  ('newsector', 'INTENT_1', '/regex_pattern/i', 'english', 1),
  ('newsector', 'INTENT_2', '/regex_pattern/i', 'english', 2);

INSERT INTO sector_configurations (client_id, sector, config, enabled)
VALUES (client_id, 'newsector', '{"setting1": value1, "setting2": value2}'::jsonb, true);
```

**Step 3: Load in OrchestratorV2**
```javascript
// Already automatic if DB is seeded! No code changes needed.
// OrchestratorV2.loadAgentsForSector() loads from database.
```

#### Creating New API Endpoints

```javascript
// routes/sectorConfig.js is the template
// Add new routes following this pattern:

router.get('/custom-endpoint', authMiddleware, async (req, res) => {
  try {
    const clientId = req.user?.client_id;
    logger.info('[SectorConfig] Operation', { clientId });
    
    // Validation
    if (!isValidInput(req.params)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    // Database query
    const result = await db.query('SELECT ...', [clientId]);
    
    logger.info('[SectorConfig] Success', { result });
    res.json({ data: result.rows });
  } catch (error) {
    logger.error('[SectorConfig] Error', { error: error.message });
    res.status(500).json({ error: 'Internal error' });
  }
});
```

---

### For Frontend Developers

#### Using SectorConfigService

```javascript
import SectorConfigService from '../../services/sectorConfigService';

// In your component:
const MyComponent = () => {
  const { user } = useContext(AuthContext);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    // Get all sectors
    SectorConfigService.getAllSectors(user.accessToken)
      .then(setSectors)
      .catch(err => console.error(err));
  }, []);

  // Get agents for sector
  const getAgents = async (sector) => {
    const agents = await SectorConfigService.getSectorAgents(sector, user.accessToken);
    console.log(agents);
  };

  // Get config
  const getConfig = async (sector) => {
    const config = await SectorConfigService.getSectorConfig(sector, user.accessToken);
    console.log(config);
  };

  // Update config
  const updateConfig = async (sector, newConfig) => {
    const updated = await SectorConfigService.updateSectorConfig(
      sector,
      newConfig,
      user.accessToken
    );
    console.log(updated);
  };

  return (
    <div>
      {sectors.map(s => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  );
};
```

#### Creating Sector-Specific Components

```javascript
// components/SectorSpecific{Sector}Page.jsx
import { useState, useContext } from 'react';
import SectorConfigService from '../services/sectorConfigService';
import { AuthContext } from '../context/AuthContext';

export default function SectorSpecificPage() {
  const { user, sector } = useContext(AuthContext);
  const [agents, setAgents] = useState([]);
  const [config, setConfig] = useState({});

  useEffect(() => {
    Promise.all([
      SectorConfigService.getSectorAgents(sector, user.accessToken),
      SectorConfigService.getSectorConfig(sector, user.accessToken)
    ]).then(([agents, config]) => {
      setAgents(agents);
      setConfig(config);
    });
  }, [sector, user.accessToken]);

  // Render sector-specific UI
  return (
    <div>
      <h1>{sector} Configuration</h1>
      {/* Your component */}
    </div>
  );
}
```

---

### For Data Analysts

#### Key Queries

**Get all sectors for a client:**
```sql
SELECT * FROM sector_configurations 
WHERE client_id = $1
ORDER BY sector;
```

**Get agents for a sector:**
```sql
SELECT * FROM sector_agents 
WHERE sector = $1 AND enabled = true
ORDER BY priority;
```

**Get intent patterns for a sector:**
```sql
SELECT * FROM sector_intent_patterns 
WHERE sector = $1 AND language = $2
ORDER BY priority;
```

**Count agents per sector:**
```sql
SELECT sector, COUNT(*) as agent_count
FROM sector_agents
WHERE enabled = true
GROUP BY sector
ORDER BY agent_count DESC;
```

---

### For DevOps/Deployment

#### Database Migration Order

```bash
# 1. Create new tables
psql -U user -d dbname -f Backend/db/migrations/001_add_sector_support.sql

# 2. Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

# 3. Seed initial data (run migration script)
# Already included in migration file

# 4. Verify data seeded
SELECT COUNT(*) FROM sector_configurations;
SELECT COUNT(*) FROM sector_agents;
```

#### Backend Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if any new ones)
npm install

# 3. Database migrations
npm run migrate  # or manually run migration SQL

# 4. Start backend
npm start

# 5. Verify routes registered
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/sector
```

#### Frontend Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Build
npm run build

# 3. Deploy to Vercel/hosting
vercel deploy --prod  # or your deployment method

# 4. Verify API connectivity
# Test in browser console:
# fetch('http://localhost:8080/api/sector', 
#   { headers: { Authorization: 'Bearer ...' } })
```

---

### For QA/Testing

#### API Testing Checklist

```bash
# Authentication
curl -H "Authorization: Bearer INVALID_TOKEN" http://localhost:8080/api/sector
# Expected: 401 Unauthorized

# Get sectors
curl -H "Authorization: Bearer VALID_TOKEN" http://localhost:8080/api/sector
# Expected: 200 with sectors array

# Get sector config
curl -H "Authorization: Bearer VALID_TOKEN" \
  http://localhost:8080/api/sector/config/healthcare
# Expected: 200 with config object

# Update sector config
curl -X PUT -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"config": {"field": "value"}}' \
  http://localhost:8080/api/sector/config/healthcare
# Expected: 200 with updated config

# Enable/Disable sector
curl -X POST -H "Authorization: Bearer VALID_TOKEN" \
  http://localhost:8080/api/sector/healthcare/enable
# Expected: 200 with enabled status

# Invalid sector
curl -H "Authorization: Bearer VALID_TOKEN" \
  http://localhost:8080/api/sector/nonexistent
# Expected: 404 Not Found

# Validation error
curl -X PUT -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"config": {"field": "invalid_value"}}' \
  http://localhost:8080/api/sector/healthcare
# Expected: 400 Bad Request with validation errors
```

#### Agent Testing Checklist

```javascript
// Test 1: Agent with all required fields
const agent = new HealthcareAgent('call-1', { 
  patient_name: 'John',
  preferred_time: '2 PM'
});
agent.on('complete', result => console.log('✓ Complete:', result));
agent.execute();

// Test 2: Agent missing required fields
const agent = new HealthcareAgent('call-2', { patient_name: 'John' });
agent.on('need_info', msg => console.log('✓ Requested info:', msg));
agent.execute();

// Test 3: Agent with error
const agent = new HealthcareAgent('call-3', { invalid: 'data' });
agent.on('error', err => console.log('✓ Error handled:', err));
agent.execute();

// Test 4: Agent escalation
const agent = new HealthcareAgent('call-4', { critical_symptoms: true });
agent.on('need_escalation', data => console.log('✓ Escalated:', data));
agent.execute();
```

---

### Troubleshooting

#### "Database not found" Error
```
Solution: Check connection string in .env
Verify PostgreSQL is running
Run migrations: npm run migrate
```

#### "Sector not found" Error
```
Solution: Seed database with sector data
INSERT INTO sector_configurations VALUES (...)
Check client_id matches authenticated user
```

#### "Agent not loaded" Error
```
Solution: Verify agent file exists
Check require() path in orchestrator
Verify agent extends BaseAgent
Confirm exports match agent type
```

#### "API endpoint 401 Unauthorized"
```
Solution: Provide valid JWT token
Check token expiration
Verify Authorization header format: "Bearer TOKEN"
Check authMiddleware is applied to route
```

---

### Documentation Links

- **API Docs:** See `/docs` in backend
- **Database Schema:** See `Backend/db/schema.sql`
- **Migration Scripts:** See `Backend/db/migrations/`
- **Agent Examples:** See `Backend/agents/{sector}/`
- **Service Methods:** See `Frontend/src/services/sectorConfigService.js`

---

### Common Tasks

**Add new sector agent:**
1. Create agent class file
2. Export from agents index
3. Seed database with agent metadata
4. Test with orchestrator

**Update sector configuration:**
1. Modify default config in sectorConfigService
2. Call updateSectorConfig() API
3. Verify in database

**Enable/disable sector:**
```javascript
SectorConfigService.enableSector(sector, token);
SectorConfigService.disableSector(sector, token);
```

**List agents for sector:**
```javascript
const agents = await SectorConfigService.getSectorAgents(sector, token);
```

**Get intent patterns:**
```javascript
const patterns = await SectorConfigService.getSectorIntentPatterns(sector, language, token);
```

---

**Last Updated:** Phase 3 Complete  
**Version:** 1.0.0  
**Status:** Production Ready
