#!/usr/bin/env bash

# Phase 5 Test Runner
# Executes all integration tests with proper setup and teardown

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Phase 5: Integration Testing${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: Check dependencies
echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies found${NC}"
echo ""

# Step 2: Setup test database
echo -e "${YELLOW}[2/6] Setting up test database...${NC}"

# Check if test database exists
if psql -lqt | cut -d \| -f 1 | grep -qw caly_test; then
    echo -e "${YELLOW}Test database already exists, skipping creation...${NC}"
else
    echo -e "${YELLOW}Creating test database...${NC}"
    createdb caly_test || echo -e "${YELLOW}Database may already exist${NC}"
fi

echo -e "${GREEN}✅ Test database ready${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install --save-dev jest supertest @testing-library/react @testing-library/user-event @testing-library/dom > /dev/null 2>&1
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Run backend tests
echo -e "${YELLOW}[4/6] Running backend integration tests...${NC}"
echo ""

if npm test -- Backend/tests/integration/teams.test.js --coverage 2>/dev/null; then
    echo -e "${GREEN}✅ Backend API tests passed${NC}"
else
    echo -e "${RED}❌ Backend API tests failed${NC}"
    exit 1
fi

echo ""

# Step 5: Run multi-tenant security tests
echo -e "${YELLOW}[5/6] Running multi-tenant isolation tests...${NC}"
echo ""

if npm test -- Backend/tests/integration/multiTenantIsolation.test.js 2>/dev/null; then
    echo -e "${GREEN}✅ Multi-tenant security tests passed${NC}"
else
    echo -e "${RED}❌ Multi-tenant security tests failed${NC}"
    exit 1
fi

echo ""

# Step 6: Run frontend tests
echo -e "${YELLOW}[6/6] Running frontend component tests...${NC}"
echo ""

if npm test --prefix Frontend -- Frontend/src/tests/TeamsDashboard.test.jsx --coverage 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend component tests passed${NC}"
else
    echo -e "${RED}❌ Frontend component tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Summary:"
echo "  Backend API Tests: PASSED"
echo "  Multi-Tenant Tests: PASSED"
echo "  Frontend Tests: PASSED"
echo "  Code Coverage: Generated"
echo ""
echo "Next Steps:"
echo "  1. Review test coverage reports"
echo "  2. Fix any performance issues"
echo "  3. Document test results"
echo "  4. Proceed to Phase 6"
echo ""
