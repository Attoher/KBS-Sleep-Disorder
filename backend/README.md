# Backend - RSBP Sleep Health KBS

Express-based REST API server for the Sleep Health Knowledge-Based System. Implements forward-chaining rule inference engine, dual database persistence, and comprehensive analytics.

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Sequelize** - PostgreSQL ORM
- **Neo4j** - Graph database driver
- **JWT** - Authentication
- **Morgan** - HTTP logging
- **CORS** - Cross-origin requests
- **Nodemon** - Development auto-reload

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- PostgreSQL 14+ (for production mode)
- Neo4j 5+ (for production mode)

## Installation

```powershell
cd backend
npm install
```

## Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
JWT_SECRET=sleep_kbs_secret_2024

# PostgreSQL Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123

# Neo4j Configuration
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=kbsPassword123

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional Feature Flags
DEMO_MODE=false         # Skip database connections, use stub data
ALLOW_OFFLINE=false     # Start server even if databases fail
```

**Environment Variables:**
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT signing
- `DB_*` - PostgreSQL connection details
- `NEO4J_*` - Neo4j connection details
- `FRONTEND_URL` - Allowed CORS origin
- `DEMO_MODE` - Enable demo mode without databases
- `ALLOW_OFFLINE` - Allow server start without databases

## Running the Server

### Development Mode

With databases (full functionality):

```powershell
npm run dev
```

Demo mode (no databases required):

```powershell
$ENV:DEMO_MODE='true'
npm run dev
```

Production mode:

```powershell
npm start
```

### Initial Setup

Run database migrations (first time only):

```powershell
npm run migrate
```

Seed Neo4j with rule metadata:

```powershell
npm run seed
```

## Project Structure

```
backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # Sequelize configuration
│   │   ├── neo4j.js        # Neo4j driver setup
│   │   └── sqlite.js       # SQLite fallback
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── screeningController.js
│   │   ├── analyticsController.js
│   │   └── historyController.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT authentication
│   ├── models/             # Sequelize models
│   │   ├── index.js        # Model aggregator
│   │   ├── User.js         # User model
│   │   ├── Screening.js    # Screening model
│   │   └── RuleLog.js      # Rule execution log
│   ├── routes/             # API route definitions
│   │   ├── auth.js
│   │   ├── screening.js
│   │   ├── analytics.js
│   │   └── history.js
│   ├── services/           # Business logic
│   │   ├── ruleEngine.js           # Inference engine
│   │   ├── neo4jService.js         # Neo4j operations
│   │   └── neo4jScreeningService.js# Screening persistence
│   └── migrations/         # Database migrations
│       ├── init.js         # Schema initialization
│       └── seedRules.js    # Neo4j rule seeding
├── app.js                  # Express app setup
├── package.json            # Dependencies
└── .env                    # Environment variables
```

## API Endpoints

### Authentication

**Register:**
```
POST /api/auth/register
Body: { username, email, password }
```

**Login:**
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

**Get Current User:**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Screening

**Process Screening:**
```
POST /api/screening/process
Headers: Authorization: Bearer <token> (optional for guest)
Body: { sleepDuration, sleepQuality, stressLevel, ... }
Returns: { diagnosis, risks, recommendations, firedRules }
```

**Get Screening History:**
```
GET /api/screening/history
Headers: Authorization: Bearer <token>
Query: page, limit, diagnosis, search, startDate, endDate
```

**Get Screening by ID:**
```
GET /api/screening/:id
Headers: Authorization: Bearer <token> (optional)
```

### Analytics

**Overview:**
```
GET /api/analytics/overview
Headers: Authorization: Bearer <token>
Returns: { totalScreenings, trends, distributions }
```

**Public Overview:**
```
GET /api/analytics/public/overview
No authentication required
```

**Rule Statistics:**
```
GET /api/analytics/rules
Headers: Authorization: Bearer <token>
```

**Trends:**
```
GET /api/analytics/trends
Headers: Authorization: Bearer <token>
Query: period (day|week|month)
```

### History

**Get User History:**
```
GET /api/history
Headers: Authorization: Bearer <token>
Query: page, limit, filters
```

### Health Check

**System Health:**
```
GET /health
Returns: { status, services, uptime, mode }
```

## Rule Inference Engine

The core of the system is a forward-chaining rule engine located in `src/services/ruleEngine.js`.

**Features:**
- 40+ medical rules for sleep disorder detection
- Forward-chaining inference with conflict resolution
- Rule categories: Insomnia, Sleep Apnea, Lifestyle
- Maximum 50 iterations to prevent infinite loops
- Input validation and normalization

**Rule Structure:**
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

**Inference Flow:**
1. Preprocess input data
2. Initialize facts object
3. Run forward-chaining loop
4. Apply triggered rules
5. Return diagnosis and recommendations

## Database Architecture

### PostgreSQL (Sequelize)

**Models:**
- `User` - User accounts and authentication
- `Screening` - Screening records
- `RuleLog` - Rule execution logs

**Relationships:**
- User has many Screenings
- Screening has many RuleLogs

### Neo4j (Graph Database)

**Nodes:**
- `Person` - User entity
- `Screening` - Screening session
- `Rule` - Medical rules
- `Diagnosis` - Diagnosis results

**Relationships:**
- `(Person)-[:HAS_SCREENING]->(Screening)`
- `(Screening)-[:FIRED_RULE]->(Rule)`
- `(Screening)-[:HAS_DIAGNOSIS]->(Diagnosis)`

**Purpose:**
- Track rule inference provenance
- Analyze screening patterns
- Generate analytics and insights

## Authentication & Authorization

**JWT Implementation:**
- Token generation on login/register
- Token verification via middleware
- Expiration handling (default: 7 days)
- Guest mode support for certain endpoints

**Middleware:**
- `auth` - Requires valid token
- `adminAuth` - Requires admin role
- `optionalAuth` - Allows both authenticated and guest access

## Error Handling

**Standard Response Format:**
```javascript
{
  success: true/false,
  data: {...},        // on success
  error: "message",   // on failure
  details: "..."      // in development mode
}
```

**HTTP Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error

## Demo Mode

Enable demo mode for frontend development without databases:

```powershell
$ENV:DEMO_MODE='true'
npm run dev
```

**Demo Mode Behavior:**
- Skip PostgreSQL and Neo4j connections
- Return stub data for analytics
- Rule engine still functions
- Guest screening allowed
- No data persistence

## Performance Considerations

- Connection pooling for PostgreSQL
- Neo4j session management
- Request rate limiting (future enhancement)
- Query optimization with indexes
- Caching for frequently accessed data

## Security Features

- Password hashing with bcrypt
- JWT token validation
- CORS restriction to frontend origin
- SQL injection prevention via Sequelize
- Input validation and sanitization

## Logging

Morgan HTTP logging configured:
- Development: Detailed logs
- Production: Combined format
- Error logs captured separately

## Troubleshooting

**Database Connection Errors:**
```powershell
# Use ALLOW_OFFLINE flag
$ENV:ALLOW_OFFLINE='true'
npm run dev
```

**Port Already in Use:**
```powershell
# Change PORT in .env
PORT=5001
```

**Migration Errors:**
```powershell
# Reset database and re-migrate
npm run migrate
```

**Neo4j Connection Issues:**
- Verify Neo4j is running: `docker ps`
- Check credentials in .env
- Test connection: http://localhost:7474

## Testing

Manual testing with tools:
- Postman - API endpoint testing
- Neo4j Browser - Graph data inspection
- pgAdmin - PostgreSQL data inspection

## Contributing

When adding new features:
1. Follow existing code structure
2. Add proper error handling
3. Update API documentation
4. Test with and without authentication

## Deployment

**Docker:**
- Use docker-compose.yml for full stack
- Configure environment variables
- Ensure database volumes are persistent

**Production Checklist:**
- Set strong JWT_SECRET
- Use production database credentials
- Enable HTTPS
- Configure proper CORS origins
- Set NODE_ENV=production

## Support

For issues or questions:
- Check logs for detailed error messages
- Verify environment configuration
- Review database connection settings
- Ensure all dependencies are installed
