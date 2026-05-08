# MyBank API — Tech Stack

---

## Core Stack

| Layer         | Technology | Version | Why                                                   |
| ------------- | ---------- | ------- | ----------------------------------------------------- |
| **Runtime**   | Node.js    | 20+     | Industry standard, async I/O, npm ecosystem           |
| **Framework** | Express.js | 4.x     | Lightweight, modular, middleware-based                |
| **Language**  | JavaScript | ES6+    | Fast development, dynamic typing, npm libraries       |
| **Database**  | MongoDB    | 7.0+    | Flexible schema, Atlas free tier M0, good for startup |
| **ORM**       | Mongoose   | 8.x     | Schema validation, middleware hooks, relationships    |

---

## Authentication & Security

| Tool                 | Version      | Why   |
| -------------------- | ------------ | ----- | --------------------------------------- |
| **JWT**              | jsonwebtoken | 9.x   | Stateless tokens, no session DB needed  |
| **Password Hash**    | bcryptjs     | 2.x   | Industry standard, salted hashing       |
| **CORS**             | cors         | 2.8.x | Cross-origin requests, restrict origins |
| **Helmet**           | helmet       | 7.x   | HTTP security headers                   |
| **Input Validation** | zod          | 4.x   | Schema validation, type inference       |

---

## Data & Utilities

| Tool            | Version | Why  |
| --------------- | ------- | ---- | ------------------------------------------ |
| **HTTP**        | axios   | 1.x  | Promise-based HTTP client, retry logic     |
| **Environment** | dotenv  | 16.x | Load .env variables safely                 |
| **Logging**     | winston | 3.x  | Structured logging, log levels, transports |
| **Dates**       | dayjs   | 1.x  | Lightweight date parser, immutable         |

---

## Development Tools

| Tool          | Version | Why                              |
| ------------- | ------- | -------------------------------- |
| **Nodemon**   | 3.x     | Auto-restart on file changes     |
| **Prettier**  | 3.x     | Code formatter                   |
| **ESLint**    | 8.x     | Code linting                     |
| **Jest**      | 29.x    | Unit testing                     |
| **Supertest** | 6.x     | HTTP testing (integration tests) |

---

## API Documentation

| Tool                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| **Swagger (OpenAPI)** | API docs, auto-generated from YAML          |
| **Postman**           | Manual testing, request/response inspection |

---

## Infrastructure

| Component            | Choice                              | Why                                          |
| -------------------- | ----------------------------------- | -------------------------------------------- |
| **Deployment**       | Vercel (serverless) or Railway (VM) | Zero-config, auto-scaling, good for startups |
| **Database Hosting** | MongoDB Atlas                       | Free M0 tier, auto backups, 512MB storage    |
| **Environment**      | .env local + CI/CD                  | Secrets not in repo                          |
| **Monitoring**       | Vercel logs + MongoDB Atlas alerts  | Built-in, no extra cost                      |

---

## NOT Used (And Why)

| Skipped            | Alternative          | Why We Don't Use                                     |
| ------------------ | -------------------- | ---------------------------------------------------- |
| **TypeScript**     | JavaScript           | Faster iteration, flexible, still type-safe with Zod |
| **GraphQL**        | REST                 | Overkill for MVP, REST is simpler + cached better    |
| **Docker**         | Native Node          | Vercel + Atlas handle containerization               |
| **Redis**          | MongoDB              | No caching needed yet, Mongoose handles queries      |
| **Kafka/RabbitMQ** | Direct HTTP webhooks | notification-service calls via HTTP, simple enough   |
| **gRPC**           | REST/HTTP            | Not needed, REST is sufficient                       |
| **OpenTelemetry**  | Vercel logs          | Basic logging covers MVP needs                       |

---

## Dependencies (package.json Summary)

```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "zod": "^4.x",
    "axios": "^1.x",
    "dotenv": "^16.x",
    "cors": "^2.8.x",
    "helmet": "^7.x",
    "dayjs": "^1.x",
    "winston": "^3.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "prettier": "^3.x",
    "eslint": "^8.x",
    "jest": "^29.x",
    "supertest": "^6.x"
  }
}
```

---

## Setup & Bootstrap

**From repo root:**

```bash
npm install
cp .env.example .env.local
# Edit .env.local with MONGODB_URI, JWT_SECRET
npm run dev
```

Server runs on `http://localhost:5000`

---

## Version Control

- **Git** — GitHub (public repo for portfolio)
- **Branch strategy** — Push to main directly (solo dev) or PR for major refactors
- **Commit convention** — `feat(MODULE): description`, `fix(MODULE): description`

---

## Why This Stack

1. **Fast to develop** — No TypeScript boilerplate, dynamic typing
2. **Easy to scale** — Modular Express, Mongoose for relationships
3. **Cheap to run** — MongoDB Atlas M0 free, Vercel free tier for API
4. **Familiar** — Standard Node.js + MongoDB, great docs
5. **Microservice-ready** — Can extract services (AI, analytics) later

---

**Last Updated:** May 8, 2026
