# AI Code Review Assistant

[![Build Status](https://github.com/your-username/AICodeReview/workflows/CI/badge.svg)](https://github.com/your-username/AICodeReview/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI Code Review Assistant is an intelligent tool that automates the code review process. By combining static analysis and Large Language Models (LLMs), it acts as an experienced software engineer meticulously checking your code for bugs, security vulnerabilities, performance bottlenecks, and structural problems.

## Features

- 🔍 **Static Analysis Integration:** Employs proven static analysis techniques (e.g., AST-based analysis, cyclomatic complexity computation via Radon) to surface typical code smells and maintainability metrics.
- 🧠 **AI-Powered Code Review:** Hooks up to multiple LLM providers to offer deeper insights, architectural suggestions, and semantic bug finding.
- 📊 **Detailed Scoring:** Calculates code quality scores across various categories including Security, Readability, Maintainability, and more.
- 🐳 **Docker Ready:** Both Frontend and Backend parts are containerized, making setup a breeze.
- 🖥️ **Developer Friendly:** Includes helpful scripts for quick local development without Docker if needed.
- 🔌 **Pluggable Architecture:** Easy to switch between OpenAI, Ollama, LMStudio, or even run with no LLM.

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/AICodeReview.git
   cd AICodeReview
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env and configure your desired LLM_PROVIDER
   ```

3. **Start the Application:**
   On Windows:
   ```cmd
   scripts\start.bat
   ```
   On Linux/macOS:
   ```bash
   bash scripts/start.sh
   ```

4. **Access the application:**
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

### Development Mode

If you prefer to run things directly for development without Docker:

On Windows:
```cmd
scripts\dev.bat
```

## Configuration

The application is highly configurable via the `.env` file.

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `LLM_PROVIDER` | The AI provider to use (`openai`, `ollama`, `lmstudio`, `none`) | `none` |
| `OPENAI_API_KEY` | Your OpenAI API key if using `openai` provider | (empty) |
| `OPENAI_MODEL` | Model string to use for OpenAI | `gpt-4o-mini` |
| `OLLAMA_BASE_URL` | Base URL for your local Ollama instance | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model string to use for Ollama | `llama3` |
| `LMSTUDIO_BASE_URL` | Base URL for your LMStudio local server | `http://localhost:1234` |
| `LMSTUDIO_MODEL` | Model string to use for LMStudio | `local-model` |
| `DEBUG` | Enable debug mode | `false` |
| `MAX_FILE_SIZE_MB` | Maximum file size for analysis uploads | `50` |
| `MAX_FILES_PER_ANALYSIS` | Maximum files allowed per repository/analysis | `500` |

## API Endpoints

The API is fully documented automatically with OpenAPI/Swagger. Below is a quick overview:

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/health` | GET | Health check endpoint |
| `/api/upload` | POST | Upload files or repositories for analysis |
| `/api/analyze` | POST | Trigger an analysis run |
| `/api/reports/{id}` | GET | Get a specific report |
| `/api/history` | GET | View historical analyses |
| `/ws/{id}` | WebSocket | Real-time analysis status updates |

## Architecture

The project is broken into distinct services:

1. **Backend** (Python / FastAPI):
   - Handles API requests, WebSocket connections, and file uploads.
   - Runs static code analyzers concurrently.
   - Orchestrates LLM API calls via the Factory pattern.
   - Consolidates results and calculates scores.
   
2. **Frontend** (Node.js / React / Nginx):
   - Presents a modern user interface.
   - Upload UI with progress indicators.
   - Result visualization using charts and categorized tables.
   - Served securely and efficiently through an Nginx reverse proxy.

## LLM Provider Setup Guides

### OpenAI
1. Set `LLM_PROVIDER=openai`
2. Set your API key in `OPENAI_API_KEY`
3. Optional: change `OPENAI_MODEL` to `gpt-4` or `gpt-3.5-turbo`

### Ollama (Local)
1. Install Ollama and start the server.
2. Run `ollama run llama3` to download and test the model.
3. Set `LLM_PROVIDER=ollama`
4. Ensure `OLLAMA_BASE_URL` points to your Ollama API (usually `http://localhost:11434` or `http://host.docker.internal:11434` if running in Docker).

### LM Studio (Local)
1. Install LM Studio and download a compatible GGUF model.
2. Start the Local Server in LM Studio (usually port 1234).
3. Set `LLM_PROVIDER=lmstudio`
4. Ensure `LMSTUDIO_BASE_URL` points to the correct local server IP.

## Testing

Backend tests are written with `pytest`. To run them:

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

GitHub Actions are configured to automatically run these tests on PRs to the `main` or `develop` branches.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
