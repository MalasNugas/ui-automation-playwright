# UI Automation - Playwright (CCTV Malang)

## Description
This project is a complete UI Automation framework built for testing the CCTV Malang website (https://cctv.malangkota.go.id/). It validates the core functionalities, dashboard elements, and search performance of the application.

## Architecture & Design
The framework implements the **Page Object Model (POM)** pattern to enhance test maintenance and reduce code duplication.

### Key Design Decisions:
- **Page Object Model**: Separates page locators and methods from test logic for maximum maintainability.
- **No Hard-coded Waits**: Utilizes Playwright's auto-waiting mechanisms and `networkidle` state to resolve flakiness.
- **Parallel Execution**: Configured to run tests fully parallel with 4 workers to optimize CI time execution.
- **Semantic Selectors**: Uses flexible locators (by role, text, and flexible CSS) making tests resilient to minor UI changes.
- **Multi-layer Assertions**: Explicit checks on element visibility, text, state, and counts.
- **Structured Logging**: Built-in custom logger class for tracking framework execution accurately.

### Project Structure
```text
playwright-ui-automation/
├── tests/
│   ├── pages/            # Page Object Model classes (BasePage, DashboardPage)
│   ├── specs/            # Test scenario files
│   └── utils/            # Helper functions, config, logger, test-data
├── reports/              # Test execution reports (JUnit and HTML)
├── screenshots/          # Screenshots captured during failures
├── playwright.config.ts  # Playwright core configuration
├── .env.example          # Environment variables example
└── package.json          # Project dependencies and npm scripts
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` if required (default is ready out of the box).

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## How to Run Tests

- **Run all tests (headless)**: `npm test`
- **Run all tests (headed)**: `npm run test:headed`
- **Run in parallel (4 workers)**: `npm run test:parallel`
- **Run single thread**: `npm run test:single`
- **Debug tests**: `npm run test:debug`
- **View HTML Report**: `npm run report`

## Test Scenarios

| TC ID  | Description                                      | Type        | Expected Outcome                                      |
|--------|--------------------------------------------------|-------------|-------------------------------------------------------|
| TC-001 | Verify dashboard loads with all core elements    | Positive    | Page elements and >= 1 cameras are visible            |
| TC-002 | Search for camera successfully                   | Positive    | Valid search term returns > 0 search results          |
| TC-003 | Click camera to view details                     | Positive    | Clicking a camera redirects/opens details accurately  |
| TC-004 | Verify page title and navigation elements        | Positive    | Title and navigation menu links exist and are visible |
| TC-005 | Verify multiple cameras displayed with info      | Positive    | Camera cards display title, location, and status      |
| TC-006 | Search with invalid term shows no results        | Negative    | Returns 0 results or "no results" error message       |
| TC-007 | Clear search and return to full list             | Negative    | Clearing input resets dashboard to default list       |
| TC-008 | Perform multiple searches in sequence            | Edge Case   | Sequential searches are handled without crashing      |
| TC-101 | Dashboard loads within acceptable time           | Performance | Load time is under 5 seconds                          |
| TC-102 | Search response time acceptable                  | Performance | Search response is under 3 seconds                    |

## Technologies
- Playwright v1.40+
- TypeScript (ES2020)
- Node.js
- dotenv
