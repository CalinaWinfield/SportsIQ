# SportIQ
## Sports Logo Quiz & ESPN FanHub

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

## 🚀 Running the Application (Beginner's Guide)

If you are new to GitHub and using the terminal/command line, follow these step-by-step instructions to get the application running on your computer.

---

### 📋 Prerequisites (Before You Begin)

Before running the project, ensure you have the following installed on your computer:

1. **Node.js & npm** (Required)
   - Node.js is the program that allows your computer to run JavaScript outside a browser. `npm` (Node Package Manager) comes bundled with Node.js and manages project libraries.
   - **Check if already installed**: Open your terminal/command prompt and run:
     ```bash
     node -v
     npm -v
     ```
     If version numbers appear (e.g. `v18.x.x` or `v20.x.x`), you're ready!
   - **If not installed**: Download the **LTS (Long Term Support)** version from the official website:
     👉 [https://nodejs.org/](https://nodejs.org/)
     Run the installer and accept the standard defaults.

2. **Git** (Recommended)
   - Git is a tool used to download code from GitHub.
   - **Check if installed**: Run `git --version` in your terminal.
   - **If not installed**: You can either install Git from [https://git-scm.com/](https://git-scm.com/), or follow the "Download ZIP" method below.

---

### 📥 Step 1: Get the Code onto Your Computer

Choose **one** of the two methods below:

#### Option A: Clone with Git (Recommended)
1. Open your terminal (Command Prompt, PowerShell, or macOS Terminal).
2. Navigate to the folder where you want to store the project (e.g. `cd Documents`).
3. Run the following command:
   ```bash
   git clone https://github.com/your-username/sports-logo-app.git
   ```
4. Move into the newly created project folder:
   ```bash
   cd sports-logo-app
   ```

#### Option B: Download as a ZIP File (No Git Needed)
1. Go to the main GitHub repository page in your web browser.
2. Click the green **`<> Code`** button near the top right.
3. Click **Download ZIP**.
4. Locate the downloaded `.zip` file in your Downloads folder, right-click it, and select **Extract All...** (or double-click on Mac).
5. Open the extracted folder named `sports-logo-app`.

---

### 💻 Step 2: Open the Terminal in the Project Folder

You need your terminal to be inside the `sports-logo-app` directory:

- **Using Visual Studio Code (Easiest)**:
  1. Open VS Code.
  2. Click **File → Open Folder...** and select `sports-logo-app`.
  3. Open the built-in terminal by pressing `` Ctrl + ` `` (backtick) or selecting **Terminal → New Terminal** from the top menu.
- **On Windows (File Explorer)**:
  1. Open the `sports-logo-app` folder in Windows File Explorer.
  2. Click on the address bar at the top (where the folder path is shown).
  3. Type `cmd` or `powershell` and press **Enter**. A terminal window will open directly inside this folder.
- **On macOS (Finder)**:
  1. Open the `Terminal` application (press `Cmd + Space`, type `Terminal`, press Enter).
  2. Type `cd ` (with a space after `cd`).
  3. Drag and drop the `sports-logo-app` folder from Finder into the Terminal window, then press **Enter**.

---

### 📦 Step 3: Install Project Dependencies

The project relies on open-source packages (React, Express, Tailwind, etc.) to run. Run this command in your terminal to install everything automatically for both the client and server:

```bash
npm run install:all
```

> ⏳ **What to expect**: You will see package names downloading and progress bars. This typically takes 1–2 minutes the first time. When finished, you will see a message indicating packages were added and you will be returned to the normal command prompt line.
>
> 💡 *Windows Note*: If PowerShell gives an execution policy warning, you can use `npm.cmd run install:all` or run the command inside standard Command Prompt (`cmd`).

---

### ▶️ Step 4: Start the Application

Once installation completes, run this single command to launch both the backend server and frontend website together:

```bash
npm run dev
```

You will see output indicating that:
- The **Backend API** is running on: `http://localhost:3001`
- The **Frontend App (Vite)** is running on: `http://localhost:5173`

---

### 🌐 Step 5: View the App in Your Browser

1. Open any web browser (Google Chrome, Edge, Safari, Firefox).
2. Go to the following address:
   👉 **[http://localhost:5173](http://localhost:5173)**
3. You can now play the Sports Logo Quiz, browse the ESPN FanHub, and track your favorite teams!

> ⚠️ **Keep the Terminal Open**: The terminal window must stay open while using the web app. If you close the terminal window, the server stops.

---

### ⏹️ How to Stop the Application

When you are finished using or testing the app:
1. Click into the terminal window running the app.
2. Press **`Ctrl + C`** on your keyboard (on Mac: `Ctrl + C` or `Cmd + C`).
3. If Windows asks `Terminate batch job (Y/N)?`, type `y` and press **Enter**.

---

### 🏗️ Alternative: Running in Production Mode

If you want to run the optimized, compiled production build where the backend server serves the frontend on a single port (`3001`):

```bash
# 1. Build both client and server
npm run build

# 2. Start the production server
npm start
```
Then open your browser to: **[http://localhost:3001](http://localhost:3001)**.

---

### 🛠️ Common Troubleshooting & Beginner Tips

- **`'node'` or `'npm'` is not recognized**:
  - *Cause*: Node.js is not installed or the terminal was opened before installation finished.
  - *Solution*: Install Node.js from [nodejs.org](https://nodejs.org/), then **close and re-open your terminal or VS Code**.
- **Windows PowerShell Execution Policy Notice** (`...running scripts is disabled on this system`):
  - *Solution*: Use `npm.cmd` instead of `npm` (e.g., `npm.cmd run dev`), or run the command in Windows Command Prompt (`cmd.exe`), or run this one-time command in PowerShell:
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```
- **Port Already in Use (`EADDRINUSE: 3001` or `5173`)**:
  - *Cause*: Another instance of the app is already running in a background terminal.
  - *Solution*: Close any other open terminal windows running the app, or terminate the process.
- **Do I need an ESPN API Key?**:
  - No! The app connects directly to ESPN's public endpoints. No API keys, sign-ups, or credentials are required.
- **Resetting a Forgotten Password**:
  - The login modal includes a built-in sports security question reset link (`/forgot-password`) that verifies you using your followed favorite teams, so no email setup is required.
