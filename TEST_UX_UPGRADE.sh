#!/bin/bash

# ============================================
# UX/UI Upgrade - Quick Testing Script
# ============================================

echo "╔════════════════════════════════════════════╗"
echo "║   UX/UI Upgrade - Testing Suite           ║"
echo "║   Date: November 29, 2025                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check Frontend Files
echo -e "${BLUE}🧪 TEST 1: Frontend Files Verification${NC}"
echo "=================================================="

FRONTEND_FILES=(
  "Frontend/src/pages/AnalyticsPageNew.jsx"
  "Frontend/src/pages/CallHistoryPageNew.jsx"
  "Frontend/src/pages/TeamsPageNew.jsx"
  "Frontend/src/components/UI/KPICard.jsx"
  "Frontend/src/components/UI/FilterBar.jsx"
)

for file in "${FRONTEND_FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo -e "${GREEN}✅${NC} $file ($lines lines)"
  else
    echo -e "${RED}❌${NC} $file (NOT FOUND)"
  fi
done
echo ""

# Test 2: Check Backend Files
echo -e "${BLUE}🧪 TEST 2: Backend Files Verification${NC}"
echo "=================================================="

BACKEND_FILES=(
  "Backend/routes/teamsRoutes.js"
  "Backend/migrations/teamsMigration.js"
  "Backend/database/initializeDb.js"
)

for file in "${BACKEND_FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo -e "${GREEN}✅${NC} $file ($lines lines)"
  else
    echo -e "${RED}❌${NC} $file (NOT FOUND)"
  fi
done
echo ""

# Test 3: Check npm dependencies
echo -e "${BLUE}🧪 TEST 3: Frontend Dependencies Check${NC}"
echo "=================================================="

DEPENDENCIES=(
  "recharts"
  "date-fns"
  "react-query"
  "react-hot-toast"
  "fuse.js"
  "papaparse"
  "jspdf"
  "html2canvas"
  "react-player"
  "react-markdown"
  "react-infinite-scroll-component"
)

cd Frontend 2>/dev/null
if [ -f "package.json" ]; then
  for dep in "${DEPENDENCIES[@]}"; do
    if grep -q "\"$dep\":" package.json; then
      echo -e "${GREEN}✅${NC} $dep installed"
    else
      echo -e "${RED}❌${NC} $dep missing"
    fi
  done
else
  echo -e "${RED}❌${NC} package.json not found"
fi
cd ..
echo ""

# Test 4: Code Quality Checks
echo -e "${BLUE}🧪 TEST 4: Code Quality Metrics${NC}"
echo "=================================================="

TOTAL_LINES=0
TOTAL_FILES=0

for file in "${FRONTEND_FILES[@]}" "${BACKEND_FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    TOTAL_LINES=$((TOTAL_LINES + lines))
    TOTAL_FILES=$((TOTAL_FILES + 1))
  fi
done

echo -e "Total Files: ${GREEN}$TOTAL_FILES${NC}"
echo -e "Total Lines: ${GREEN}$TOTAL_LINES${NC}"
echo -e "Avg Lines/File: ${GREEN}$((TOTAL_LINES / TOTAL_FILES))${NC}"
echo ""

# Test 5: Integration Points Check
echo -e "${BLUE}🧪 TEST 5: Integration Points Check${NC}"
echo "=================================================="

if grep -q "teamsRoutes" Backend/server.js; then
  echo -e "${GREEN}✅${NC} Teams route registered in server.js"
else
  echo -e "${RED}❌${NC} Teams route NOT registered in server.js"
fi

if [ -d "Frontend/src/components/UI" ]; then
  echo -e "${GREEN}✅${NC} UI components directory created"
else
  echo -e "${RED}❌${NC} UI components directory NOT found"
fi

if [ -d "Frontend/src/components/Analytics" ]; then
  echo -e "${GREEN}✅${NC} Analytics components directory created"
else
  echo -e "${RED}❌${NC} Analytics components directory NOT found"
fi

if [ -d "Backend/migrations" ]; then
  echo -e "${GREEN}✅${NC} Migrations directory created"
else
  echo -e "${RED}❌${NC} Migrations directory NOT found"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ Testing Suite Complete               ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Run database migrations: node Backend/database/initializeDb.js"
echo "2. Start backend: cd Backend && npm start"
echo "3. Start frontend: cd Frontend && npm start"
echo "4. Test API endpoints with Postman"
echo "5. Verify UI renders correctly"
echo "6. Commit changes: git add . && git commit -m 'Complete UX/UI upgrade with teams management'"
echo "7. Push to main: git push origin main"
echo ""
