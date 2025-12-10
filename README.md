# Ludowars Battle

2D multiplayer platformer shooter.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Run with Docker
```bash
make run
```

**Services:**
- Frontend: http://localhost:3000
- Nakama Console: http://localhost:7351
- Nakama API: http://localhost:7350

### Commands

| Command | Description |
|---------|-------------|
| `make run` | Start all services |
| `make stop` | Stop all services |
| `make logs` | View logs |
| `make clean` | Stop and remove volumes |
| `make lint` | Run ESLint |
| `make format` | Format with Prettier |

### Local Development (without Docker)
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, MUI
- **Game Engine:** Phaser 3
- **State:** Zustand
- **Backend:** Nakama (Go)
- **Database:** PostgreSQL
