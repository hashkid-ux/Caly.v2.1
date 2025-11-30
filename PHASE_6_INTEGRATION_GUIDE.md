# Phase 6 Agent Integration Guide

## Quick Start

### 1. Initialize Agents on Server Startup

**In `Backend/server.js` or `Backend/index.js`:**

```javascript
const { initializeAgents } = require('./agents/agentInitializer');

async function startServer() {
  // ... other initialization code ...

  // Initialize agents
  const agentRegistry = await initializeAgents();
  
  logger.info('✅ All 54+ agents initialized and registered');
  
  // Make registry available globally for routes
  global.agentRegistry = agentRegistry;
}
```

### 2. Create Agent API Endpoints

**In `Backend/routes/agents.js` (new file):**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeTenant } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all agents
router.get('/', authenticateToken, authorizeTenant, (req, res) => {
  const agents = global.agentRegistry.listAgents();
  res.json({ agents });
});

// Get agents by sector
router.get('/sector/:sector', authenticateToken, authorizeTenant, (req, res) => {
  const { sector } = req.params;
  const agents = global.agentRegistry.getAgentsBySector(sector);
  res.json({ sector, agents: agents || [] });
});

// Get agents by capability
router.get('/capability/:capability', authenticateToken, authorizeTenant, (req, res) => {
  const { capability } = req.params;
  const agents = global.agentRegistry.getAgentsByCapability(capability);
  res.json({ capability, agents: agents || [] });
});

// List all sectors
router.get('/sectors/all', authenticateToken, authorizeTenant, (req, res) => {
  const sectors = global.agentRegistry.listSectors();
  res.json({ sectors });
});

// Handle agent call
router.post('/handle', authenticateToken, authorizeTenant, async (req, res) => {
  try {
    const { agentType, clientId, callData } = req.body;
    const agentId = `${agentType}-${clientId}`;
    
    const agent = global.agentRegistry.getInstance(agentType, { clientId });
    const result = await agent.processCall(callData);
    
    logger.info(`Agent ${agentType} processed call`, { clientId, result });
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Agent call failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 3. Register Routes in Main Server

**In `Backend/server.js`:**

```javascript
const agentRoutes = require('./routes/agents');

app.use('/api/agents', agentRoutes);
```

## Usage Examples

### Get all agents
```bash
curl http://localhost:3000/api/agents \
  -H "Authorization: Bearer {token}"
```

### Get healthcare agents
```bash
curl http://localhost:3000/api/agents/sector/healthcare \
  -H "Authorization: Bearer {token}"
```

### Get agents with medication capability
```bash
curl http://localhost:3000/api/agents/capability/medication_check \
  -H "Authorization: Bearer {token}"
```

### Handle agent call (Pharmacy Support)
```bash
curl -X POST http://localhost:3000/api/agents/handle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "agentType": "PharmacySupport",
    "clientId": "client123",
    "callData": {
      "action": "medication_check",
      "medication": "Aspirin",
      "dosage": "500mg"
    }
  }'
```

## Integration with Phase 3 AgentRouter

### Current AgentRouter (Phase 3)
**File:** `Backend/services/AgentRouter.js`

**Update the selectAgent method:**

```javascript
async selectAgent(requirement) {
  // Score agents by capability match
  const agents = global.agentRegistry.listAgents();
  
  let bestAgent = null;
  let bestScore = 0;
  
  for (const agent of agents) {
    let score = 0;
    
    // Check capability match
    if (agent.metadata.capabilities) {
      for (const cap of agent.metadata.capabilities) {
        if (requirement.toLowerCase().includes(cap)) {
          score += 10;
        }
      }
    }
    
    // Check sector match
    if (requirement.sector && agent.metadata.sector === requirement.sector) {
      score += 5;
    }
    
    // Prefer lower priority numbers (1 = critical/important)
    score += (10 - agent.metadata.priority);
    
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }
  
  return bestAgent;
}
```

## Integration with Frontend (Phase 4)

### AgentAssignments Page Update

**File:** `Frontend/src/pages/AgentAssignments.jsx`

```javascript
import { useQuery } from 'react-query';
import { getAgents, handleAgentCall } from '../api/agents';

export function AgentAssignments() {
  // Fetch all agents
  const { data: agents = [], isLoading } = useQuery('agents', getAgents);
  
  // Group by sector
  const agentsBySector = agents.reduce((acc, agent) => {
    if (!acc[agent.sector]) acc[agent.sector] = [];
    acc[agent.sector].push(agent);
    return acc;
  }, {});
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      {Object.entries(agentsBySector).map(([sector, sectorAgents]) => (
        <AgentSectorCard 
          key={sector} 
          sector={sector} 
          agents={sectorAgents}
        />
      ))}
    </div>
  );
}
```

### Agent API Client

**File:** `Frontend/src/api/agents.js`

```javascript
import apiClient from './client';

export const getAgents = async () => {
  const response = await apiClient.get('/api/agents');
  return response.data.agents;
};

export const getAgentsBySector = async (sector) => {
  const response = await apiClient.get(`/api/agents/sector/${sector}`);
  return response.data.agents;
};

export const getAgentsByCapability = async (capability) => {
  const response = await apiClient.get(`/api/agents/capability/${capability}`);
  return response.data.agents;
};

export const handleAgentCall = async (agentType, clientId, callData) => {
  const response = await apiClient.post('/api/agents/handle', {
    agentType,
    clientId,
    callData,
  });
  return response.data;
};
```

## Testing & Validation

### Test Agent Registration

**File:** `Backend/tests/agents.test.js`

```javascript
const { registry } = require('../agents/agentFactory');
const { initializeAgents } = require('../agents/agentInitializer');

describe('Agent Registry', () => {
  beforeAll(async () => {
    await initializeAgents();
  });

  test('should have 54+ agents registered', () => {
    const agents = registry.listAgents();
    expect(agents.length).toBeGreaterThanOrEqual(54);
  });

  test('should have 10 sectors', () => {
    const sectors = registry.listSectors();
    expect(sectors.length).toBe(10);
  });

  test('should retrieve healthcare agents', () => {
    const agents = registry.getAgentsBySector('healthcare');
    expect(agents.length).toBe(8);
  });

  test('should retrieve agents by capability', () => {
    const agents = registry.getAgentsByCapability('medication_check');
    expect(agents.length).toBeGreaterThan(0);
  });

  test('should get agent instance', () => {
    const agent = registry.getInstance('PharmacySupport', { clientId: 'test' });
    expect(agent).toBeDefined();
    expect(agent.type).toBe('pharmacy_support');
  });

  test('should process agent call', async () => {
    const agent = registry.getInstance('PharmacySupport', { clientId: 'test' });
    const result = await agent.processCall({ action: 'medication_check' });
    expect(result.status).toBe('completed');
  });
});
```

### Run Tests

```bash
npm test -- agents.test.js
```

## Performance Monitoring

### Track Agent Performance

**File:** `Backend/services/PerformanceAggregator.js` (Update)

```javascript
class PerformanceAggregator {
  trackAgentCall(agentType, callData, result) {
    const agent = global.agentRegistry.getInstance(agentType);
    const stats = agent.getStats();
    
    // Record metrics
    this.metrics.push({
      timestamp: new Date(),
      agentType,
      sector: agent.metadata.sector,
      capabilities: agent.metadata.capabilities,
      success: result.status === 'completed',
      responseTime: result.responseTime,
      callCount: stats.totalCallsHandled,
      successRate: stats.successRate,
    });
  }

  getAgentMetrics(agentType) {
    return this.metrics.filter(m => m.agentType === agentType);
  }

  getAgentsBySector(sector) {
    return this.metrics.filter(m => m.sector === sector);
  }
}
```

## Deployment Checklist

- [ ] All 5 agent files created (Factory, Healthcare, Retail, Finance, Other, Regulatory)
- [ ] agentInitializer.js properly configured
- [ ] Agent routes endpoints created
- [ ] Integration with AgentRouter completed
- [ ] Frontend API client updated
- [ ] Test suite passing (54+ agents verified)
- [ ] Performance monitoring integrated
- [ ] Multi-tenancy verified (clientId isolation)
- [ ] Documentation complete
- [ ] Ready for Phase 7

## Troubleshooting

### Agents not registering
```javascript
// Check registry
console.log(global.agentRegistry.listAgents());
console.log(global.agentRegistry.listSectors());
```

### Agent not found
```javascript
// Verify agent name matches registration
const agent = global.agentRegistry.getInstance('PharmacySupport');
```

### Multi-tenancy issue
```javascript
// Verify clientId is passed
const agent = global.agentRegistry.getInstance('PharmacySupport', { 
  clientId: 'specific-client' 
});
```

## Next Steps

1. **API Integration** - Connect agents to API endpoints ✅ Documented
2. **Frontend Connection** - Update AgentAssignments page ✅ Documented
3. **Performance Monitoring** - Track agent metrics ✅ Documented
4. **Testing** - Comprehensive test coverage ✅ Documented
5. **Phase 7** - Advanced Analytics on agent performance

---

**Status:** 🟢 Phase 6 Complete - All agents implemented and ready for integration
**Next:** Phase 7 - Advanced Analytics & Agent Performance Optimization
