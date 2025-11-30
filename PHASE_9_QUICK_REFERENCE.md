# Phase 9 - QA Workflow Quick Reference Guide

## What Was Built

Phase 9 adds a **QA Workflow & Call Review System** that allows supervisors to:
- Review agent calls with structured feedback
- Score calls on 7 categories (0-100 scale)
- Flag underperforming calls for improvement
- Assign coaching with progress tracking
- Track team performance metrics

---

## Quick Start

### 1. Review a Call (Supervisor)

```
1. Navigate to QA Dashboard → Pending Review tab
2. Click on call to open detail view
3. Fill out review form:
   - Set overall score (0-100)
   - Rate 7 performance categories
   - Add general feedback
   - Mark status: Completed or Flagged
4. Optional: Assign coaching topic
5. Click "Submit Review"
```

### 2. View Team Performance

```
1. Go to QA Dashboard → Team Performance tab
2. View:
   - Team average QA score
   - Individual team member scores
   - Flagged call counts
   - Performance by category (7 categories)
3. Sort by: QA Score, Reviews Completed, Flagged Calls
```

### 3. Create Coaching Assignment

```
1. Go to QA Dashboard → Coaching tab
2. Click "New Assignment"
3. Select:
   - Team member
   - Topic (9 predefined topics)
   - Target date
   - Priority (low/medium/high)
4. Add description (why they need coaching)
5. Click "Create Assignment"
```

### 4. Track Coaching Progress

```
1. Go to Coaching tab
2. Click on assignment to expand
3. Click "Log Session" to record:
   - Session date
   - Topics covered
   - Progress score (0-10)
   - Notes
4. View average progress over time
```

---

## API Endpoints

### Call Review Operations
```
GET  /api/qa/calls-to-review                    # List calls
GET  /api/qa/calls/:callId/review               # Get call details
POST /api/qa/calls/:callId/review               # Submit review
```

### Team Metrics
```
GET /api/qa/team-member/:memberId/qa-metrics    # Get metrics
```

### Coaching Management
```
GET  /api/qa/team-member/:memberId/coaching     # List assignments
POST /api/qa/team-member/:memberId/coaching     # Create assignment
POST /api/qa/coaching/:assignmentId/progress    # Log progress
```

---

## Database Tables

### qa_reviews
- Stores supervisor reviews of calls
- Columns: call_id, supervisor_id, qa_score (0-100), status, feedback, coaching_needed
- Indexes: On call_id, supervisor_id, created_at

### qa_feedback
- Stores category-specific feedback
- Columns: call_id, category, score, notes
- Categories: communication, problem_solving, product_knowledge, empathy, resolution, efficiency, compliance

### coaching_assignments
- Stores coaching plans
- Columns: team_member_id, supervisor_id, topic, target_date, priority, status
- Statuses: active, completed, on-hold

### coaching_progress
- Stores coaching session records
- Columns: assignment_id, supervisor_id, session_date, topic_covered, progress_score, notes

### team_members (updated)
- Added columns: qa_score, reviews_completed, flagged_count

---

## Frontend Components

### Pages
- `QADashboard.jsx` - Main QA page with 4 tabs

### Components
- `CallReviewForm.jsx` - Review submission form
- `QAMetricsPanel.jsx` - Team performance metrics
- `CoachingPanel.jsx` - Coaching assignments & progress
- `CallReviewCard.jsx` - Call details display

### Hooks
- `useQA.js` - QA operations (fetch, submit, etc.)

---

## Performance Categories

Supervisors rate agents on 7 categories:

1. **Communication Skills** - Clarity, listening, greeting
2. **Problem Solving** - Analysis, troubleshooting, creativity
3. **Product Knowledge** - Feature awareness, accuracy
4. **Empathy** - Understanding customer, tone, patience
5. **Resolution Quality** - Fixing issues, follow-up
6. **Efficiency** - Call duration, after-call work, speed
7. **Compliance** - Policies, data handling, protocols

Each category: 0-100 scale
- 90+: Excellent
- 80-89: Good
- 70-79: Fair
- 60-69: Poor
- <60: Failing

---

## Coaching Topics

When flagging for coaching, supervisors can assign:
- Communication Enhancement
- Problem Solving Techniques
- Product Knowledge Training
- Customer Empathy Development
- Efficiency Improvement
- Compliance Training
- Conflict Resolution
- Upselling Techniques
- Other (custom)

---

## QA Score Calculation

**Rolling 30-Day Average:**
```
QA Score = Average(qa_score) WHERE created_at > NOW() - 30 days
```

Updated automatically when:
- New review submitted
- Old review >30 days drops off

Used for:
- Team performance ranking
- Performance dashboard display
- Coaching prioritization

---

## File Structure

```
Backend/
├── routes/qa.js              # 7 QA endpoints
├── migrations/
│   └── 101_add_qa_workflow.js # Database schema

Frontend/
├── pages/
│   └── QADashboard.jsx        # Main QA page
├── components/
│   ├── CallReviewForm.jsx     # Review form
│   ├── QAMetricsPanel.jsx     # Metrics display
│   ├── CoachingPanel.jsx      # Coaching management
│   └── CallReviewCard.jsx     # Call details
├── hooks/
│   └── useQA.js               # API hook
└── styles/
    ├── QADashboard.css
    ├── CallReviewForm.css
    ├── QAMetricsPanel.css
    ├── CoachingPanel.css
    └── CallReviewCard.css
```

---

## Integration Points

### Server.js
```javascript
app.use('/api/qa', authMiddleware, require(resolve('routes/qa')));
```

### Multi-Tenancy
- All endpoints require authentication
- Data filtered by client_id
- Team member ownership verified
- Supervisor access validated

### Error Handling
- All operations wrapped in try-catch
- Structured error responses
- Winston logging for audit trail
- 30-second timeouts on all operations

---

## Testing Checklist

### API Testing
- [ ] GET /api/qa/calls-to-review returns pending calls
- [ ] GET /api/qa/calls/:id/review returns call details
- [ ] POST /api/qa/calls/:id/review creates review
- [ ] GET /api/qa/team-member/:id/qa-metrics returns metrics
- [ ] QA score updates after review submission

### UI Testing
- [ ] QA Dashboard loads with 4 tabs
- [ ] Pending calls display with status
- [ ] Click call opens review form
- [ ] Form validation works (score 0-100)
- [ ] Category sliders update scores
- [ ] Review submission succeeds
- [ ] Metrics table updates after submission
- [ ] Coaching form creates assignment
- [ ] Progress sessions log correctly
- [ ] Responsive on mobile/tablet

### Data Testing
- [ ] qa_reviews table populated
- [ ] qa_feedback items created by category
- [ ] team_members.qa_score updated
- [ ] coaching_assignments created
- [ ] coaching_progress tracked

---

## Troubleshooting

### QA Score Not Updating
```sql
-- Check qa_reviews were created
SELECT * FROM qa_reviews WHERE created_at > NOW() - INTERVAL '1 day';

-- Manually recalculate
SELECT AVG(qa_score) FROM qa_reviews 
WHERE team_member_id = $1 AND created_at > NOW() - INTERVAL '30 days';
```

### Missing Coaching Assignments
```sql
-- Check team_member ownership
SELECT * FROM coaching_assignments WHERE team_member_id = $1;

-- Verify team membership
SELECT * FROM team_members WHERE id = $1 AND client_id = $2;
```

### Form Validation Errors
- Check CallReviewForm.jsx constraints
- Verify score range: 0-100
- Required fields: qa_score, status, at least one feedback item

### Performance Issues
- Query slow on qa_reviews: Check indexes were created
- Slow metrics: Consider caching via Redis
- Frontend slow: Use React DevTools profiler

---

## API Response Examples

### List Calls
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "phone_from": "+91-9876543210",
      "team_member_id": 45,
      "team_member_name": "John Doe",
      "created_at": "2025-11-30T10:30:00Z",
      "duration": 300,
      "reviews": [
        {
          "id": 1,
          "qa_score": 85,
          "status": "completed",
          "feedback": "Good performance..."
        }
      ]
    }
  ]
}
```

### Submit Review
```json
{
  "success": true,
  "data": {
    "review_id": 1,
    "qa_score": 85,
    "status": "completed",
    "feedback_items": 7,
    "team_member_updated_score": 82
  }
}
```

### Team Metrics
```json
{
  "success": true,
  "data": {
    "total_reviews": 25,
    "avg_qa_score": 82.5,
    "flagged_reviews": 3,
    "coaching_needed_count": 2,
    "feedback_breakdown": {
      "communication": 80,
      "problem_solving": 85,
      "product_knowledge": 78,
      "empathy": 88,
      "resolution": 82,
      "efficiency": 84,
      "compliance": 90
    }
  }
}
```

---

## Deployment Checklist

- [ ] Run migration: `npm run init-db`
- [ ] Verify tables created: `\dt qa_*` in psql
- [ ] Verify indexes: `\di qa_*` in psql
- [ ] Deploy backend: Restart application
- [ ] Deploy frontend: Build and deploy
- [ ] Test QA endpoints with valid JWT token
- [ ] Test UI workflows (review, coaching, metrics)
- [ ] Monitor error logs for 24 hours
- [ ] Verify QA scores update in real-time
- [ ] Backup database before deployment

---

## Key Metrics to Monitor

**Server-Side:**
- QA endpoint response times (target: <500ms)
- Migration execution time
- Index hit rates on qa_reviews
- Error rate on review submissions

**Client-Side:**
- QA Dashboard load time (target: <1s)
- Form submission latency
- Metrics table render performance

**Business:**
- % of calls reviewed daily
- Average QA score trend (should improve over time)
- Coaching completion rate
- Flagged call resolution rate

---

## Phase 9 → Phase 10 Preview

Possible enhancements for Phase 10:
- Automated QA rules engine (compliance checks)
- Performance trend charts and analytics
- Call recording playback during review
- Training material linking to feedback
- Escalation workflows based on QA scores
- Mobile QA app for on-the-go reviews

---

**Last Updated:** November 30, 2025  
**Status:** Production Ready ✅  
**Questions?** Refer to PHASE_9_IMPLEMENTATION_COMPLETE.md for full documentation
