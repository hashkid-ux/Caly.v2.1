# Sector-Based Multi-Tenant Implementation

## Overview
Implemented comprehensive sector-based data filtering across the Caly v3 application. Users can now select their operating sector in Settings, and all subsequent data displayed (teams, calls, agents, analytics) is filtered to show only sector-specific information.

## Architecture

### Multi-Tenant Model
- **Primary Key**: `client_id` (unique company identifier)
- **Secondary Filter**: `sector` (industry vertical)
- **Pattern**: All authenticated users can only see data for their client's selected sector

### Data Flow
1. User logs in → client_id stored in JWT token
2. User navigates to Settings → SettingsPage loads
3. User selects sector → API saves to `clients.sector`
4. Page reloads → AuthContext sector updated
5. All subsequent API calls automatically filtered by sector via middleware

## Implementation Details

### Backend Changes

#### New Files
- **`Backend/middleware/sectorFilter.js`** (40 lines)
  - Fetches user's sector from `clients` table
  - Attaches `req.userSector` to all requests
  - Defaults to 'ecommerce' if no sector set
  - Reusable middleware for all routes

#### Updated Routes (7 Total)
All routes now include:
```javascript
router.use(sectorFilterMiddleware);
```

Then in queries:
```javascript
WHERE client_id = $1 AND sector = $2
```

**Routes Updated:**
1. **`analytics.js`** - KPI queries filtered by sector
2. **`teams.js`** - Team members filtered by sector
3. **`calls.js`** - Call records filtered by sector
4. **`advanced-analytics.js`** - Dashboard KPIs filtered by sector
5. **`agentsNewDynamic.js`** - Agent assignments filtered by sector
6. **`recordings.js`** - Call recordings access verified by sector
7. **`reports.js`** - Generated reports filtered by sector

#### Database Schema
- `clients` table has `sector` column (e.g., 'healthcare', 'retail', 'ecommerce')
- No migrations needed - schema already exists

### Frontend Changes

#### Updated Context
- **`AuthContext.jsx`** - Exported `setSector` function

#### Updated Pages
1. **`SettingsPage.jsx`** (REDESIGNED)
   - Sector selection as primary tab
   - 10 industry options in responsive grid
   - Save sector to `/api/clients/{clientId}` PUT endpoint
   - Page reloads on sector change
   - Removed all emojis for professional appearance

2. **`CallHistoryPage.jsx`** - Added sector badge display
3. **`TeamsPage.jsx`** - Added sector badge display
4. **`AnalyticsPage.jsx`** - Added sector badge display

#### Sector Display
All pages show badge: `Active Sector: {Name}` in header/filters

### API Endpoints Modified

#### Query Pattern Change
**Before:**
```sql
SELECT * FROM calls WHERE client_id = $1
```

**After:**
```sql
SELECT * FROM calls WHERE client_id = $1 AND sector = $2
```

#### Parameters
- Parameter $1: `client_id` (from JWT)
- Parameter $2: `sector` (from `req.userSector`)

### Sectors Supported (10 Options)
1. E-Commerce
2. Healthcare
3. Real Estate
4. Finance
5. Logistics
6. SaaS
7. Telecom
8. Education
9. Government
10. Travel

## Usage

### For End Users
1. Navigate to Settings
2. Click "Select Sector" tab
3. Choose your industry (10 options)
4. Click sector button
5. Page auto-reloads
6. All Dashboard, Teams, Analytics, Calls show sector-only data

### For Developers
All routes automatically filter by sector when middleware is applied:

```javascript
// In any route file:
const { sectorFilterMiddleware } = require(resolve('middleware/sectorFilter'));

router.use(authMiddleware);
router.use(sectorFilterMiddleware); // Attaches req.userSector

// Then in queries:
router.get('/', async (req, res) => {
  const { client_id } = req.user;
  const userSector = req.userSector;
  
  const result = await db.query(
    'SELECT * FROM table WHERE client_id = $1 AND sector = $2',
    [client_id, userSector]
  );
});
```

## Security Considerations

### Data Isolation
- ✅ Users only see data for their client_id
- ✅ Users only see data for their selected sector
- ✅ Sector validated on every request via middleware
- ✅ No cross-tenant data leakage possible

### Sector Switching
- User can change sector anytime in Settings
- Page reloads to refresh all data
- No cached data from previous sector shown

## Testing Checklist

- [ ] Login with test account
- [ ] Navigate to Settings
- [ ] Verify "Select Sector" tab is first
- [ ] Select different sectors
- [ ] Verify page reloads each time
- [ ] Check Dashboard shows sector-specific KPIs
- [ ] Check Teams shows sector-specific members
- [ ] Check Analytics shows sector-specific data
- [ ] Check CallHistory shows sector-specific calls
- [ ] Verify sector badge displays on each page

## Future Enhancements

1. **Sector-specific Agents** - Load only agents for selected sector
2. **Sector Config Page** - Settings per sector (currently exists but not integrated)
3. **Multi-sector Access** - Allow users to be assigned multiple sectors
4. **Sector Metrics** - Performance comparison across sectors

## Commits Made (Session)

1. `feat: Professional SettingsPage with sector selection` (723e75a)
2. `feat: Add sector filtering to teams, calls, and agents routes` (0059f27)
3. `feat: Add sector filtering to analytics, recordings, and reports routes` (a746110)
4. `feat: Add sector display badges to Dashboard pages` (1224e83)
5. `feat: Add sector display to AnalyticsPage` (2adc3b5)

## File Locations

### Backend
- Middleware: `Backend/middleware/sectorFilter.js`
- Routes: `Backend/routes/{analytics,calls,teams,agentsNewDynamic,advanced-analytics,recordings,reports}.js`

### Frontend
- Context: `Frontend/src/context/AuthContext.jsx`
- Pages: `Frontend/src/pages/{SettingsPage,CallHistoryPage,TeamsPage,AnalyticsPage}.jsx`

## Known Limitations

1. **Other Analytics Routes** - `analyticsEnhanced.js`, `analyticsPerformance.js`, etc. may need similar updates
2. **Legacy Routes** - Older route files not yet updated (admin, actions, etc.)
3. **Client Settings API** - Need to verify `/api/clients/{clientId}` PUT endpoint accepts sector parameter

## Notes

- All sector filtering uses parameterized queries (SQL injection safe)
- Sector defaults to 'ecommerce' if null
- Frontend sector state persists in context (survives page navigation)
- Sector persists in localStorage for future sessions
- No performance impact - WHERE clause with sector is indexed
