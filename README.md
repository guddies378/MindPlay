# MindPlay 🧠🎮

MindPlay is a brain-training web app built around short and fun mini-games that challenge memory, logic, focus, reaction speed, problem-solving, and mental calculation.

> **Make your mind sharper while playing.**

---

## 🌐 Live Demo

**Play MindPlay:**  
https://mindplay-six.vercel.app

## 📂 GitHub Repository

https://github.com/guddies378/MindPlay

---

## ✨ Features

- 🧠 Brain-training mini-games
- 🎮 Multiple game types
- 🃏 Memory challenges
- ⚡ Reaction-speed challenges
- 🧩 Logic and pattern challenges
- ➕ Mental math challenges
- 🔤 Word challenges
- 🔢 Number-memory challenges
- ❓ Riddle challenges
- 🔥 Daily streak system
- ⭐ XP progression system
- 🏆 Unlimited level progression
- 📊 Player progress tracking
- 👤 User accounts
- 💬 Feedback system
- 📱 Responsive design
- 🔐 Supabase authentication
- ☁️ Persistent player data

---

# 🎮 Games

MindPlay currently includes the following games.

### 🃏 Memory Match

Test your memory by finding matching cards.

### ➕ Quick Math

Solve arithmetic questions as quickly as possible.

### ❓ Riddle Me

Solve riddles before the timer runs out.

### 🎯 Tic Tac Toe

Play the classic Tic Tac Toe game.

### 🔤 Word Scramble

Unscramble letters and find the correct word.

### 🔢 Number Memory

Remember and recall numbers.

### 👀 Odd One Out

Find the item that doesn't belong.

### 🧩 Pattern Recall

Remember and reproduce visual patterns.

### 🔄 Sequence Master

Identify patterns and complete sequences.

### ⚡ Reaction Rush

Test your reaction speed.

### 🎨 Color Clash

Challenge your visual recognition and reaction speed.

### 🧠 Logic Rush

Solve quick logic-based challenges.

---

# 🏆 Progression System

MindPlay uses an XP-based progression system.

Players earn XP by playing games and completing activities.

MindPlay tracks:

- XP
- Level
- Games played
- Current streak
- Best score
- Last played

The level system is **unlimited**, allowing players to continue leveling up as they earn more XP.

## XP Levels

| Level | Required XP |
|------:|------------:|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 450 |
| 5 | 700 |
| 6 | 1,000 |
| 7 | 1,350 |
| 8 | 1,750 |
| 9 | 2,200 |
| 10 | 2,700 |

There is no maximum level.

---

# 🔥 Daily Streaks

MindPlay tracks player activity through daily streaks.

Players can maintain their streak by continuing to play and complete activities consistently.

The streak system is designed to encourage regular brain-training sessions.

---

# 👤 User Accounts

Users can create a MindPlay account using:

- Email
- Password
- MindPlay name

Authentication is handled through **Supabase Auth**.

Passwords are handled securely by Supabase Auth and are not stored as plaintext in the application's public database tables.

---

# 💬 Feedback System

Players can submit feedback directly through MindPlay.

Feedback records contain:

- Email
- MindPlay name
- Reaction
- Message
- Date submitted
- XP awarded

Players can receive:

**+10 XP**

for their first feedback submission of the day.

Additional feedback submissions on the same day do not award additional feedback XP.

---

# 📊 Player Progress

MindPlay keeps track of player progress across the application.

The player's progress includes:

- Current XP
- Level
- Games played
- Streak
- Best score
- Last played date

Progress is stored in Supabase so player information can persist between sessions.

---

# 🗄️ Database

MindPlay uses **Supabase** for authentication and persistent application data.

## Profiles

```text
profiles
├── id
├── email
├── mindplay_name
└── created_at