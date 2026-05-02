# 🧠 Saarthi.AI – Multilingual Partner Acquisition Engine

## 📌 Overview
Saarthi.AI is an **AI Voice & Chat Agent** built to revolutionize how Rupeezy onboards Authorized Persons (APs). 

Today, only 18% of leads convert because human Relationship Managers (RMs) face bottlenecks with time, language barriers, and queue capacity. Saarthi.AI solves this structural failure by contacting leads instantly, pitching the Rupeezy AP program in their native language (Hindi, Hinglish, or English), dynamically handling objections, and qualifying leads so RMs only focus on closing the hottest prospects.

---

## 🏆 Hackathon Implementation (What We Built)
We successfully built a production-ready prototype that executes the entire partner acquisition funnel. 

### 1. 🎙️ Live Multilingual Voice Agent
* **Web Speech API**: Users can click "Hold to Speak" to talk to the AI naturally.
* **Text-to-Speech (TTS)**: The AI responds intelligently via Gemini and speaks its response back to the user aloud using natural voice synthesis.
* **Language Agnostic**: Heuristics dynamically detect whether the user is speaking pure Hindi, urban Hinglish, or formal English, and forces the AI to reply in the exact same language and tone.

### 2. 🧠 Objection Handling Knowledge Base
* **Deterministic Fallbacks**: We built an independent `objections.json` Knowledge Base. When a user raises one of the Top 5 objections (e.g. *"I already have a broker"*), the system intercepts it and delivers the exact, compliant Rupeezy rebuttal before allowing the generative AI to continue the conversation naturally.

### 3. 🎯 Dynamic Lead Qualification Engine
* **Real-time Scoring**: Our `LeadScorer` constantly evaluates user intent. It adds points for positive sentiment ("how much commission?") and deducts points for negative sentiment ("I am busy").
* **Classification**: Leads are instantly classified into **Hot, Warm, or Cold** pipelines.

### 4. 📊 Analytics & Routing Dashboard
* **Funnel Analytics**: A real-time dashboard tracks the total leads contacted and categorizes them by their status.
* **Generative Post-Call Summaries**: RMs can click a button to generate an instant AI summary of the call. Gemini analyzes the entire MongoDB transcript and outputs exactly what the RM needs: *Objections Raised, Topics Covered, and Recommended Action*.
* **WhatsApp Simulation**: Clicking "Simulate Routing" calculates the CRM payload and simulates sending an automated WhatsApp Nurture link to Warm leads.

---

## 🏗️ Technical Stack
* **AI Engine**: Google Gemini `gemini-3-flash-preview` via `google-genai` SDK
* **Backend**: FastAPI + Python
* **Database**: MongoDB (motor async driver) for Multi-Turn Session Memory
* **Frontend**: Next.js 16 (Turbopack) + TailwindCSS Glassmorphism UI
* **Orchestration**: `concurrently` (Runs both servers with a single command)

---

## 🚀 How to Run Locally

### 1. Requirements
* Node.js (v18+)
* Python 3.10+
* MongoDB running locally on `mongodb://localhost:27017`

### 2. Setup
1. Clone the repository.
2. In the `backend/` folder, create a `.env` file and add your Gemini API key:
   ```ini
   LLM_API_KEY=your_gemini_api_key_here
   ```
3. Run `npm install` in the root folder.
4. Run `npm install` in the `frontend/` folder.
5. Create a Python virtual environment in `backend/venv` and install `backend/requirements.txt`.

### 3. Start the Engine
From the root directory, simply run:
```bash
npm run dev
```
* **Frontend**: `http://localhost:3000` (Use Google Chrome for the best Voice API experience)
* **Backend**: `http://localhost:8080`

---

## ✍️ Contributors
* Kartik D Chendekar | Abhilash Tiwari | Kaushal Prakash

*Built with ❤️ for the Rupeezy Hackathon.*
