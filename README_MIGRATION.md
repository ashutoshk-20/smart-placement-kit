# Smart Placement Kit - Migration & New Features

## Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Clerk (Auth)
- **Database**: MongoDB (Mongoose)
- **Backend**: FastAPI (Python)
- **AI Mock Interview**: LiveKit Agents with Google Gemini (STT, LLM, TTS)

## Project Structure
- `/app` - Next.js frontend routes and API.
- `/actions` - Server actions for database and AI logic.
- `/models` - Mongoose schemas for MongoDB.
- `/lib` - Utility functions (DB connection, Inngest client).
- `/backend` - FastAPI application and LiveKit AI Agent.
  - `main.py`: FastAPI entry point.
  - `agent.py`: LiveKit Voice Assistant Agent.
  - `requirements.txt`: Python dependencies.

## Setup Instructions

### 1. Database & Auth (Frontend)
Update your `.env.local` file with the following:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GEMINI_API_KEY=...

# LiveKit (Get these from LiveKit Cloud or Self-hosted)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 2. Backend (FastAPI & AI Agent)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Initialize and Install dependencies (already done if you followed my steps):
   ```bash
   uv sync
   ```
3. Run the FastAPI server:
   ```bash
   uv run python main.py
   ```
4. Run the LiveKit Agent (in a separate terminal):
   ```bash
   uv run python agent.py dev
   ```

## Starting the Whole App
To run the full Smart Placement Kit, you will need **three terminal windows**:

1. **Terminal 1 (Frontend)**: 
   ```bash
   npm run dev
   ```
2. **Terminal 2 (AI Agent)**: 
   ```bash
   cd backend
   uv run python agent.py dev
   ```
3. **Terminal 3 (FastAPI)**: 
   ```bash
   cd backend
   uv run python main.py
   ```

## Using the Mock Interview
1. Go to the **Mock Interview** section in the app.
2. Choose **AI Avatar Mock Interview**.
3. Ensure your microphone and camera are ready.
4. Start the session to connect with the AI Interviewer!
