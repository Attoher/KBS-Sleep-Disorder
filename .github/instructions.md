# RSBP Sleep Health Knowledge-Based System

## Architecture Overview

This is a **full-stack knowledge-based system (KBS)** for sleep health screening using a **dual-database architecture**:
- **PostgreSQL**: User authentication, screening records, and transactional data
- **Neo4j**: Graph-based rule inference tracking and case relationships
- **Rule Engine**: Forward-chaining inference engine with 40+ rules in `backend/src/services/ruleEngine.js`

The system diagnoses insomnia and sleep apnea risks by running medical rules against patient data, logging both to PostgreSQL (user history) and Neo4j (inference provenance graph).

### Service Flow
```
Frontend (React+Vite) → Backend API (Express) → Rule Engine → Dual Database Storage
                                                     ↓
                                    Neo4j Graph (case/rule provenance)
                                    PostgreSQL (user/screening records)
```

## Critical Development Patterns

### 1. Rule Engine Architecture (`backend/src/services/ruleEngine.js`)
- **Rules are hardcoded objects** with `id`, `category`, `condition()`, and `action()` functions
- Forward-chaining loop runs max 50 iterations until no new rules fire
- Input preprocessing normalizes field names (e.g., `'Sleep Duration'` or `sleepDuration`)
- Rules write to `facts` object: `facts.insomnia_risk`, `facts.apnea_risk`, `facts.diagnosis`
- **Key methods**: `runForwardChaining(input)`, `validateInput(input)`, `getRuleDescriptions()`

Example rule pattern:
```javascript
{
  id: 'R1',
  category: 'Insomnia',
  condition: (facts) => facts.sleepDuration < 5 && facts.sleepQuality <= 4,
  action: (facts) => {
    facts.insomnia_risk = 'high';
    facts.firedRules.push('R1');
  }
}
```

### 2. Dual Database Persistence Pattern
**Every screening** creates:
1. **PostgreSQL record** via Sequelize (`Screening` model) - if user is authenticated
2. **Neo4j graph** via `neo4jService.logCase()` - always, unless `log_to_neo4j: false`

Neo4j graph structure:
```
(Person)-[:HAS_CASE]->(Case)-[:FIRED_RULE]->(Rule)
(Case)-[:HAS_DIAGNOSIS]->(Diagnosis)
```

See `backend/src/controllers/screeningController.js:50-75` for dual-write implementation.

### 3. Authentication Flow
- **JWT tokens** stored in `localStorage` (frontend) and verified via `backend/src/middleware/auth.js`
- Three middleware variants: `auth` (required), `adminAuth` (admin only), `optionalAuth` (guest allowed)
- Frontend uses **dual state management**: Zustand (`useAuthStore`) + React Context (`AuthContext`)
  - **Zustand**: Token persistence only
  - **React Context**: User object and auth methods (`login`, `register`, `logout`)

### 4. API Response Convention
All backend responses follow this structure:
```javascript
{
  success: true/false,
  data: { ... },      // on success
  error: "message"    // on failure
}
```

Frontend axios interceptor auto-redirects to `/login` on 401 responses.

## Development Workflows

### Starting the Stack
```powershell
# Start all services (Postgres, Neo4j, backend, frontend)
docker-compose up

# Or run individually:
cd backend ; npm run dev     # Backend on :5000
cd frontend ; npm run dev    # Frontend on :5000 (Vite proxy to :5000)
```

**Important**: Backend depends on both databases being ready. First-time setup requires:
```powershell
cd backend
npm run migrate    # Initialize PostgreSQL schema
npm run seed      # Seed Neo4j with rule metadata (optional)
```

### Database Access
```powershell
# PostgreSQL
docker exec -it rsbp-final-postgres-1 psql -U kbs_user -d sleep_health_db

# Neo4j Browser
# Open http://localhost:7474
# Credentials: neo4j / kbsPassword123
```

### Testing the Rule Engine
The rule engine runs **stateless inference** - no database required for testing:
```javascript
const ruleEngine = require('./backend/src/services/ruleEngine');
const results = ruleEngine.runForwardChaining({
  Age: 30,
  'Sleep Duration': 4,
  'Quality of Sleep': 3,
  'Stress Level': 8,
  'BMI Category': 'Obese',
  'Blood Pressure': '140/95'
});
console.log(results.diagnosis, results.firedRules);
```

## Project-Specific Conventions

### Field Name Normalization
The rule engine accepts **both** Excel-style and camelCase field names:
- `'Sleep Duration'` or `sleepDuration`
- `'Quality of Sleep'` or `sleepQuality`
- `'Stress Level'` or `stressLevel`
- `'BMI Category'` or `bmiCategory`
- `'Blood Pressure'` or `bloodPressure`

This dual naming exists because the system was initially designed with Excel rule tables. Always normalize in `preprocessInput()` before rule evaluation.

### Environment Variables
**Backend** (`.env` or `docker-compose.yml`):
```bash
DB_HOST=postgres          # Docker service name
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=kbsPassword123
JWT_SECRET=sleep_kbs_secret_2024
```

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:5000/api
```

### Neo4j Schema Initialization
Neo4j constraints/indexes are created in `backend/src/config/neo4j.js:initNeo4jSchema()`:
- Unique constraints on `Person.personId`, `Case.caseId`, `Rule.ruleId`, `Diagnosis.name`
- Indexes on timestamps for query performance

This runs automatically on backend startup via `app.js`.

### Model Associations (Sequelize)
```javascript
User.hasMany(Screening, { foreignKey: 'userId' })
Screening.belongsTo(User, { foreignKey: 'userId' })
Screening.hasMany(RuleLog, { foreignKey: 'screeningId' })
```

Define associations in `backend/src/models/index.js` (if it exists) or individual model files.

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/services/ruleEngine.js` | Core inference engine with all 40+ medical rules |
| `backend/src/services/neo4jService.js` | Neo4j graph operations (logCase, analytics queries) |
| `backend/src/controllers/screeningController.js` | Main screening endpoint with dual-database writes |
| `backend/src/config/database.js` | Sequelize PostgreSQL connection |
| `backend/src/config/neo4j.js` | Neo4j driver + schema initialization |
| `backend/src/middleware/auth.js` | JWT verification (auth, adminAuth, optionalAuth) |
| `frontend/src/utils/api.js` | Axios instance with auth interceptors |
| `frontend/src/contexts/AuthContext.jsx` | React Context for user state |
| `frontend/src/store/useAuthStore.js` | Zustand store for token persistence |

## Common Gotchas

1. **Neo4j connection failures**: Ensure APOC plugin is enabled in `docker-compose.yml` - it's required for some analytics queries
2. **Rule engine not firing**: Check field name normalization in `preprocessInput()` - rules use camelCase internally
3. **Frontend 404s after build**: Vite builds to `frontend/dist` - Dockerfile uses nginx to serve static files
4. **Sequelize sync issues**: Use `sequelize.sync({ alter: true })` in dev, proper migrations in production
5. **Guest screenings**: System allows non-authenticated screening with `log_to_neo4j: true` - creates guest nodes in Neo4j

## Adding New Rules

1. Add rule object to `this.rules` array in `ruleEngine.js` constructor
2. Follow the pattern: `id`, `category`, `condition(facts)`, `action(facts)`
3. Add description to `getRuleDescriptions()` for UI display
4. Test with standalone script before integrating
5. No database changes needed - rules are code-driven, not data-driven
