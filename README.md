# ⚡ Campus Flash Barter & Favor Board

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue) ![InsForge](https://img.shields.io/badge/InsForge-PostgreSQL-green) ![AI Powered](https://img.shields.io/badge/AI-Skill_Sync-purple)

**The hyper-local, real-time marketplace for the chaotic college experience.**

College students constantly face urgent, hyper-local needs—from needing a scientific calculator 20 minutes before an exam, to finding an Express.js expert to squash a bug at 2 AM. Traditional group chats are too noisy, and formal platforms are too slow. 

**Flash Barter** solves the "cold start" problem of campus networking by turning everyday favors into a fast-paced, gamified, and real-time economy.

### ✨ Core Features

* **📡 The Live "Flash" Feed:** Built on InsForge WebSockets, favor requests appear and disappear from the campus feed in real-time as peers click the "I Got You" claim button. No page refreshes required.
* **🧠 AI "Skill-Sync" Matchmaking:** Users upload their resumes, and an integrated LLM extracts their core technical skills. When a peer posts a coding or academic favor, the system automatically routes a targeted push notification to the most qualified students on campus.
* **💸 Zero-Fee UPI Deep Linking:** Bypasses traditional payment gateways. Students settle bounties instantly via dynamic `upi://` links that open GPay/PhonePe directly, ensuring 0% transaction fees.
* **💬 Ephemeral Coordination:** Once a favor is claimed, a temporary, private chat room opens to coordinate the physical handoff. The chat self-destructs 24 hours after the favor is marked complete.

### 🛠️ Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend & Realtime:** InsForge (PostgreSQL, Auth, WebSocket Subscriptions)
* **AI & Parsing:** Google Gemini API / Hugging Face (NLP Skill Extraction), `pdf-parse`
* **Payments:** Custom UPI Deep Link Generator