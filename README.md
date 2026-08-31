# 🧭 Study Navigator

> **Context-Aware AI Document Study Workspace**  
> Stop getting lost in dense technical material. Study Navigator pairs your document reader with an AI companion that tracks your exact page, maps prerequisite concept dependencies, and diagnoses cognitive stumbling blocks the moment you hit a wall.

[![Live Demo](https://img.shields.io/badge/Live_Demo-studynavigator.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://studynavigator.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Vicdara%2Fstudy--navigator-24292e?style=for-the-badge&logo=github)](https://github.com/Vicdara/study-navigator)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Live Demo

Experience the full application in production:  
👉 **[https://studynavigator.vercel.app/](https://studynavigator.vercel.app/)**

---

## ⚡ Key Capabilities

### 1. 📖 Page-Aware Active Context Tracking
- **Bounded Context RAG**: AI answers are automatically grounded in the active page you are reading, plus immediate surrounding pages, preventing off-topic hallucinations.
- **Context Trail**: Visual breadcrumbs show your exact learning trajectory (Prerequisite A → Prerequisite B → [You] → Target C) with one-click page jumps.

### 2. 💡 Signature “I'm Lost” Diagnosis
- When dense formulas, proofs, or abstract jargon overwhelm you, click **“I'm Lost”**.
- The AI diagnoses unmastered prerequisite concepts from earlier in the paper, constructs intuitive bridge analogies, and presents comprehension checks before returning you to your reading flow.

### 3. 🕸️ Dynamic Concept Dependency Trees & Mastery Graph
- Real-time concept dependency mapping across the document.
- Tracks mastered vs. in-progress concepts, visual prerequisite graphs, and individual learning progress.

### 4. 📂 Universal Client-Side Document Ingestion
- **Formats Supported**: PDF (.pdf), Microsoft Word (.docx, .doc), Markdown (.md), Plain Text (.txt).
- Fast in-browser text extraction, heading detection, and page splitting with zero server upload latency.

### 5. 🎨 12 Eye-Comfort Themes & Customizable Pedagogy
- **Themes**: Focus Paper (default warm ivory with green touches), Minimalist Pure, Emerald Study, Midnight Obsidian, Dracula Dark, Tokyo Night, Cyberpunk Amber, Rose Quartz, Nordic Slate, Warm Sepia, Matcha Zen, High Contrast AAA.
- **Pedagogy Modes**: Intuitive & Mental Models, Real-World Analogies, Step-by-Step Breakdowns, Explain Like I’m 5 (ELI5), Academic & Formal.
- **Target Difficulty**: Beginner, Intermediate, Advanced, Researcher.

### 6. 🛡️ Robust Multi-Provider AI Architecture
- Supports **Mistral AI**, **Groq (Ultra-Fast LPUs)**, **OpenCode**, **OpenRouter**, **Gemini**, **OpenAI**, and **Anthropic**.
- **Autonomous Fallback Engine**: Built-in semantic synthesizer ensures 100% offline uptime and zero-key operation.
- **Key-Rotation Pools**: Automatically rotates API keys with exponential backoff retry mechanisms.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Custom CSS Variables
- **Document Processing**: pdfjs-dist (PDF extraction & rendering), mammoth (Word docx extraction)
- **Video & Demo Animations**: Remotion
- **Deployment**: Vercel & Netlify Ready (ercel.json, 
etlify.toml, public/_redirects)

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
`ash
git clone https://github.com/Vicdara/study-navigator.git
cd study-navigator
`

### 2. Install dependencies
`ash
npm install
`

### 3. Run development server
`ash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
`ash
npm run build
`

---

## 🌐 Deploy to Vercel or Netlify

### Deploy with Vercel
1. Import Vicdara/study-navigator on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: 
pm run build. Output Directory: dist.
4. Click **Deploy**.

### Deploy with Netlify
1. Import Vicdara/study-navigator on [Netlify](https://app.netlify.com).
2. Netlify will automatically detect 
etlify.toml.
3. Click **Deploy Site**.

---

## 🔒 Security & Privacy

- All document extraction, text highlighting, reading progress, and notes are processed and stored locally in your browser's localStorage and IndexedDB.
- Custom user API keys entered in the Settings modal remain private on your machine and are never shared or sent to third-party databases.

---

## 📄 License

MIT © [Vicdara](https://github.com/Vicdara)
