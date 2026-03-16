# Smart Placement Kit - Features

## 🚀 Overview
Smart Placement Kit is an AI-powered platform designed to streamline career preparation. From AI-generated resumes to immersive mock interviews with behavioral analysis, it provides students and job seekers with the tools they need to succeed in modern recruitment.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Shadcn UI
- **Auth**: Clerk
- **Database**: MongoDB (Mongoose)
- **Background Jobs**: Inngest
- **AI Backend**: FastAPI (Python)
- **Real-time AI**: LiveKit Agents, Google Gemini (Multimodal LLM), MediaPipe (Computer Vision)

## ✨ Key Features & Capabilities

### 1. Comprehensive Placement Process
- **End-to-End Workflow**: Guides students through the entire placement lifecycle from preparation to job application.
- **Application History**: Track previous interview tests, resume progress, and application status easily.
- **Step-by-Step Milestones**: Includes Resume screening, Aptitude tests, Coding challenges, and HR/Technical interviews.

### 2. AI Behavioral Analysis (Attention Tracker)
A state-of-the-art vision module that monitors your performance in real-time during quizzes and interviews:
- **Eye Contact Tracking**: Ensures you are engaged with the interviewer.
- **Posture Analysis**: Detects leaning or excessive movement to maintain a professional stance.
- **Confidence Scoring**: Analyzes facial expressions to estimate confidence levels.
- **Live Coaching**: Provides dynamic, non-intrusive feedback cards.
- **Session Reports**: Generates a summary report of your behavioral performance.

### 3. Immersive AI Mock Interview
Experience a real-time conversation with an AI Avatar powered by LiveKit and Gemini:
- **Dual-View Layout**: Clean, focused interface showing only the Candidate and the AI Avatar.
- **Seamless Voice/Video**: Integrated low-latency communication.
- **Automatic Lifecycle**: Camera turns off and redirects you safely once the meeting ends.

### 4. Smart Assessment Tools & Coding Arena
- **Technical & Aptitude Quizzes**: Tailored questions based on your industry and skills.
- **Interactive Coding Environment**: Solve technical challenges within an integrated coding playground.
- **Instant AI Explanations**: Deep dive into why an answer was correct or incorrect, with feedback on code structure.
- **Skill Tracking**: Visual performance charts to track your growth over time.

### 5. Career Preparation Suite
- **AI Cover Letter Generator**: Generate tailored cover letters using Gemini based on company name, job title, and description. Manage and copy previously generated cover letters effortlessly.
- **AI Resume Builder**: Create ATS-friendly resumes guided by AI recommendations.

## 📁 Project Structure
- `/app` - Next.js frontend routes and API endpoints.
- `/actions` - Server-side logic for DB, Auth, and Gemini prompting.
- `/components` - Modular UI components including the `AttentionTracker` and `InterviewSession`.
- `/models` - Mongoose schemas for MongoDB.
- `/backend` - Python-based AI infrastructure.
  - `main.py`: FastAPI server for specialized processing.
  - `agent.py`: LiveKit Voice & Multimodal Agent script.

## 🚀 Setup Instructions

### 1. Environment Variables
Update your `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GEMINI_API_KEY=...

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Beyond Presence (Avatar)
BEY_AVATAR_ID=your_avatar_id
```

### 2. Run the Application
You will need **three terminal windows**:

1. **Frontend (Next.js)**: 
   ```bash
   npm run dev
   ```
2. **AI Agent (LiveKit)**: 
   ```bash
   cd backend
   uv run python agent.py dev
   ```
3. **Specialized Backend (FastAPI)**: 
   ```bash
   cd backend
   uv run python main.py
   ```

---
*Built for the future of career placement.*
