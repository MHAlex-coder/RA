# Azure + Debug setup

## 1) Koppla GitHub-repo till Azure Static Web Apps

1. Gå till Azure Portal -> Create Resource -> Static Web App.
2. Välj:
   - Subscription/Resource Group
   - Name: valfritt
   - Source: GitHub
   - Organization/Repository: `MHAlex-coder/RA`
   - Branch: `main`
3. Build details:
   - Build preset: Custom
   - App location: `/`
   - Api location: (tom)
   - Output location: `dist`
4. Slutför skapandet.

Azure skapar då secret `AZURE_STATIC_WEB_APPS_API_TOKEN` i GitHub, och workflow-filen i repot hanterar deploy automatiskt.

## 2) Verifiera deploy

- Gå till GitHub Actions i repot och kontrollera att workflow `Azure Static Web Apps CI/CD` blir grön.
- Öppna den URL som Azure skapar för appen.

## 3) Lokal debugging i VS Code

1. Kör `npm install`
2. Kör `npm start`
3. Starta debug-konfigurationen `Debug app in Edge` eller `Debug app in Chrome` i VS Code.

## 4) Debugging i Azure

- För frontend-fel: öppna den deployade sidan och använd browser devtools (Console/Network/Sources).
- För deploy-fel: läs GitHub Actions-loggarna i workflow-körningen.
- För konfig-fel: kontrollera `staticwebapp.config.json` och att output verkligen byggs till `dist`.
