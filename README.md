MindPlay

Play. Think. Grow.

MindPlay is a modern brain-training web app built around short, engaging
games designed to keep your mind sharp.

Instead of long training sessions, MindPlay turns a few minutes into
quick challenges that test memory, logic, speed, focus, math, and
problem-solving.

✨ Features

🧠 12 brain-training games

🎮 Short, replayable challenges

📈 XP, levels, streaks, games played, and best scores

🏆 Game and progress achievements

📅 Daily challenges with bonus XP

👤 User accounts with a permanent MindPlay name

☁️ Cloud-saved progress with Supabase

🔐 Supabase Row Level Security (RLS)

💾 Remember Me login option

📱 Responsive mobile-first interface

✨ Premium dark UI with subtle cyan/fuchsia accents

⚡ Built with Next.js and optimized for fast navigation

🎮 Games

MindPlay currently includes:

Memory Match --- Test your memory by matching pairs.

Quick Math --- Solve arithmetic problems as quickly as possible.

Word Scramble --- Unscramble words before time runs out.

Riddle Me --- Solve riddles and think outside the box.

Odd One Out --- Find the item that does not belong.

Tic Tac Toe --- Challenge the game board and plan your moves.

Reaction Rush --- Test your reaction speed.

Number Memory --- Remember and reproduce number sequences.

Color Clash --- Test your focus against conflicting colors.

Pattern Recall --- Remember and reproduce visual patterns.

Sequence Master --- Watch a sequence and reproduce it in order.

Logic Rush --- Solve logic challenges under pressure.

🛠️ Tech Stack

Next.js 16

React

TypeScript

Tailwind CSS

Supabase

Vercel

ESLint

🗂️ Project Structure

MindPlay/
├── app/
│   ├── games/
│   │   ├── color-clash/
│   │   ├── logic-rush/
│   │   ├── memory-match/
│   │   ├── number-memory/
│   │   ├── odd-one-out/
│   │   ├── pattern-recall/
│   │   ├── quick-math/
│   │   ├── reaction-rush/
│   │   ├── riddle-me/
│   │   ├── sequence-master/
│   │   ├── tic-tac-toe/
│   │   └── word-scramble/
│   ├── games/
│   └── ...
├── components/
│   └── ...
├── lib/
│   ├── achievements.ts
│   ├── dailyChallenge.ts
│   ├── gameXP.ts
│   ├── progress.ts
│   └── supabase.ts
├── public/
└── ...

👤 Accounts & Progress

MindPlay uses Supabase for account and progress persistence.

Profile

Each authenticated user has a profile containing their permanent
MindPlay name.

Overall Progress

MindPlay stores:

XP

Games played

Current streak

Best score

Last played date

Last update time

Game Progress

Individual game statistics can be stored per user and game, including:

Games played

Best score

Total score

Last played date

Last update time

Feedback

Authenticated users can submit feedback, including a reaction and
message.

🔐 Security

MindPlay uses Supabase Row Level Security (RLS).

Users are restricted to their own records using their authenticated
Supabase user ID.

This applies to:

profiles

overall_progress

game_progress

feedback

The application does not expose the Supabase service-role key to the
browser.

🚀 Getting Started

1. Clone the repository

git clone https://github.com/guddies378/MindPlay.git
cd MindPlay

2. Install dependencies

npm install

3. Configure environment variables

Create a .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

Use the values from your Supabase project.

Do not commit .env.local or any secret keys to GitHub.

4. Start the development server

npm run dev

Open:

http://localhost:3000

📦 Available Scripts

npm run dev

Starts the local development server.

npm run build

Creates a production build and checks the application for build errors.

npm run start

Starts the production server after a successful build.

npm run lint

Runs ESLint checks.

☁️ Deployment

MindPlay is designed to deploy through Vercel.

The production deployment is:

https://mindplay-arcade.vercel.app/

The GitHub repository is:

https://github.com/guddies378/MindPlay

When the project is connected to Vercel, pushing changes to the main
branch can automatically trigger a new deployment.

Remember to configure the same Supabase environment variables in Vercel:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

🎨 Design

MindPlay follows a simple, premium visual direction:

Dark interface

Large, bold typography

Generous negative space

Minimal interface elements

Subtle ambient gradients

Cyan and fuchsia as the main visual accents

Responsive layouts designed for mobile and desktop

Consistent game UI through a shared GameShell

The goal is to make the experience feel clean, confident, focused, and
fun without overwhelming the player.

📱 Responsive Experience

MindPlay is designed to work across:

Mobile phones

Tablets

Desktop screens

Game pages use natural page scrolling on mobile so longer game
interfaces remain comfortable to use.

🧠 Why MindPlay?

MindPlay is built around a simple idea:

Short games. Serious thinking.

You do not need hours of training to challenge your brain. Pick a game,
think fast, and keep getting better.

📄 License

This project is currently intended as a personal project.