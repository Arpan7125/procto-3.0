# Procto 3.0 - AI-Powered Exam Proctoring Platform 🚀

Procto is a next-generation online assessment and proctoring platform designed for secure, seamless, and intelligent examinations. It combines a robust backend API with a sleek React frontend to deliver real-time proctoring, AI-powered question generation, and comprehensive exam management.

---

## 🌟 Key Features

### 🎓 For Faculty

- **Course & Exam Management:** Easily create and manage courses, schedule exams, and build question banks.
- **AI Question Generation:** Automatically generate high-quality exam questions using Google Gemini AI, customized by difficulty, topic, and type.
- **Live Proctoring Dashboard:** Monitor students in real-time. Detect suspicious events (face not detected, tab switching, multiple faces, noise).
- **Automated Grading:** Auto-score objective questions and review detailed analytical reports.

### 🧑‍🎓 For Students

- **Secure Exam Environment:** Take exams in a locked-down, actively proctored interface.
- **Real-time Event Tracking:** The system securely monitors video, audio, and screen activity to ensure academic integrity.
- **Instant Feedback:** View scores and results immediately after submission (if enabled by faculty).

---

## 🛠️ Technology Stack

### **Frontend**

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS, Framer Motion for animations
- **State Management:** Zustand
- **Routing:** React Router DOM
- **UI & Icons:** Lucide React, Recharts for analytics
- **Real-time:** Socket.io-client

### **Backend**

- **Runtime:** Node.js (via TypeScript)
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Cache & Message Broker:** Redis, BullMQ
- **Authentication:** JWT, Passport.js (Google/GitHub OAuth)
- **AI Integration:** Google Generative AI (Gemini 2.0 Flash)
- **Cloud Storage:** AWS SDK (S3)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) & Docker Compose (for running Postgres & Redis locally)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/procto-3.0.git
   cd procto-3.0
   ```

2. **Start the backend infrastructure (Database & Cache):**

   ```bash
   docker-compose up -d procto_postgres procto_redis
   ```

3. **Install Backend Dependencies:**

   ```bash
   cd backend
   npm install
   ```

4. **Environment Variables (Backend):**
   Create a `.env` file in the `backend/` directory:

   ```env
   # Database Ports / URLs
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/procto_db"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=redis_password

   # Authentication
   CORS_ORIGINS=http://localhost:5173
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret

   # AI integration
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run Database Migrations:**

   ```bash
   npm run prisma:migrate
   ```

6. **Start the Backend Server:**

   ```bash
   npm run dev
   ```

7. **Install & Start Frontend:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Your backend should now be running on `http://localhost:4000` and frontend on `http://localhost:5173`.

---

## 🚢 Docker Deployment

The entire stack is Docker-ready. You can spin up the whole project (PostgreSQL, Redis, Backend) using docker-compose:

```bash
docker-compose up -d
```

_(Note: Be sure your `.env` is configured properly at the Procto-main root for Docker to inject into the backend container!)_

---

## 🔒 Security

- **JWT Authentication:** Secure access and refresh token rotation.
- **Strict Validation:** Input validation using Zod schemas.
- **Rate-Limiting & Helmet:** Prevents brute-force attacks and hides standard Express vulnerabilities.

## 📄 License

This project is proprietary and confidential.

---

_Built with ❤️ for better education._
