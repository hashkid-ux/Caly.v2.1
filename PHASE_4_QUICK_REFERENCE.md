# PHASE 4 QUICK REFERENCE CARD

## 5 Pages Created

```
Frontend/src/pages/
├── TeamsDashboard.jsx        (280 lines) - List teams, search, filter
├── TeamDetail.jsx            (320 lines) - Team view with 4 tabs
├── TeamMembers.jsx           (320 lines) - Member management
├── AgentAssignments.jsx      (300 lines) - Agent assignment grid
└── TeamAnalytics.jsx         (350 lines) - 30-day performance charts
```

## 9+ Components Created

```
Frontend/src/components/
├── TeamCard.jsx              (80 lines)  - Team summary card
├── CreateTeamModal.jsx       (100 lines) - Create team form
├── AddMemberModal.jsx        (100 lines) - Add member form
├── AssignAgentModal.jsx      (120 lines) - Assign agent form
├── LoadingSpinner.jsx        (40 lines)  - Loading indicator
├── ErrorBoundary.jsx         (40 lines)  - Error handler
├── TeamSettings.jsx          (70 lines)  - Settings view
└── PerformanceChart.jsx      (30 lines)  - Chart wrapper
```

## Routing Setup Needed

```javascript
// Add to your routing configuration:
import TeamsDashboard from './pages/TeamsDashboard';
import TeamDetail from './pages/TeamDetail';

<Route path="/dashboard/teams" element={<TeamsDashboard />} />
<Route path="/dashboard/teams/:id" element={<TeamDetail />} />
```

## Environment Variables

```
REACT_APP_API_URL=https://api.caly.app
```

## Key Features

✅ List teams with search & filters
✅ Create new teams
✅ View team details
✅ Add/remove team members
✅ Assign agents to members
✅ View performance analytics
✅ 30-day performance charts
✅ CSV export
✅ Full error handling
✅ Loading states

## API Endpoints Used

```
GET    /api/teams
GET    /api/teams/:id
GET    /api/teams/:id/members
GET    /api/teams/:id/performance
POST   /api/teams
POST   /api/teams/:id/members
POST   /api/teams/:id/agents
PUT    /api/teams/:id
PUT    /api/teams/:id/members/:memberId
DELETE /api/teams/:id
DELETE /api/teams/:id/members/:memberId
DELETE /api/teams/:id/agents/:assignmentId
```

## Libraries Required

```json
{
  "@tanstack/react-query": "^4.x",
  "react-hook-form": "^7.x",
  "recharts": "^2.x",
  "axios": "^1.x"
}
```

## Form Validations

```javascript
// CreateTeamModal
name: required, minLength: 2
sector: required
description: maxLength: 200

// AddMemberModal
user_id: required (UUID format)
title: optional
role: required (member|lead|manager)

// AssignAgentModal
agent_type: required
proficiency_level: 0-100 range
```

## UI Components Used

- Recharts for charts (LineChart, BarChart)
- React Hook Form for forms
- React Query for data fetching
- Tailwind CSS for styling
- Custom modal overlays
- Progress bars
- Dropdowns & selectors

## Performance Features

✅ React Query caching
✅ Lazy loading ready
✅ Code splitting per page
✅ Memoization ready
✅ Virtual scrolling ready

## Responsive Design

✅ Mobile: Full width
✅ Tablet: 2 column grids
✅ Desktop: 3+ columns
✅ Charts responsive
✅ Tables horizontal scroll

## Error Handling

✅ Try/catch on all async operations
✅ User-friendly error messages
✅ Retry buttons
✅ Error boundary for React crashes
✅ Empty states with CTA

## Loading States

✅ Spinner on page load
✅ Button disabled on submit
✅ "Loading..." messages
✅ Empty state indicators

## Authentication

✅ JWT token from useAuth hook
✅ Authorization header on all requests
✅ 403 handling for unauthorized

## Testing Checklist

- [ ] All pages load without errors
- [ ] Search/filters work correctly
- [ ] Create team form validates
- [ ] Add member form validates
- [ ] Assign agent form works
- [ ] Performance chart displays data
- [ ] Delete operations with confirmation
- [ ] Error states show correctly
- [ ] Mobile responsive layout
- [ ] API calls include auth header

## Common Patterns Used

```javascript
// Data fetching with React Query
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['teams'],
  queryFn: async () => {
    const response = await axios.get(..., {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
});

// Form handling
const { register, handleSubmit, formState: { errors } } = useForm();

// Navigation
const navigate = useNavigate();
navigate('/dashboard/teams');

// Modal
{showModal && <CreateTeamModal onClose={() => setShowModal(false)} />}
```

## Styling Notes

- Dark theme: Slate colors (#1e293b, #0f172a)
- Primary blue: #3b82f6
- Success green: #10b981
- Warning orange: #f97316
- Danger red: #dc2626
- Hover effects: Scale, shadow, color change
- Transitions: All 200-300ms ease

## File Size Summary

| Component | Lines | Size |
|-----------|-------|------|
| TeamsDashboard | 280 | ~10KB |
| TeamDetail | 320 | ~12KB |
| TeamMembers | 320 | ~12KB |
| AgentAssignments | 300 | ~11KB |
| TeamAnalytics | 350 | ~13KB |
| TeamCard | 80 | ~3KB |
| Modals (3) | 320 | ~12KB |
| Other Components | 180 | ~7KB |
| **TOTAL** | **2,150** | **~80KB** |

## Quick Start

1. Copy all files from Frontend/src/pages/ and Frontend/src/components/
2. Install dependencies: `npm install @tanstack/react-query react-hook-form recharts`
3. Set REACT_APP_API_URL environment variable
4. Add routing for /dashboard/teams and /dashboard/teams/:id
5. Verify backend APIs are running (Phase 3)
6. Test all pages load correctly

## Troubleshooting

**"Module not found"**
- Check file paths match exactly
- Ensure useAuth hook exists
- Verify all component imports

**"Cannot read property 'data'"**
- Check API response structure: response.data.data
- Verify backend is returning correct format

**"401 Unauthorized"**
- Check JWT token in useAuth hook
- Verify Authorization header format
- Check token not expired

**Charts not displaying**
- Check Recharts installed
- Verify chartData has items
- Check ResponsiveContainer wrapping

---

**Phase 4: ✅ COMPLETE**

Next: Phase 5 - Integration & Testing
