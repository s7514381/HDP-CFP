# AGENTS

## Mandatory Post-Change Validation

- After every code change, you must validate the result once in the web UI (browser) before reporting completion.
- Validation must include the exact page/feature that was modified and a real interaction path (not only static inspection).
- Report validation outcome in your response, including:
  - Tested page/feature
  - Action performed
  - Actual result
- If browser validation cannot be completed (for example, service not running), state the blocker clearly and provide the exact next step needed to finish validation.

## Frontend / Backend Bring-Up Workflow

- Frontend workspace: `c:\Users\s7514\source\repos\HDP-CFP`
- Frontend app: `apps/CFP`
- Frontend dev command: `npm run dev -w cfp`
- Frontend URL: `http://localhost:3001`
- Backend workspace: `c:\Users\s7514\source\repos\HOP-CFP-Backend\HOP-CFP-Backend`
- Backend project file: `HOP-CFP-Backend.csproj`
- Backend launch profile: `https`
- Backend dev command: `dotnet run --project HOP-CFP-Backend.csproj --launch-profile https`
- Backend URL: `https://localhost:7007`

- Before changing BuyerCompare / SellerCompare / Material flows, confirm both services are up.
- If the frontend uses API calls, verify the backend endpoint is reachable first; do not assume the service is running.
- When a task asks to "build frontend and backend", start the frontend dev server and the backend API before making code changes whenever the workspace provides both project paths.
- If the backend project is in a separate workspace, use the backend index file in `.clinerules/BACKEND_PROJECT_INDEX.md` or the backend project root `PROJECT_INDEX.md` to locate the service and startup details.
- For any startup, login, or API verification task, read `.clinerules/STARTUP_LOGIN_PROMPT.md` first and follow it as the default prompt for this repository.

## Scope

- This rule applies to all future implementation tasks in this repository.
