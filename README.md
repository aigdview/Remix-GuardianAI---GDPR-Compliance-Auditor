# GuardianAI - Autonomous GDPR Compliance & Privacy Audit Agent

GuardianAI is a hybrid open-model autonomous privacy engineering and compliance auditor built with the **Google Agent Development Kit (ADK)**, utilizing **Gemma 4** (`gemma-4-31b-it` / `gemma-4-E4B`) for privacy-preserving edge PII scrubbing and **Gemini 3.7 Flash** for statutory GDPR regulatory reasoning and tool orchestration.

It systematically inspects software architecture documents, database DDL schemas, and telemetry pipelines against statutory GDPR Articles (Articles 5, 6, 7, 9, 17, 25, 32, and 44) to identify PII, quantify compliance risk, and generate actionable engineering remediation tickets with drop-in code fixes.

---

## ⚡ Hybrid Model Pipeline Architecture

1. **Stage 1: Edge PII Scrubbing (Gemma 4)**
   - Pre-processes incoming architecture/schema specifications on the edge.
   - Automatically detects and masks raw internal user handles (`[MASKED_USER_HANDLE]`), API credentials/secrets (`[MASKED_API_TOKEN_OR_SECRET]`), and private corporate subnet IPs (`[MASKED_CORPORATE_INTERNAL_IP]`).

2. **Stage 2: Statutory Regulatory Engine (Gemini 3.7 Flash)**
   - Consumes the sanitized schema and orchestrates autonomous tool calls across the legal knowledge base and statutory database.
   - Generates actionable engineering remediation tickets with concrete code recipes.

---

## 🛠️ Architecture & Tools

GuardianAI defines 3 autonomous tools accessible to Gemini and the ADK runtime:

| Tool Name | Description | Key GDPR Focus |
| :--- | :--- | :--- |
| `scan_data_schema` | Parses schemas, tables, and telemetry streams to detect PII (Direct, Financial, Special Category Art. 9, Telemetry). | Articles 5, 9, 32 |
| `search_gdpr_clauses` | Queries statutory European GDPR legal database and penalty tiers for legal grounding. | Articles 4, 5, 6, 7, 17, 25, 32, 44 |
| `generate_remediation_task` | Generates engineering Jira/GitHub tickets with SQL/TypeScript code solutions. | Article 32 (Encryption), Article 5(1)(e) (TTL Purge), Article 17 (DSAR) |

---

## 🚀 Local Development with Google ADK

### 1. Prerequisites
- Python 3.10+
- Node.js 20+ (for frontend workspace)
- A Google Gemini API Key (`GEMINI_API_KEY`)

### 2. Install Dependencies
```bash
# Install Python ADK & Backend dependencies
pip install -r requirements.txt

# Install Node frontend dependencies (optional for local React editing)
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080
```

### 4. Run with Google ADK CLI
You can interact with GuardianAI using the ADK developer tools:

```bash
# Launch ADK Web UI inspector
adk web agent.py

# Or run directly in terminal interactive mode
adk run agent.py
```

### 5. Run FastAPI Backend Server
```bash
# Start FastAPI / Uvicorn server on http://localhost:8080
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

---

## ☁️ Deploy to Google Cloud Run

GuardianAI is containerized with a production multi-stage `Dockerfile` that packages the React audit workspace and the Python ADK backend together.

### 1. Build and Deploy with `gcloud`
Run the following commands in the project root:

```bash
# Set your GCP Project ID
export PROJECT_ID="your-gcp-project-id"
export REGION="europe-west1"

# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project $PROJECT_ID

# 2. Deploy directly from source to Cloud Run
gcloud run deploy guardian-ai-agent \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key_here" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 3. Verify Deployment
Once deployed, Cloud Run will output your service URL (e.g., `https://guardian-ai-agent-xxx.a.run.app`).

- Access the Interactive Dashboard: `https://guardian-ai-agent-xxx.a.run.app`
- API Health Check: `https://guardian-ai-agent-xxx.a.run.app/api/health`
- REST Audit Endpoint: `POST https://guardian-ai-agent-xxx.a.run.app/api/audit`

---

## 🔒 Security & Privacy Notice
GuardianAI operates purely in-memory for audit evaluations. Sensitive schema payloads are analyzed dynamically and are not stored in any external database without explicit configuration.
