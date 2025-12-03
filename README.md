# Sleep Health Knowledge-Based System (KBS)

![Sleep Health KBS](https://img.shields.io/badge/Sleep%20Health-KBS-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Neo4j](https://img.shields.io/badge/Neo4j-5+-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

A modern, AI-powered web application for diagnosing sleep disorders (Insomnia and Sleep Apnea) using expert rules and forward chaining inference.

## 🌟 Live Demo

**Frontend**: [http://localhost:5000](http://localhost:5000)  
**Backend API**: [http://localhost:5000](http://localhost:5000)  
**Neo4j Browser**: [http://localhost:7474](http://localhost:7474)

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Knowledge Base Rules](#-knowledge-base-rules)
- [API Documentation](#-api-documentation)
- [Neo4j Schema](#-neo4j-schema)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### 🏥 Clinical Features
- **20 Expert Rules**: Based on AASM, WHO, and clinical guidelines
- **Dual Diagnosis**: Detects both Insomnia and Sleep Apnea
- **Risk Assessment**: Low, Moderate, High risk levels
- **Lifestyle Analysis**: Identifies sleep, stress, activity, and weight issues
- **Personalized Recommendations**: Evidence-based treatment suggestions

### 💻 Technical Features
- **Modern Stack**: Node.js + Express + Web Components
- **Knowledge-Based System**: Forward chaining inference engine
- **Graph Database**: Neo4j for knowledge representation
- **Real-time UI**: Interactive forms with live feedback
- **Data Visualization**: Chart.js for analytics and insights
- **Rule Testing Lab**: Interactive testing environment
- **RESTful API**: Clean API design with OpenAPI support
- **Docker Support**: Containerized deployment
- **Responsive Design**: Mobile-friendly interface

### 📊 Diagnostic Capabilities
1. **Insomnia** (Primary, Chronic)
2. **Obstructive Sleep Apnea** (OSA)
3. **Mixed Sleep Disorder** (Insomnia + Apnea)
4. **Lifestyle-related Sleep Issues**
5. **No Sleep Disorder** (Healthy baseline)

### Explanation System
This project includes a comprehensive explanation system designed to improve clinical interpretability and transparency.
The system provides two layers of explainability:

1. High-Level Clinical Summary
- After processing patient data and inferring risks, the system generates a natural-language summary explaining:
- Key contributing factors
- Supporting clinical indicators
- Reasoning behind the diagnosis
- A summary consistent with AASM/WHO guidelines

Example:
“The system identifies a HIGH risk of INSOMNIA, triggered primarily by short sleep duration and elevated stress levels. Lifestyle improvements are recommended to reduce future complications.”

2. Rule-Level Explanation (Per-Rule Detail)
Every rule in the rule base (R1–R20) includes metadata explaining:
- Rule ID
- Clinical category
- Reasoning
- Clinical source (AASM, WHO, OSA guidelines)
When a rule fires, it is:
- Highlighted in the Rules Fired section
- Shown with explanation text
- Marked visually in the UI rules grid

### Dynamic Neo4j Statistcs
The UI now integrates real-time statistics retrieved directly from Neo4j, allowing the system to display live analytics based on historical assessment data.
The dashboard header displays:
- Total Recorded Cases
- Total Expert Rules Loaded
- High Insomnia Risk Count
- High Apnea Risk Count
These values are fetched from the backend via:
```
GET /api/neo4j/stats
```
Each assessment performed in the system updates Neo4j’s graph database, allowing:
- Population-level insights
- Longitudinal risk analysis
- Rule firing distributions
- Data-driven visualization in future extensions

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Neo4j** 5+ (or Docker)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Attoher/KBS-Sleep-Disorder
   cd KBS-Sleep-Disorder
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Neo4j credentials
   ```

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - Neo4j Browser: [http://localhost:7474](http://localhost:7474) (username: sleep_app, password: sleep123)
   ```
   CREATE USER sleep_app SET PASSWORD 'sleep123' CHANGE NOT REQUIRED;
   GRANT ROLE admin TO sleep_app;
   ```
   

## 🏗️ Project Structure

```
sleep-health-kbs/
├── client/                 # Frontend application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Web Components
│   │   ├── styles/        # CSS styles
│   │   └── app.js         # Main app
│   └── package.json       # Frontend dependencies
├── server/                # Backend application
│   ├── config/           # Configuration
│   ├── controllers/      # API controllers
│   ├── engine/          # KBS engine (rules, inference)
│   ├── routes/          # Express routes
│   └── utils/           # Utility functions
├── tests/               # Test suites
├── docker-compose.yml   # Docker configuration
├── package.json         # Backend dependencies
├── server.js           # Main server
└── .env                # Environment variables
```

## 📊 Knowledge Base Rules

The system implements 20 expert rules across 5 categories:

### 🏥 Insomnia Risk Rules (R1-R4)
| Rule | Condition | Action | Source |
|------|-----------|--------|---------|
| R1 | Sleep Duration <5h AND Quality ≤4 | insomnia_risk = high | AASM/Morin 2012 |
| R2 | Duration 5-6h AND Stress ≥7 | insomnia_risk = moderate | AASM |
| R3 | Quality ≤4 AND Stress ≥7 | insomnia_risk = moderate | Insomnia literature |
| R4 | Duration 7-9h AND Quality ≥7 AND Stress <7 | insomnia_risk = low | AASM/WHO |

### 😴 Apnea Risk Rules (R5-R8)
| Rule | Condition | Action | Source |
|------|-----------|--------|---------|
| R5 | Obese AND Hypertension | apnea_risk = high | AASM/OSA guideline |
| R6 | Overweight AND Hypertension | apnea_risk = moderate | OSA literature |
| R7 | Obese AND Age ≥40 | apnea_risk = moderate | OSA literature |
| R8 | Normal BMI AND Normal BP | apnea_risk = low | Clinical baseline |

### 🏃 Lifestyle Issue Rules (R9-R12)
| Rule | Condition | Action | Source |
|------|-----------|--------|---------|
| R9 | Physical Activity <30 min/day | lifestyle_issue_activity = true | WHO |
| R10 | Stress Level ≥7 | lifestyle_issue_stress = true | Psychology literature |
| R11 | Sleep Duration <6h | lifestyle_issue_sleep = true | AASM/WHO |
| R12 | BMI in {Overweight,Obese} | lifestyle_issue_weight = true | WHO |

### 🩺 Diagnosis Rules (R13-R16)
| Rule | Condition | Action | Source |
|------|-----------|--------|---------|
| R13 | insomnia_risk high OR (moderate + stress/sleep issue) | diagnosis_insomnia = true | AASM |
| R14 | apnea_risk high OR (moderate + BMI issue) | diagnosis_apnea = true | AASM |
| R15 | diagnosis_insomnia AND diagnosis_apnea | diagnosis_mixed = true | Clinical |
| R16 | All risks low AND no lifestyle issues | diagnosis_none = true | Clinical |

### 💡 Recommendation Rules (R17-R20)
| Rule | Condition | Action | Source |
|------|-----------|--------|---------|
| R17 | Insomnia diagnosis OR sleep issue | add REC_SLEEP_HYGIENE | AASM |
| R18 | Activity issue | add REC_PHYSICAL_ACTIVITY | WHO |
| R19 | Stress issue | add REC_STRESS_MANAGEMENT | Psychology |
| R20 | Apnea diagnosis OR apnea high risk | add REC_WEIGHT_MANAGEMENT + REC_APNEA_EVAL | OSA guideline |

## 🔧 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### Diagnosis Endpoints

#### Perform Diagnosis
```http
POST /api/diagnosis/analyze
```
**Request Body:**
```json
{
  "age": 45,
  "gender": "Male",
  "sleepDuration": 4.5,
  "sleepQuality": 3,
  "stressLevel": 8,
  "activityMinutes": 20,
  "bmiCategory": "Obese",
  "bloodPressure": "150/95",
  "heartRate": 98,
  "dailySteps": 3000
}
```

**Response:**
```json
{
  "success": true,
  "diagnosis": "Mixed Sleep Disorder (Insomnia + Sleep Apnea)",
  "results": {
    "risks": {
      "insomnia": "high",
      "apnea": "high"
    },
    "lifestyleIssues": {
      "sleep": true,
      "stress": true,
      "activity": false,
      "weight": true
    },
    "recommendations": [...],
    "confidence": 92
  },
  "rules": {
    "fired": ["R1", "R5", "R10", "R11", "R12", "R13", "R14", "R15", "R17", "R19", "R20"]
  }
}
```

#### Get All Rules
```http
GET /api/diagnosis/rules
```

#### Test Specific Rule
```http
GET /api/diagnosis/rules/:ruleId
```

### Neo4j Endpoints

#### Test Connection
```http
GET /api/neo4j/test
```

#### Initialize Database
```http
POST /api/neo4j/init
```

#### Get Case History
```http
GET /api/neo4j/cases?limit=10&offset=0
```

#### Get Statistics
```http
GET /api/neo4j/stats
```

#### System Health
```http
GET /api/neo4j/health
```

## 🗺️ Neo4j Schema

### Graph Structure
```
(Person)-[:HAS_SLEEP_DISORDER]->(Sleep_Disorder)
(Person)-[:TRIGGERED_RULE]->(Rule)
(Person)-[:LIFESTYLE_ISSUE]->(Recommendation)
```

### Sample Cypher Queries

#### View All Cases
```cypher
MATCH (p:Person)-[r:HAS_SLEEP_DISORDER]->(sd:Sleep_Disorder)
OPTIONAL MATCH (p)-[:TRIGGERED_RULE]->(rule:Rule)
OPTIONAL MATCH (p)-[:LIFESTYLE_ISSUE]->(rec:Recommendation)
RETURN p, sd, 
       collect(DISTINCT rule.id) as rules,
       collect(DISTINCT rec.id) as recommendations,
       r.risk_summary as risk_summary
ORDER BY p.created_at DESC
LIMIT 10
```

#### Find High-Risk Cases
```cypher
MATCH (p:Person)-[:HAS_SLEEP_DISORDER]->(sd:Sleep_Disorder)
WHERE p.insomnia_risk = 'high' OR p.apnea_risk = 'high'
RETURN p.person_id, p.age, p.gender, sd.code, p.insomnia_risk, p.apnea_risk
ORDER BY p.created_at DESC
```

#### Rule Firing Frequency
```cypher
MATCH (p:Person)-[:TRIGGERED_RULE]->(r:Rule)
RETURN r.id as rule, count(p) as frequency
ORDER BY frequency DESC
```

#### Diagnosis Distribution
```cypher
MATCH (p:Person)-[:HAS_SLEEP_DISORDER]->(d:Sleep_Disorder)
RETURN d.code as diagnosis, d.name as name, count(p) as count
ORDER BY count DESC
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=sleep_app
NEO4J_PASSWORD=sleep123
NEO4J_DATABASE=neo4j

# Application
APP_NAME="Sleep Health KBS"
APP_VERSION=1.0.0

# Security (generate your own secrets)
SESSION_SECRET=your-session-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```
