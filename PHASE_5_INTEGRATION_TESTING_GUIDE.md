# Phase 5: Integration & Testing Guide

## Overview

Phase 5 focuses on comprehensive integration testing to ensure all backend APIs, frontend components, and multi-tenant isolation work correctly together. This phase is critical for production readiness.

## Test Structure

```
Backend/
├── tests/
│   ├── setup.js                          # Jest configuration
│   ├── utils/
│   │   └── testHelpers.js               # Shared test utilities
│   └── integration/
│       ├── teams.test.js                # Teams API tests
│       ├── multiTenantIsolation.test.js # Security tests
│       ├── authentication.test.js       # Auth tests
│       └── performance.test.js          # Performance tests

Frontend/
├── src/
│   └── tests/
│       ├── TeamsDashboard.test.jsx      # Dashboard tests
│       ├── TeamDetail.test.jsx          # Detail page tests
│       ├── integration/                 # End-to-end tests
│       └── utils/                       # Test helpers
```

## Running Tests

### Backend Integration Tests

```bash
# Install test dependencies
npm install --save-dev jest supertest @testing-library/react

# Run all tests
npm test

# Run specific test suite
npm test -- teams.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test
npm test -- --testNamePattern="should create a new team"
```

### Frontend Tests

```bash
# Run frontend tests
npm test --prefix Frontend

# Run with coverage
npm test --prefix Frontend -- --coverage

# Watch mode
npm test --prefix Frontend -- --watch
```

### Full Integration Tests

```bash
# Start backend server
npm start &

# In another terminal, run full integration suite
npm run test:integration

# Run E2E tests (with Cypress/Playwright)
npm run test:e2e
```

## Test Categories

### 1. API Integration Tests (`teams.test.js`)

**Tests:**
- ✅ POST /api/teams - Create new team
- ✅ GET /api/teams - List teams
- ✅ GET /api/teams/:id - Get team detail
- ✅ PUT /api/teams/:id - Update team
- ✅ DELETE /api/teams/:id - Delete team
- ✅ Multi-tenant isolation on all operations
- ✅ Authentication validation
- ✅ Input validation
- ✅ Error handling

**Coverage:** 12 endpoints, 40+ test cases

### 2. Multi-Tenant Isolation Tests (`multiTenantIsolation.test.js`)

**Critical Security Tests:**
- ✅ Query-level isolation (WHERE client_id = $1)
- ✅ Write operation isolation (INSERT, UPDATE, DELETE)
- ✅ Read operation isolation (SELECT, JOINs)
- ✅ Cascading isolation (team → members → agents)
- ✅ Role-based isolation
- ✅ SQL injection prevention
- ✅ UNION attack prevention
- ✅ Subquery injection prevention
- ✅ Audit logging

**Coverage:** 25+ security test cases

### 3. Frontend Component Tests (`TeamsDashboard.test.jsx`)

**Tests:**
- ✅ Team listing from API
- ✅ Loading states
- ✅ Error states with retry
- ✅ Search functionality
- ✅ Filter by sector
- ✅ Filter by status
- ✅ Create team modal
- ✅ Form validation
- ✅ Navigation
- ✅ Responsive design
- ✅ Authentication token passing
- ✅ API error handling

**Coverage:** 30+ component test cases

### 4. Performance Tests

**Tests:**
- ✅ Query execution time (<100ms)
- ✅ API response time (<200ms)
- ✅ Component render time (<500ms)
- ✅ Memory usage
- ✅ Cache efficiency
- ✅ Database index performance

## Test Scenarios

### Scenario 1: Team Creation Flow

```javascript
// Steps:
1. User clicks "Create Team"
2. Modal opens with form
3. User fills in: name, sector, description
4. Form validates inputs
5. Submit button becomes enabled
6. API call made with auth header
7. Team created in database
8. Modal closes
9. Dashboard refreshes showing new team
10. Toast notification shows success
```

### Scenario 2: Multi-Tenant Data Access

```javascript
// Steps:
1. Client A creates team "Sales"
2. Client B creates team "Support"
3. Client A lists teams (should only see "Sales")
4. Client B lists teams (should only see "Support")
5. Client B tries to access Client A's team (should 404)
6. Client A tries to update Client B's team (should 404)
7. Client B creates member in their team
8. Client A cannot see this member
```

### Scenario 3: Error Handling

```javascript
// Steps:
1. Network connection lost
2. API returns 500 error
3. Component shows error message
4. User clicks "Retry"
5. Request is retried
6. API recovers
7. Data loads successfully
8. Error message dismissed
```

## Test Data

### Test Fixtures

```javascript
// Test team
{
  id: 'uuid-123',
  client_id: 'client-456',
  name: 'Healthcare Team',
  sector: 'healthcare',
  status: 'active',
  member_count: 5,
  satisfaction_score: 4.5,
  created_at: '2025-01-01T00:00:00Z'
}

// Test user/token
{
  client_id: 'client-456',
  sub: 'user-123',
  iat: 1704067200,
  exp: 1704153600
}
```

### Generating Test Data

```javascript
// Use test helpers to generate data
const { generateMockTeam, generateTestToken } = require('./utils/testHelpers');

const mockTeam = generateMockTeam({
  name: 'Custom Team',
  sector: 'healthcare'
});

const token = generateTestToken('client-123', 'user-456');
```

## Test Execution Plan

### Day 1: Backend Testing
- [ ] Setup Jest configuration
- [ ] Create test database
- [ ] Run API integration tests
- [ ] Fix any failing tests
- [ ] Run multi-tenant isolation tests
- [ ] Run performance tests

### Day 2: Frontend Testing
- [ ] Setup Jest + React Testing Library
- [ ] Run component tests
- [ ] Test API integration
- [ ] Test error scenarios
- [ ] Run performance tests

### Day 3: End-to-End Testing
- [ ] Setup E2E testing framework
- [ ] Create end-to-end test scenarios
- [ ] Test full user workflows
- [ ] Test on multiple browsers
- [ ] Test responsive design

### Day 4: Security Audit
- [ ] Run security tests
- [ ] Verify multi-tenant isolation
- [ ] Check authentication
- [ ] Review error messages
- [ ] Audit logging

### Day 5: Performance & Documentation
- [ ] Run load tests
- [ ] Optimize slow queries
- [ ] Document test results
- [ ] Create test report
- [ ] Document known issues

## Test Results Tracking

### Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Backend Routes | 90%+ | TBD |
| Frontend Components | 80%+ | TBD |
| Services | 85%+ | TBD |
| Middleware | 95%+ | TBD |
| Database Layer | 90%+ | TBD |
| **Overall** | **85%+** | **TBD** |

### Test Results Template

```markdown
## Test Execution Results

### Date: 2025-11-29
### Environment: Development (PostgreSQL local)

### Backend Tests
- ✅ Teams API: 40/40 passed
- ✅ Authentication: 15/15 passed
- ✅ Multi-tenant: 25/25 passed
- ✅ Performance: 8/8 passed
- **Total: 88/88 passed (100%)**

### Frontend Tests
- ✅ TeamsDashboard: 30/30 passed
- ✅ TeamDetail: 25/25 passed
- ✅ Components: 20/20 passed
- **Total: 75/75 passed (100%)**

### Coverage Summary
- Lines: 2,450 / 2,800 (87%)
- Branches: 180 / 220 (82%)
- Functions: 145 / 160 (91%)

### Performance Metrics
- Avg API response: 45ms (target: <200ms) ✅
- Avg query time: 35ms (target: <100ms) ✅
- Component render: 120ms (target: <500ms) ✅

### Known Issues
None

### Recommendation
**PASS** - Ready for Phase 6
```

## Common Test Issues & Solutions

### Issue 1: Database Connection Fails

```bash
# Solution: Ensure test database exists
createdb caly_test

# Verify connection
psql caly_test -c "SELECT 1"
```

### Issue 2: Test Timeout

```javascript
// Increase timeout
jest.setTimeout(30000); // 30 seconds

// Or per test
it('should create team', async () => {
  // test code
}, 30000);
```

### Issue 3: Async Test Failures

```javascript
// Use async/await properly
it('should create team', async () => {
  const result = await request(app).post('/api/teams');
  expect(result.status).toBe(201);
});

// Or use done callback
it('should create team', (done) => {
  request(app).post('/api/teams').end((err, res) => {
    expect(res.status).toBe(201);
    done();
  });
});
```

### Issue 4: Mock Data Issues

```javascript
// Use consistent test context
const testContext = createTestContext();

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset database between test suites
afterEach(async () => {
  await db.query('DELETE FROM teams WHERE client_id = $1', [testContext.clientId]);
});
```

## Next Steps After Testing

1. **Documentation Update**
   - Update API documentation with test results
   - Document known limitations

2. **Performance Optimization**
   - Optimize slow queries
   - Add missing indexes
   - Implement caching

3. **Bug Fixes**
   - Fix any issues found during testing
   - Verify fixes don't break other tests

4. **Security Hardening**
   - Implement recommendations from security audit
   - Add additional security headers
   - Review error messages for information leaks

5. **Deployment Preparation**
   - Create deployment checklist
   - Document rollback procedures
   - Prepare production configuration

## Files Created in Phase 5

```
Backend/
├── tests/
│   ├── setup.js                          # 50 lines
│   ├── utils/
│   │   └── testHelpers.js               # 200 lines
│   └── integration/
│       ├── teams.test.js                # 380 lines
│       └── multiTenantIsolation.test.js # 450 lines

Backend/
└── .env.test                             # 15 lines

Frontend/
├── src/
│   └── tests/
│       └── TeamsDashboard.test.jsx      # 350 lines
```

**Total Phase 5 Test Code: ~1,445 lines**

## Success Criteria

✅ All backend tests pass (100%)
✅ All frontend tests pass (100%)
✅ Code coverage >85%
✅ No multi-tenant violations
✅ All performance targets met (<200ms)
✅ All security tests pass
✅ Documentation complete
✅ Ready for Phase 6

---

**Status: Phase 5 Testing Framework Created**
**Next: Execute tests and fix any failures**
