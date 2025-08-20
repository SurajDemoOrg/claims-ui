# Claims UI - API Integration

This document describes the API integration for the Claims UI application.

## API Endpoints

The application now integrates with the following REST API endpoints:

### Get All Claims
- **Endpoint**: `GET /claims`
- **Description**: Retrieves a list of all claims
- **Response**: Array of claim objects

### Get Claim by ID
- **Endpoint**: `GET /claims/{id}`
- **Description**: Retrieves detailed information for a specific claim
- **Parameters**: 
  - `id` (string): The unique identifier of the claim
- **Response**: Single claim object

## API Response Structure

### Claim Object Structure
```json
{
  "id": "string",
  "claim_status": "PROCESSED" | "PENDING" | "ANOMALY_DETECTED",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "anomalies": ["string array of anomaly types"],
  "bill": {
    "amount": "string",
    "date": "string",
    "description": "string",
    "provider": "string",
    "receipt_attached": boolean
  },
  "bill_files": ["array of file names"],
  "claim": {
    "Participant Name (First, MI, Last)": "string",
    "Receipts.Date of service": "string",
    "Provider Name": "string",
    "Out-of-Pocket Cost (i.e. Patient Responsibility)": "string",
    "Description of service or item purchased": "string",
    "Service Dates (start and end dates)": "string",
    "Employee ID": "string",
    "Employer Name": "string",
    "Plan Type": "string",
    "Social Security Number": "string",
    "receipt_attached": boolean,
    // ... additional fields for Dependent Care FSA
  },
  "claim_file": "string"
}
```

## Configuration

### Environment Variables
The API base URL can be configured using environment variables:

- **Development**: The app uses a Vite proxy configuration to avoid CORS issues:
  ```
  VITE_API_BASE_URL=/api
  ```

- **Production**: Set the `VITE_API_BASE_URL` environment variable to your production API URL:
  ```
  VITE_API_BASE_URL=https://your-api-domain.com
  ```

### CORS Configuration
To avoid CORS issues during development, the application uses a Vite proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

This configuration:
- Proxies all `/api/*` requests to `http://localhost:5000`
- Removes the `/api` prefix when forwarding to the backend
- Avoids CORS issues by making requests through the same origin

**Alternative CORS Solutions:**
- Configure CORS headers on your backend API (see `CORS_BACKEND_CONFIG.md`)
- Use browser extensions for temporary development (see `CORS_TEMP_FIXES.md`)

### Fallback Behavior
The application includes fallback mechanisms for robustness:

1. **API Failure**: If the API call fails, the application falls back to localStorage data (for newly created claims) or mock data
2. **Missing Data**: The application gracefully handles missing fields in the API response by using fallback values

## Components Updated

### ViewPreviousClaimsPage
- Now fetches data from `GET /claims` endpoint
- Displays loading states with skeleton components
- Shows error messages with retry functionality
- Includes search and filtering capabilities
- Displays anomaly indicators

### ViewClaimDetailPage
- Now fetches data from `GET /claims/{id}` endpoint
- Handles both API structure and legacy structure
- Displays anomalies prominently
- Shows bill information from API response
- Includes proper error handling and retry mechanisms

### ViewPreviousClaims Component
- Added search functionality
- Added anomalies column
- Updated status handling for new API values

### ViewClaimDetail Component
- Enhanced to show anomalies
- Updated to handle new API data structure
- Added bill information display
- Improved status display

## New Features

### Search and Filtering
- Search claims by ID, Participant Name, or status
- Real-time filtering as you type
- Clear search functionality

### Anomaly Detection Display
- Visual indicators for claims with anomalies
- Detailed anomaly information in claim details
- Color-coded status badges

### Enhanced Error Handling
- Loading states with skeleton UI
- Error messages with retry buttons
- Graceful fallbacks to mock data

### Improved Data Display
- Bill information from API
- File attachments listing
- Better structured claim details

## Development

### Running with API
1. Ensure your API server is running on the configured port (default: 5000)
2. Start the development server: `npm run dev`
3. The application will attempt to connect to the API and fall back to mock data if unavailable

### Testing API Integration
You can test the API integration by:
1. Starting the API server
2. Opening the application
3. Navigating to "Previous Claims" to see the list
4. Clicking on a claim to view details

If the API is not available, you'll see mock data and error messages indicating the fallback behavior.
