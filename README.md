<<<<<<< HEAD
# SportIQ Sports Logo Quiz & ESPN FanHub

A modern, full-stack sports quiz game and personalized fan hub for **NFL, NBA, College Football (CFB), and WNBA**.

---

## Features

### 1. Sports Logo Quiz Arena
- **Four Leagues & All-Stars Mix**:
  - **NFL**: 32 franchises
  - **NBA**: 30 franchises
  - **CFB**: 101 Division 1 FBS Powerhouses (from SEC, Big Ten, Big 12, ACC, Sun Belt, SWAC, and Pac-10)
  - **WNBA**: 15 franchises (Aces, Liberty, Dream, Storm, etc.)
  - **All-Star Challenge**: Mixed randomized logos across all 4 leagues!
- **Three Game Modes**:
  - **Classic Quiz**: 10 or 20 questions with 15-second per-question timer.
  - **Speed Blitz**: 60-second high-speed blitz with escalating combo multipliers!
  - **Sudden Death / Streak**: 3 lives! Keep answering until strikes run out.
- **Three Visual Difficulty Filters**:
  - **Normal HD**: High-definition authentic crest.
  - **Silhouette Mode**: Pure black shadow silhouette against stadium lighting.
  - **Zoomed In**: 2.5x close-up crop of key logo detail.
- **Interactive Gameplay**:
  - Web Audio API procedural sound engine (correct chimes, wrong buzzers, combo swooshes, victory fanfare).
  - Keyboard shortcuts (`1`, `2`, `3`, `4`) for lightning-fast answers.
  - Smart distractor generator (incorrect answers selected from the same league/conference).
  - Hints system (reveals conference or location with minor point penalty).
  - Question review breakdown with logos, accuracy %, and celebratory confetti!

### 2. ESPN FanHub ("My Teams")
- **Follow / Unfollow**: Search and follow any team across NFL, NBA, CFB, and WNBA.
- **Live Scores & Games**: Live quarter/period, game clock, broadcast channel (ESPN, ABC, CBS, TNT), and scores.
- **Team Schedules**: Upcoming fixture dates, venues, and countdowns.
- **ESPN Breaking News**: Curated news feed with images, summaries, and links to full ESPN stories.
- **Standings & Records**: Season records (W-L) and conference/division standings.
- **Live Scoreboard Ticker**: ESPN-style top scores ticker auto-refreshing across all leagues.

### 3. User Accounts & Leaderboard
- **Authentication**: Sign up, Login, and Guest Mode. Passwords hashed with `bcryptjs`, authenticated via JWT.
- **Career Stats**: Total games, overall accuracy %, best win streak, high scores per league.
- **Global Leaderboard**: Compare top logo scores filtered by league and mode.

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API.
- **Backend**: Node.js, Express, TypeScript, SQLite/JSON database with atomic file transactions, JWT authentication, bcryptjs.
- **Data Source**: ESPN official public REST APIs (zero API keys or credentials needed).

---

## Running the Application

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Development Mode
```bash
npm run dev
```
- Backend API runs on: `http://localhost:3001`
- Frontend App runs on: `http://localhost:5173`

### 3. Production Build & Start
```bash
npm run build
npm start
```
=======
