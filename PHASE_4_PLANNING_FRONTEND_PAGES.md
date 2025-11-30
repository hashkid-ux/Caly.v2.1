# Phase 4 Planning: Frontend Pages Implementation

## Overview
Phase 3 ✅ Backend API Implementation is COMPLETE.

Next: Implement frontend pages that consume these new APIs.

**Timeline:** 2-3 days estimated
**Priority:** HIGH - Frontend enables user access to team features

---

## Pages to Create (5 total)

### 1. Teams Dashboard (`Frontend/pages/TeamsDashboard.jsx`)
**Location:** `/dashboard/teams`

**Features:**
- [ ] List all teams with filters (sector, status, member count)
- [ ] Search teams by name
- [ ] Create new team button
- [ ] Team cards with:
  - Team name, sector, member count
  - Today's performance metrics
  - Lead name (if assigned)
  - Status badge (active/inactive)
- [ ] Sort by: name, sector, performance, created date

**API Calls:**
```
GET /api/teams - List teams
GET /api/teams/{id} - Team details
POST /api/teams - Create team
PUT /api/teams/{id} - Update team
DELETE /api/teams/{id} - Soft delete
```

**UI Components:**
- TeamCard (reusable component)
- TeamFilters (search, sector dropdown, status)
- CreateTeamModal (form with validation)

---

### 2. Team Details Page (`Frontend/pages/TeamDetail.jsx`)
**Location:** `/dashboard/teams/:id`

**Features:**
- [ ] Team header with: name, sector, member count, status
- [ ] Tabs:
  1. **Members** - Team member management
  2. **Performance** - 30-day metrics chart
  3. **Agents** - Agent assignments
  4. **Settings** - Team configuration

**API Calls:**
```
GET /api/teams/{id} - Team with members & performance
GET /api/teams/{id}/members - Full member list
GET /api/teams/{id}/performance - Historical metrics
PUT /api/teams/{id} - Update team
```

**UI Components:**
- MembersList (with add/remove)
- PerformanceChart (30-day trend)
- AgentAssignments (agent → member grid)
- TeamSettings (name, sector, lead)

---

### 3. Team Members Management (`Frontend/pages/TeamMembers.jsx`)
**Location:** `/dashboard/teams/:id/members`

**Features:**
- [ ] Add new member (user selection + role)
- [ ] Member table with:
  - Name, title, role, performance score
  - Assigned agents (chips)
  - Action buttons (edit, remove, view performance)
- [ ] Bulk assign agents to multiple members
- [ ] Performance history per member

**API Calls:**
```
POST /api/teams/{id}/members - Add member
PUT /api/teams/{id}/members/{memberId} - Update member
DELETE /api/teams/{id}/members/{memberId} - Remove member
GET /api/teams/{id}/members - List members
```

**UI Components:**
- MemberForm (add/edit member)
- MemberTable (sortable, filterable)
- AgentAssignmentForm (select agents for member)
- MemberPerformance (30-day chart)

---

### 4. Agent Assignments (`Frontend/pages/AgentAssignments.jsx`)
**Location:** `/dashboard/teams/:id/agents`

**Features:**
- [ ] View current agent assignments
- [ ] Assign agents to team members
- [ ] Update agent proficiency levels
- [ ] Remove agent assignments
- [ ] Agent performance matrix:
  - Agent type vs team member grid
  - Color-coded by success rate
- [ ] Bulk operations:
  - Assign same agent to multiple members
  - Update proficiency for group

**API Calls:**
```
POST /api/teams/{id}/agents - Assign agent
PUT /api/teams/{id}/agents/{assignmentId} - Update
DELETE /api/teams/{id}/agents/{assignmentId} - Unassign
GET /api/teams/{id}/members - Get assignments
```

**UI Components:**
- AgentAssignmentGrid (agent × member matrix)
- AssignmentForm (assign new agent)
- ProficiencySelector (1-100 slider)
- BulkAssignmentModal

---

### 5. Team Performance Analytics (`Frontend/pages/TeamAnalytics.jsx`)
**Location:** `/dashboard/teams/:id/analytics`

**Features:**
- [ ] 30-day performance chart
- [ ] KPIs: calls handled, completion rate, satisfaction
- [ ] Agent performance breakdown
- [ ] Member comparison (side-by-side)
- [ ] Trend indicators (up/down arrows)
- [ ] Export to CSV

**API Calls:**
```
GET /api/teams/{id}/performance - Performance data
GET /api/analytics/agents - Agent metrics
GET /api/analytics/teams - Team metrics
```

**UI Components:**
- PerformanceChart (multi-line, 30 days)
- KPICard (4 cards: calls, completion%, satisfaction, escalation%)
- AgentComparison (bar chart)
- ExportButton (CSV generator)

---

## Shared Components (Reusable)

### `TeamCard.jsx`
- Team name, sector, member count
- Status badge, last updated
- Click → navigate to detail page

### `MemberCard.jsx`
- Member name, title, role
- Performance score badge
- Assigned agents (chip list)

### `AgentBadge.jsx`
- Agent type (color-coded)
- Proficiency level (percentage)
- Success rate (tooltip)

### `PerformanceChart.jsx`
- Recharts multi-line chart
- Data: calls, completion, satisfaction
- Date range selector

---

## State Management

### Context Needed
```javascript
// TeamsContext
- teams: []
- selectedTeam: {}
- members: []
- performance: {}
- loading: false
- error: null

// Methods
- fetchTeams()
- fetchTeamDetail(id)
- createTeam(data)
- updateTeam(id, data)
- addMember(id, data)
- removeTeam(id)
```

### Redux Store (Alternative)
```
store/teams/
  - actions.js (fetchTeams, createTeam, etc)
  - reducer.js (teams state)
  - selectors.js (computed values)
```

---

## Form Validations

### Create/Edit Team Form
```javascript
{
  name: { required, minLength: 2, maxLength: 50 },
  sector: { required, enum: ['healthcare', 'retail', 'finance', ...] },
  description: { maxLength: 200 },
  lead_id: { optional, type: uuid }
}
```

### Add Member Form
```javascript
{
  user_id: { required, type: uuid },
  title: { optional, maxLength: 50 },
  role: { required, enum: ['member', 'lead', 'manager'] }
}
```

### Assign Agent Form
```javascript
{
  agent_type: { required, enum: [...] },
  proficiency_level: { required, min: 0, max: 100 }
}
```

---

## Integration Points

### API Endpoints Already Ready
✅ GET /api/teams
✅ GET /api/teams/:id
✅ GET /api/teams/:id/members
✅ GET /api/teams/:id/performance
✅ POST /api/teams
✅ POST /api/teams/:id/members
✅ POST /api/teams/:id/agents
✅ PUT /api/teams/:id
✅ PUT /api/teams/:id/members/:memberId
✅ DELETE /api/teams/:id
✅ DELETE /api/teams/:id/members/:memberId
✅ DELETE /api/teams/:id/agents/:assignmentId

### Authentication
- All endpoints require: `Authorization: Bearer {token}`
- Token includes: `client_id` (multi-tenant enforcement)
- Frontend: Use existing `useAuth()` hook for token

### Error Handling
- 404: Resource not found → show "Team not found" message
- 403: Unauthorized → redirect to dashboard
- 500: Server error → show retry button
- Network error → offline indicator

---

## UI/UX Considerations

### Routing Structure
```
/dashboard
  /teams - Teams list page
  /teams/:id - Team detail page (with tabs)
    /teams/:id/members - Members tab
    /teams/:id/agents - Agents tab
    /teams/:id/performance - Performance tab
  /teams/new - Create team page
```

### Navigation Updates
Add to dashboard sidebar:
```javascript
{
  label: 'Teams',
  icon: 'users',
  path: '/dashboard/teams'
}
```

### Breadcrumb Navigation
```
Dashboard > Teams > Team Name > Members
```

### Empty States
- No teams: "Create your first team to get started"
- No members: "Add team members to assign agents"
- No data: "Check back when calls are completed"

---

## Performance Considerations

### Data Loading Strategy
1. **Initial load:** List page → lazy load team details
2. **Pagination:** Load 10 teams per page
3. **Member list:** Load all members (usually < 100)
4. **Performance data:** Load last 30 days (cached)

### Caching Strategy
```javascript
// Cache team list for 5 minutes
const TEAM_CACHE_DURATION = 5 * 60 * 1000;

// Cache performance metrics for 1 hour
const PERFORMANCE_CACHE_DURATION = 60 * 60 * 1000;
```

### API Request Debouncing
- Search: Debounce 500ms
- Filter: Immediate (no debounce)
- Sort: Immediate (no debounce)

---

## Testing Strategy

### Unit Tests
- [ ] TeamCard component renders correctly
- [ ] Form validation works
- [ ] API error handling

### Integration Tests
- [ ] Create team → Appears in list
- [ ] Add member → Member count updates
- [ ] Delete member → Performance updates

### E2E Tests
- [ ] Create team → Add members → Assign agents → View analytics
- [ ] Filter teams by sector
- [ ] Sort by performance

---

## Dependencies Needed

### NPM Packages
```json
{
  "react-router-dom": "^6.x",
  "recharts": "^2.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@headlessui/react": "^1.x"
}
```

### Already Available
- ✅ Tailwind CSS (styling)
- ✅ React Query (data fetching)
- ✅ Zustand (state management)

---

## Next Steps

### Phase 4 Execution Plan
1. **Day 1:** Create base pages + routing
   - [ ] TeamsDashboard.jsx
   - [ ] Update sidebar navigation
   - [ ] Set up TeamsContext

2. **Day 2:** Implement team management
   - [ ] CreateTeamModal
   - [ ] TeamDetail page
   - [ ] Add/remove members

3. **Day 3:** Complete analytics & polish
   - [ ] AgentAssignments page
   - [ ] PerformanceChart component
   - [ ] Export functionality
   - [ ] Error handling & loading states

### Code Quality Gate
Before Phase 5:
- [ ] All pages passing ESLint
- [ ] No unused variables
- [ ] Consistent styling (Tailwind)
- [ ] Responsive design (mobile tested)
- [ ] Loading states on all async operations
- [ ] Error messages for all failures

---

**Ready to begin Phase 4? Check the files:**
- ✅ `Backend/routes/teamsRoutes.js` - All endpoints implemented
- ✅ `Backend/services/agentRouter.js` - Routing engine ready
- ✅ `Backend/services/performanceAggregator.js` - Metrics collection running

**Frontend can now start building on solid backend foundation!**
