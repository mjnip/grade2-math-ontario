// =========================================================
// main.bicep — infrastructure for Math Adventures on Azure
//   - Azure Static Web App (hosts the static site + managed Functions API)
//   - Storage account + Table service (student score history)
//   - (optional) Azure OpenAI account + chat model deployment
// =========================================================

@description('Azure region for the storage account and (optional) OpenAI. Use a region that supports your chosen OpenAI model.')
param location string = resourceGroup().location

@description('Globally-unique name for the Static Web App.')
param staticWebAppName string

@description('Static Web Apps SKU. Free works for managed Functions; Standard adds custom auth, SLA, and more.')
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSku string = 'Free'

@description('Region for the Static Web App control plane (limited set of regions).')
@allowed([
  'eastus2'
  'centralus'
  'westus2'
  'westeurope'
  'eastasia'
])
param staticWebAppLocation string = 'eastus2'

@description('Storage account name (3-24 lowercase letters/numbers). Defaults to a unique name.')
param storageAccountName string = toLower('g2math${uniqueString(resourceGroup().id)}')

// ---- Azure OpenAI wiring (set these to enable dynamic question generation) ----
@description('Set true to provision an Azure OpenAI account and model deployment in this template.')
param deployOpenAi bool = false

@description('Name for the Azure OpenAI account (used when deployOpenAi = true).')
param openAiName string = toLower('g2math-aoai-${uniqueString(resourceGroup().id)}')

@description('Model deployment (chat) name used by the API.')
param openAiDeploymentName string = 'gpt-4o-mini'

@description('Model name to deploy when deployOpenAi = true.')
param openAiModelName string = 'gpt-4o-mini'

@description('Model version to deploy when deployOpenAi = true.')
param openAiModelVersion string = '2024-07-18'

@description('Tokens-per-minute capacity (in thousands) for the deployment.')
param openAiCapacity int = 10

@description('Existing Azure OpenAI endpoint. Leave blank to use the one provisioned here.')
param openAiEndpoint string = ''

@description('Azure OpenAI API key. Provide an existing key, or leave blank and set it after deployment.')
@secure()
param openAiApiKey string = ''

@description('Azure OpenAI REST API version.')
param openAiApiVersion string = '2024-10-21'

// ---------------------------------------------------------
// Storage account (Functions runtime + Table for scores)
// ---------------------------------------------------------
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

// ---------------------------------------------------------
// Optional Azure OpenAI account + chat deployment
// ---------------------------------------------------------
resource openAi 'Microsoft.CognitiveServices/accounts@2023-05-01' = if (deployOpenAi) {
  name: openAiName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: openAiName
    publicNetworkAccess: 'Enabled'
  }
}

resource openAiDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = if (deployOpenAi) {
  parent: openAi
  name: openAiDeploymentName
  sku: {
    name: 'Standard'
    capacity: openAiCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: openAiModelName
      version: openAiModelVersion
    }
  }
}

// Resolve the endpoint/key the API should use.
var resolvedOpenAiEndpoint = !empty(openAiEndpoint) ? openAiEndpoint : (deployOpenAi ? openAi.properties.endpoint : '')
var resolvedOpenAiKey = !empty(openAiApiKey) ? openAiApiKey : (deployOpenAi ? openAi.listKeys().key1 : '')

// ---------------------------------------------------------
// Static Web App
// ---------------------------------------------------------
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: staticWebAppLocation
  sku: {
    name: staticWebAppSku
    tier: staticWebAppSku
  }
  properties: {
    // Deployments are driven by the GitHub Actions workflow using the deployment token.
    allowConfigFileUpdates: true
  }
}

// App settings consumed by the managed Functions API.
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    SCORES_TABLE_CONNECTION: storageConnectionString
    SCORES_TABLE_NAME: 'scores'
    AZURE_OPENAI_ENDPOINT: resolvedOpenAiEndpoint
    AZURE_OPENAI_API_KEY: resolvedOpenAiKey
    AZURE_OPENAI_DEPLOYMENT: openAiDeploymentName
    AZURE_OPENAI_API_VERSION: openAiApiVersion
  }
}

// ---------------------------------------------------------
// Outputs
// ---------------------------------------------------------
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output storageAccountNameOut string = storage.name
output openAiEndpointOut string = resolvedOpenAiEndpoint
