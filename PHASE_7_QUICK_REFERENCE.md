# Phase 7 Quick Reference Card

**Status:** ✅ Complete - 100%  
**Components:** Backend (7 routes, 5 services) + Frontend (5 dashboards)  
**Total Code:** 6,816 lines  

---

## File Reference Guide

### Backend Routes
| File | Endpoints | Purpose |
|------|-----------|---------|
| analyticsPerformance.js | 6 | Agent/sector metrics, rankings |
| analyticsQuality.js | 5 | Quality scores, FCR, issues |
| analyticsSatisfaction.js | 5 | CSAT, NPS, sentiment, feedback |
| analyticsRevenue.js | 7 | Revenue, costs, ROI analysis |
| predictions.js | 5 | Forecasts, anomalies, churn |
| reports.js | 7 | Report generation, export |
| metricsLive.js | 4 | Real-time metrics, health |

### Backend Services
| File | Methods | Purpose |
|------|---------|---------|
| AnalyticsProcessor.js | 7 | Metric aggregation, KPI calculation |
| PredictiveAnalytics.js | 6 | Forecasting, anomaly detection |
| MetricsCollector.js | 8 | Real-time collection, validation |
| CacheManager.js | 12 | Caching, TTL, invalidation |
| ReportGenerator.js | 8 | Report generation, formatting |

### Frontend Pages
| File | Metrics | Purpose |
|------|---------|---------|
| PerformanceDashboard.jsx | 7 | Agent/sector performance |
| CallAnalytics.jsx | 8 | Quality, FCR, issues |
| SatisfactionMetrics.jsx | 9 | CSAT, NPS, sentiment |
| RevenueAnalysis.jsx | 10 | Revenue, costs, ROI |
| PredictionsDashboard.jsx | 8 | Forecasts, anomalies, churn |

---

## API Quick Reference

### Performance API
```bash
GET /api/analytics/performance/metrics?days=7&agentId=123
GET /api/analytics/performance/rankings?days=7&limit=10
GET /api/analytics/performance/sector-comparison?days=7
```

### Quality API
```bash
GET /api/analytics/quality/metrics?days=7
GET /api/analytics/quality/fcr?days=7&sector=sales
GET /api/analytics/quality/issues?days=7&type=compliance
```

### Satisfaction API
```bash
GET /api/analytics/satisfaction/metrics?days=7
GET /api/analytics/satisfaction/sentiment?days=7&sentiment=positive
GET /api/analytics/satisfaction/feedback?days=7&limit=50
```

### Revenue API
```bash
GET /api/analytics/revenue/summary?days=7
GET /api/analytics/revenue/by-sector?days=7
GET /api/analytics/cost/summary?days=7&type=labor
GET /api/analytics/roi/summary?days=7
```

### Predictions API
```bash
GET /api/analytics/predictions/call-volume?days=7
GET /api/analytics/predictions/staffing?days=7
GET /api/analytics/predictions/anomalies?severity=high
GET /api/analytics/predictions/churn-risk?limit=50
```

### Reports API
```bash
POST /api/analytics/reports/generate {type: 'performance'}
GET /api/analytics/reports/performance?days=7
GET /api/analytics/reports/:id/export?format=pdf
POST /api/analytics/reports/schedule {frequency: 'daily'}
```

---

## Common Tasks

### Task 1: Get Performance Metrics
```javascript
// Frontend
const { data } = useQuery(
  ['performance', timeRange],
  async () => {
    const response = await fetch(`/api/analytics/performance/metrics?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
);
```

### Task 2: Collect Call Metrics
```javascript
// Backend
const MetricsCollector = require('./services/MetricsCollector');
await MetricsCollector.collectCallMetrics({
  callId: 'call123',
  agentId: 'agent123',
  talkTime: 300,
  qualityScore: 95
});
```

### Task 3: Get Predictions
```javascript
// Frontend
const { data: predictions } = useQuery(
  ['predictions', forecastDays],
  async () => {
    const response = await fetch(`/api/analytics/predictions/call-volume?days=${forecastDays}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
);
```

### Task 4: Cache Dashboard Data
```javascript
// Backend
const CacheManager = require('./services/CacheManager');
const data = await CacheManager.getOrSet(
  `dashboard:${clientId}`,
  async () => {
    // Fetch data here
    return metrics;
  },
  600 // 10 minute TTL
);
```

### Task 5: Generate Report
```javascript
// Frontend
const generateReport = async (type) => {
  const response = await fetch('/api/analytics/reports/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type })
  });
  return response.json();
};
```

---

## Database Schema Quick Reference

### Key Tables
```sql
-- Agent Metrics (Real-time)
agent_metrics {
  id, client_id, agent_id, metric_date,
  talk_time, hold_time, wrap_time,
  quality_score, productivity_score, utilization_percent
}

-- Quality Scores
call_quality_scores {
  id, client_id, call_id, agent_id,
  quality_score, audit_date, issue_type, severity
}

-- Customer Satisfaction
customer_satisfaction {
  id, client_id, csat_score, nps_score,
  sentiment_score, survey_date, feedback_text
}

-- Predictions
predictive_analytics {
  id, client_id, prediction_type,
  forecast_value, confidence_level, predicted_date
}

-- Anomalies
anomaly_detection {
  id, client_id, metric_type, deviation_percent,
  severity, detected_date, investigated
}
```

### Key Indexes
```sql
-- Performance
CREATE INDEX idx_agent_metrics_client ON agent_metrics(client_id);
CREATE INDEX idx_agent_metrics_date ON agent_metrics(metric_date DESC);
CREATE INDEX idx_quality_scores_agent ON call_quality_scores(agent_id);

-- Query Analytics
CREATE INDEX idx_satisfaction_client ON customer_satisfaction(client_id);
CREATE INDEX idx_predictions_client ON predictive_analytics(client_id);
```

---

## Environment Variables

```bash
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caly_analytics
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=3000

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

---

## Metrics & Formulas

### Key Formulas
```javascript
// Productivity Score (0-100)
productivityScore = (qualityScore * 0.6) + (efficiencyScore * 0.4) + (fcrBonus * 10)

// Agent Utilization (%)
utilization = (talkTime + wrapTime) / scheduledTime * 100

// Staffing Needed (Erlang C)
staff = (volume * handleTime) / (3600 * targetUtilization)

// ROI (%)
roi = (revenue - costs) / costs * 100

// NPS Score
nps = (promoters - detractors) / totalResponses * 100
```

### Target Thresholds
```javascript
const TARGETS = {
  FCR: 0.85,              // 85%
  QUALITY_SCORE: 85,      // /100
  HANDLE_TIME: 300,       // seconds
  ABANDONMENT: 0.05,      // 5%
  CSAT: 4.5,              // /5
  NPS: 50,                // /100
  ROI: 200                // %
};
```

---

## Common Endpoints for Testing

### Test Performance
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/analytics/performance/metrics?days=7"
```

### Test Quality
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/analytics/quality/metrics?days=7"
```

### Test Satisfaction
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/analytics/satisfaction/metrics?days=7"
```

### Test Predictions
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/analytics/predictions/call-volume?days=7"
```

### Test Reports
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"performance"}' \
  "http://localhost:3000/api/analytics/reports/generate"
```

---

## Component Props Reference

### PerformanceDashboard
```javascript
<PerformanceDashboard
  timeRange={'7d'}        // '1d' | '7d' | '30d'
  selectedAgent={null}    // agent ID or null
  selectedSector={null}   // sector or null
/>
```

### CallAnalytics
```javascript
<CallAnalytics
  timeRange={'7d'}           // Time range
  qualityThreshold={80}      // Minimum quality
  selectedIssueType={null}   // Issue type filter
/>
```

### SatisfactionMetrics
```javascript
<SatisfactionMetrics
  timeRange={'7d'}      // Time range
  sentiment={null}      // 'positive' | 'neutral' | 'negative' | null
/>
```

### RevenueAnalysis
```javascript
<RevenueAnalysis
  timeRange={'7d'}      // Time range
  costType={null}       // 'labor' | 'technology' | null
/>
```

### PredictionsDashboard
```javascript
<PredictionsDashboard
  forecastDays={7}          // Forecast period
  anomalyThreshold={'high'} // Threshold level
/>
```

---

## Quick Debugging Checklist

- [ ] JWT token present in header
- [ ] API URL correct in .env
- [ ] Database connection working
- [ ] Routes mounted in server.js
- [ ] Services imported correctly
- [ ] Cache invalidation working
- [ ] Logging shows expected events
- [ ] No CORS errors in console
- [ ] Charts have data
- [ ] Time range queries include days parameter

---

## Performance Optimization Tips

1. **Backend**
   - Use CacheManager for repeated queries
   - Batch database inserts
   - Use indexes on frequently queried columns
   - Set appropriate LIMIT on result sets

2. **Frontend**
   - Use React Query for caching
   - Increase refresh interval for slow networks
   - Lazy load chart components
   - Memoize expensive calculations

3. **Database**
   - Run ANALYZE on tables
   - Monitor slow query log
   - Rebuild indexes periodically
   - Archive old analytics data

---

## Phase 7 Deliverables Checklist

✅ **Backend (100%)**
- ✅ 7 Route files (1,910 lines)
- ✅ 5 Service files (1,890 lines)
- ✅ 1 Migration file (316 lines)
- ✅ 38 API endpoints
- ✅ 8 Database tables
- ✅ 30+ indexes
- ✅ 2 materialized views

✅ **Frontend (100%)**
- ✅ 5 Dashboard pages (2,000 lines)
- ✅ 1 Stylesheet (550 lines)
- ✅ 1 Configuration file (150 lines)
- ✅ React Query integration
- ✅ Recharts visualization
- ✅ Responsive design
- ✅ Real-time capabilities

✅ **Documentation (100%)**
- ✅ Completion summary
- ✅ Integration guide
- ✅ Quick reference
- ✅ Troubleshooting guide
- ✅ API documentation
- ✅ Code comments

---

## Contact & Support

**Issues?** Check the Integration Guide  
**Error Messages?** Check Troubleshooting Guide  
**How to Use?** Check Quick Reference above  

---

**Quick Reference Version:** 1.0  
**Last Updated:** Current Session  
**Status:** ✅ Production Ready  

