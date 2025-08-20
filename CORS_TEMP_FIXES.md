# Temporary CORS Solutions for Development

## Browser Extensions (Development Only)
**⚠️ WARNING: Only use for development, never in production!**

### Chrome Extensions:
1. "CORS Unblock" - Chrome Web Store
2. "Disable CORS" - Chrome Web Store

### Firefox Extensions:
1. "CORS Everywhere" - Firefox Add-ons

## Chrome with Disabled Security (Development Only)
Start Chrome with disabled security (Windows):
```cmd
chrome.exe --user-data-dir="C:/Chrome dev" --disable-web-security --disable-features=VizDisplayCompositor
```

## Alternative: Use a Different Port for API
If your API supports it, try running it on port 3000 (same as frontend) or configure it to accept requests from all origins during development.

## Recommended Approach
The **Vite proxy configuration** (Solution 1) is the recommended approach as it:
- Doesn't require backend changes
- Works seamlessly in development
- Doesn't compromise security
- Matches production behavior when properly configured
