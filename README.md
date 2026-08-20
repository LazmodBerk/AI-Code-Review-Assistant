# CodeLens — AI Code Review Assistant

![AI Code Review Logo](frontend/public/logo.jpg)

A full-stack, AI-assisted code review platform that combines deterministic static analysis with contextual LLM feedback. Review repositories, uploaded files, or live code and turn findings into an actionable engineering report.

## Features

- **Real-Time Code Analysis**: Get instant AI feedback while writing code inside the browser with Monaco Editor integration.
- **Repository Scanning**: Upload files or paste a GitHub URL to perform full-scale static analysis.
- **Seven-Dimension Scoring**: Track overall health, security, performance, maintainability, readability, architecture, and complexity.
- **Professional Product Experience**: Responsive landing page, accessible dropdown navigation, mobile menu, interactive analysis preview, and light/dark themes.
- **Dynamic Dashboard**: Explore prioritized vulnerabilities, quality metrics, language distribution, and AI recommendations.
- **Portable Reports**: Export analysis results as PDF, Markdown, or HTML.
- **Flexible AI Providers**: Use OpenAI, Ollama, LM Studio, or static-analysis-only mode.
- **Developer Settings**: Seamless light/dark mode toggles, code editor configuration (Minimap, Word Wrap), and interactive account preferences.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Analysis**: Ruff, Bandit, Radon, Python AST checks
- **Routing**: React Router DOM
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charting**: Recharts
- **Styling**: Vanilla CSS (CSS Variables, Grid, Flexbox, Glassmorphism)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.11 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LazmodBerk/AI-Code-Review-Assistant.git
   cd AI-Code-Review-Assistant/frontend
   ```

2. Configure and start the backend:
   ```bash
   copy .env.example .env
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   python backend/main.py
   ```

3. In another terminal, install the frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```text
backend/
├── app/
│   ├── analyzers/      # Static analysis adapters
│   ├── api/            # REST and WebSocket endpoints
│   ├── services/       # Analysis orchestration
│   └── scoring/        # Quality scoring engine
└── tests/              # Backend test suite
frontend/
├── src/
│   ├── api/            # API client configurations (axios)
│   ├── components/     # Reusable UI components
│   │   ├── dashboard/  # Dashboard specific components (Charts, Tables)
│   │   ├── layout/     # Structural components (TopNav)
│   │   └── ui/         # Base UI components (Button, Card, Badge)
│   ├── pages/          # Full page views (Upload, Results, Profile, Settings)
│   ├── App.tsx         # Main application router
│   ├── index.css       # Global stylesheet (Theme definitions & Shims)
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Validation

```bash
cd frontend && npm run build
cd ../backend && pytest -q
```

## Contributing

Contributions are always welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
