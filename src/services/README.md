# Google Sheets API Integration

This module provides Google Sheets API v4 integration for the Report Generator Chrome Extension, following TDD development principles and clean architecture.

## Features

### ✅ Completed Features

1. **OAuth 2.0 Authentication**

   - Chrome Identity API integration
   - Automatic token management
   - Authentication state checking

2. **Google Sheets API v4 Client**

   - Read spreadsheet metadata
   - Read range data from sheets
   - Append new data to sheets
   - Error handling and validation

3. **Data Integrity Protection**

   - Prevents overwriting existing data
   - Duplicate detection based on date/URL
   - Conflict resolution reporting

4. **Simple Service Architecture**
   - Factory pattern for service management
   - Minimal dependencies
   - Type-safe interfaces

## Quick Start

### 1. Setup Google OAuth

Update your `manifest.json` with your Google Client ID:

```json
{
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["https://www.googleapis.com/auth/spreadsheets"]
  }
}
```

### 2. Basic Usage

```typescript
import { GoogleSheetsServiceFactory } from "./services";

// Simple authentication check
const isReady = await GoogleSheetsServiceFactory.isReady();

// Complete workflow
import { GoogleSheetsDemo } from "./services/demo-usage";

await GoogleSheetsDemo.completeWorkflow("your-spreadsheet-id", {
  url: "https://example.com",
  title: "My Report",
  content: "Generated content...",
});
```

### 3. Manual Service Usage

```typescript
// Get services
const authService = GoogleSheetsServiceFactory.getAuthService();
const integrationService = GoogleSheetsServiceFactory.getIntegrationService();

// Authenticate
const authResult = await authService.getAccessToken();
if (!authResult.success) {
  console.error("Auth failed:", authResult.error);
  return;
}

// Read existing data
const readResult = await integrationService.readExistingReport(
  "spreadsheet-id",
  "Sheet1!A1:D100"
);

// Add new data
const reportData = {
  date: "2024-01-01",
  url: "https://example.com",
  title: "Report Title",
  content: "Report content...",
};

const appendResult = await integrationService.appendNewReport(
  "spreadsheet-id",
  "Sheet1!A:D",
  reportData
);
```

### Supported Operations

- ✅ **Read**: Get existing report data (read-only)
- ✅ **Append**: Add new reports to new rows
- ✅ **Validate**: Check spreadsheet access permissions
- ✅ **Integrity**: Prevent data conflicts and duplicates
- ❌ **Update**: Modifying existing rows (intentionally not supported)
- ❌ **Delete**: Removing data (intentionally not supported)
