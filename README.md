# Support Buddy

A GenAI-powered solution for handling support issues / queries by analyzing Microsoft Outlook MSG files, Jira tickets, Confluence pages, and StackOverflow Q&A to identify root causes and solutions.

## Project Structure

```
SupportBuddy/
├── .git/
├── .gitignore
├── LICENSE
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .python-version
│   ├── Dockerfile
│   ├── LearnChromaDB.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── main.py
│   │   ├── services/
│   │   └── utils/
│   ├── check_chromadb.py
│   ├── data/
│   ├── pyproject.toml
│   ├── pytest.ini
│   ├── tests/
│   ├── uv.lock
│   └── .venv/
├── chroma.sh
├── confluence-config/
├── confluence-setup-files/
├── data/
├── deduplication_plan.md
├── docker-compose.yml
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   └── src/
├── jira-config/
├── jira-setup-files/
├── run_backend.py
├── set_venv.sh
├── start_backend.sh
├── start_frontend.sh
└── .venv/
```

## Overview

This application helps teams manage support issues / queries by:

1. Reading and parsing Microsoft Outlook MSG files containing issue details
2. Integrating with Jira to correlate tickets with issue reports
3. Ingesting and searching knowledge from Confluence pages and StackOverflow Q&A
4. Storing the extracted information in a vector database for semantic search
5. Providing a simple UI to query historical issues and find relevant solutions, and to configure search parameters

## Features

- MSG file parsing with metadata and attachment extraction
- Jira integration with bi-directional linking
- Confluence integration: ingest and search Confluence pages (supports Basic Auth with username/password for Server/DC)
- StackOverflow integration: ingest, index, and search StackOverflow Q&A
- Unified search results: All sources (Issues, Confluence, Stack Overflow) are combined and sorted by similarity percentage in a single backend response for the frontend to display
- Automatic deduplication for all sources using content-based hashing
- Semantic search with sentence transformers
- Bulk ingestion of MSG files, Confluence pages, and StackOverflow Q&A
- Vector search with configurable similarity threshold
- Responsive Material UI interface and configuration management
- Chroma Admin UI for vector database management
- **Jira ID search boost:** Searching for a Jira ID will always return the exact match as the top result (similarity score 1.0)

## System Architecture

### Core Components

1. **Backend Services** (FastAPI)
   - MSG Parser: Extracts data from Outlook MSG files
   - Jira Service: Handles Jira ticket integration
   - Confluence Service: Manages Confluence page ingestion and search
   - StackOverflow Service: Handles ingestion, indexing, and semantic search of StackOverflow Q&A
   - Vector Service: Manages ChromaDB operations, semantic search, and deduplication
   - Unified Search Aggregation: Combines and sorts all results by similarity percentage before returning to the frontend. Legacy result arrays are deprecated for UI use.

2. **Vector Database** (ChromaDB)
   - Stores embeddings for semantic search
   - Content-based deduplication using SHA256 hashes
   - Collections for support issues, Jira tickets, Confluence pages, StackOverflow Q&A
   - Configurable similarity threshold
   - Admin UI for monitoring

3. **Knowledge Integration**
   - Bi-directional Jira ticket linking
   - Confluence page ingestion and search
   - StackOverflow Q&A ingestion, indexing, and search
   - Unified search across all sources

4. **Frontend** (React/Material-UI)
   - Search interface with configurable parameters
   - Issue management and ingestion tools
   - Real-time search results with similarity scores
   - Unified results rendering: All search views use the unified, similarity-sorted results array

## Setup Instructions

### Prerequisites
- Python 3.11+
- uv (https://github.com/astral-sh/uv) for Python dependency management
  - Install with `pip install uv` or `brew install uv`
- Node.js and npm
- Docker and Docker Compose (for containerized setup)
- Jira instance (local or cloud)
- Confluence instance (local, via Docker Compose)
- Internet access for StackOverflow Q&A ingestion
- PostgreSQL (or use containerized version)

### Development Setup
1. Clone this repository
2. Install backend dependencies (Python 3.11 recommended):
   ```bash
   ./start_backend.sh
   ```
   - This script will create a `.venv` using `uv`, and install dependencies from `pyproject.toml` via `uv sync`.
   - You do NOT need to manage `requirements.txt` anymore. All dependencies are managed in `pyproject.toml`.
   - To add or update dependencies, edit `pyproject.toml` and run `uv sync`.
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Configure environment variables (see Environment Variables section)
   - For **Confluence Server**, set these in `backend/.env`:
     ```env
     CONFLUENCE_USERNAME=your-confluence-username
     CONFLUENCE_PASSWORD=your-confluence-password
     ```
   - For **Jira**, use:
     ```env
     JIRA_USERNAME=your-jira-username
     JIRA_PASSWORD=your-jira-password
     # Or, for Jira Cloud:
     # JIRA_API_TOKEN=your-jira-api-token
     ```
5. Start the services:
   - Development mode:
     ```bash
     ./start_backend.sh  # Starts backend with auto-reload
     ./start_frontend.sh  # Starts frontend dev server
     ```
   - Production mode:
     ```bash
     ./start_backend.sh --no-reload --host 0.0.0.0
     ./start_frontend.sh
     ```

### Docker Usage
- The backend Dockerfile now uses `uv sync` and `pyproject.toml` for dependency management. No need for `requirements.txt`.
- Example build and run:
  ```bash
  docker build -t support-buddy-backend ./backend
  docker run --env-file ./backend/.env -p 8000:8000 support-buddy-backend
  ```

### Notes
- The `.venv/` directory is now the standard location for the Python virtual environment (see `.gitignore`).
- All Python dependencies are managed in `pyproject.toml` and installed with `uv sync` (see [start_backend.sh](./start_backend.sh) and [backend/Dockerfile](./backend/Dockerfile)).

## Starting the Frontend

To start the frontend React application, use the provided script:

```sh
./start_frontend.sh
```

This script will:
- Change to the `frontend/` directory
- Install dependencies with `npm install` if needed
- Start the development server with `npm start`

You can also run these steps manually:
```sh
cd frontend
npm install  # Only needed once or when dependencies change
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) by default.

## Activating the Backend Python Virtual Environment

To activate the backend's Python virtual environment, use the provided script:

```sh
source ./set_venv.sh
```

> **Note:**
> - You **must** use `source` (or `. ./set_venv.sh`) to activate the venv in your current shell.
> - Running `./set_venv.sh` directly will **not** activate the environment in your shell and will show an error.
> - This script works for both bash and zsh shells.

If the virtual environment is missing, simply run inside backend folder:

```sh
uv sync
```

Then install dependencies:

```sh
source ./set_venv.sh
uv sync
```

## Environment Variables
The backend requires a `.env` file with configuration for:
```env
# Jira Settings
JIRA_URL=http://localhost:9090
JIRA_USERNAME=admin
JIRA_PASSWORD=admin      # For local/server instance
JIRA_API_TOKEN=          # For cloud instance
# Confluence Settings
CONFLUENCE_USERNAME=your-confluence-username
CONFLUENCE_PASSWORD=your-confluence-password
# Vector DB Settings
VECTOR_DB_PATH=./data/vectordb
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
# (No special StackOverflow credentials required for public Q&A ingestion)
```

## Backend Search Logic
- When searching for a Jira ID (e.g., `PROJ-123`), the backend will always boost the exact match to the top of the results (similarity score 1.0), regardless of embedding similarity.
- Jira ticket IDs are always included in the embedded text for accurate matching.

## Unified Search Result API
- `/search` endpoint returns a single `results` array, sorted by similarity percentage, with a `type` field for each result (`jira`, `msg`, `confluence`, `stackoverflow`)

### Example Response
```json
{
  "results": [
    { "type": "jira", "id": "...", "similarity_score": 0.91, ... },
    { "type": "confluence", "id": "...", "similarity_score": 0.87, ... },
    { "type": "stackoverflow", "id": "...", "similarity_score": 0.85, ... }
  ],
  "vector_issues": [...],
  "confluence_results": [...],
  "stackoverflow_results": [...]
}
```

## Monitoring & Logging
- Logs stored in `backend/logs/`
- Configure log levels in `backend/app/core/logging_config.py`
- Component-specific logging for MSG parsing, Jira, Confluence, StackOverflow, deduplication, vector ops, and search
- Health checks: backend API `/health`, DB connections, vector DB collections, Jira/Confluence connectivity, StackOverflow ingestion

## Performance Tuning
- Similarity threshold (default 0.2) in `backend/app/core/similarity_config.json`
- Resource management: cleanup, archiving, disk space monitoring
- Query performance: result limits, response times, batch sizes

## Security Considerations
- API security: CORS, rate limiting, input validation, secure file handling
- Integration security: Jira/Confluence credentials, API token rotation
- Data protection: secure file handling, DB encryption, network isolation, access controls

## System Operations
### Deployment
- Development: `start_backend.sh`, `npm start`
- Production: Docker Compose, persistent data volumes
- Backend startup script ensures all services are ready before launch

### Monitoring
- Service health: API endpoints, DB checks, vector DB status, Jira/Confluence connectivity
- Performance metrics: query times, embedding speed, storage, cache

### Testing & Quality
- Automated tests: backend (pytest), frontend (React), integration, vector search validation
- Performance testing: load, batch, response times, memory

### Configuration Management
- `.env` for service settings
- Docker Compose for orchestration
- Jira/Confluence/StackOverflow setup
- Vector DB and file storage configuration

### Security
- Authentication: Jira/Confluence credentials, StackOverflow public Q&A does not require authentication
- Data protection: file handling, encryption, network, access controls

## Summary
Support Buddy provides a comprehensive solution for support issue management through:
1. **Knowledge Integration**: MSG file parsing, Jira synchronization, Confluence integration, StackOverflow Q&A ingestion, automatic deduplication
2. **Intelligent Search**: Vector-based semantic search, configurable similarity, cross-source aggregation, real-time ranking
3. **Modern Architecture**: Containerized microservices, vector database, React UI, extensible API design

## Troubleshoot

1. update ATL_SECURED to the password what you configure during its db setup in dbconfig.xml
2. confluence is not starting with 5433 port with its confluence-postgres. update its port as 5432 and start docker compose up -d confluence to do the initial setup, once done revert back to its port. use start_backend.sh to start normally.
