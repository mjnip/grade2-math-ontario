# Deploying Math Adventures to Azure

This app runs on **Azure Static Web Apps (SWA)**. SWA serves the static site and
runs the bundled **Azure Functions** API (in [`/api`](../api)) that provides:

- **Score history** — persisted per student in **Azure Table Storage**
  (`/api/scores`)
- **Dynamic question generation** — fresh practice questions from **Azure OpenAI**
  (`/api/questions`)

Everything degrades gracefully: if the backend isn't configured, the site still
works, scores are kept in the browser, and **More questions** uses the built-in
offline generator.

---

## Architecture

```
Browser (static site)
   │  fetch /api/scores      → Azure Functions → Azure Table Storage
   │  fetch /api/questions   → Azure Functions → Azure OpenAI
   ▼
Azure Static Web Apps (hosts site + managed Functions)
```

Student identity is lightweight: a **name** plus an optional **class code**
entered in the app (no passwords, no PII beyond a chosen name). The API keys
score rows by `classCode::name`.

---

## Prerequisites

- An Azure subscription
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- Access to **Azure OpenAI** (request access if your subscription doesn't have it),
  or an existing Azure OpenAI resource + chat deployment (e.g. `gpt-4o-mini`)

---

## 1. Provision infrastructure (Bicep)

The [`infra/main.bicep`](../infra/main.bicep) template creates the Static Web App,
a Storage account (for score history), and—optionally—an Azure OpenAI account
with a chat model deployment.

```bash
az group create --name math-adventures-rg --location eastus2

# Option A: also provision Azure OpenAI in the same template
az deployment group create \
  --resource-group math-adventures-rg \
  --template-file infra/main.bicep \
  --parameters staticWebAppName=math-adventures-g2 \
               deployOpenAi=true \
               openAiDeploymentName=gpt-4o-mini

# Option B: use an existing Azure OpenAI resource (pass its endpoint + key)
az deployment group create \
  --resource-group math-adventures-rg \
  --template-file infra/main.bicep \
  --parameters staticWebAppName=math-adventures-g2 \
               openAiEndpoint=https://YOUR-RESOURCE.openai.azure.com \
               openAiApiKey=YOUR_KEY \
               openAiDeploymentName=gpt-4o-mini
```

The deployment wires the storage connection string and Azure OpenAI settings into
the Static Web App's application settings automatically.

> Model availability varies by region. Pick a `location` that offers your chosen
> model, or deploy OpenAI separately and pass its endpoint/key.

---

## 2. Connect the GitHub repo and deploy

The workflow [`.github/workflows/azure-static-web-apps.yml`](../.github/workflows/azure-static-web-apps.yml)
builds and deploys on every push to `main` and on pull requests.

1. Get the Static Web App **deployment token**:

   ```bash
   az staticwebapp secrets list \
     --name math-adventures-g2 \
     --query "properties.apiKey" -o tsv
   ```

2. In the GitHub repo, add it as a secret named
   **`AZURE_STATIC_WEB_APPS_API_TOKEN`**
   (*Settings → Secrets and variables → Actions → New repository secret*).

3. Push to `main` (or run the workflow). SWA builds the site from the repo root
   and the API from `/api`.

---

## 3. Application settings (the API needs these)

If you didn't set them via Bicep, configure these on the Static Web App
(*Configuration → Application settings*, or via CLI). They are read by the
Functions in [`/api/src/functions`](../api/src/functions):

| Setting | Purpose | Example |
| --- | --- | --- |
| `SCORES_TABLE_CONNECTION` | Storage connection string for score history | `DefaultEndpointsProtocol=https;AccountName=…` |
| `SCORES_TABLE_NAME` | Table name (created automatically) | `scores` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `https://my-aoai.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key | `********` |
| `AZURE_OPENAI_DEPLOYMENT` | Chat model deployment name | `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | REST API version | `2024-10-21` |

```bash
az staticwebapp appsettings set --name math-adventures-g2 --setting-names \
  AZURE_OPENAI_ENDPOINT=https://my-aoai.openai.azure.com \
  AZURE_OPENAI_API_KEY=******** \
  AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini \
  AZURE_OPENAI_API_VERSION=2024-10-21
```

If `AZURE_OPENAI_*` are absent, `/api/questions` returns `501` and the client uses
its offline generator. If `SCORES_TABLE_CONNECTION` is absent, `/api/scores`
returns an empty history and the app keeps scores locally.

---

## Local development

```bash
# Static site
python -m http.server 8000        # http://localhost:8000

# API (Azure Functions) — requires Azure Functions Core Tools v4
npm install -g azure-functions-core-tools@4 --unsafe-perm true
cd api
npm install
cp local.settings.json.example local.settings.json   # fill in values
func start                        # http://localhost:7071/api
```

To point the site at the local API, set the API base before the app scripts load
(e.g. add to `index.html` for local testing only):

```html
<script>window.APP_CONFIG = { apiBase: "http://localhost:7071/api" };</script>
```

For local Table Storage you can use
[Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite)
and set `SCORES_TABLE_CONNECTION=UseDevelopmentStorage=true`.

---

## Cost & safety notes

- **Static Web Apps Free tier** is enough for the site and managed Functions.
- **Azure OpenAI** is billed per token; question generation is short and capped
  (≤10 questions per request, ~1.2k output tokens). Set quotas/budgets as needed.
- The questions Function constrains output to the Grade 2 curriculum and validates
  every generated item before returning it to the app.
