import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { logger } from './utils/logger'
import './globals.css'

// Log application startup
logger.info('Application starting', {
  component: 'main',
  action: 'app_start',
  metadata: {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    environment: import.meta.env.MODE
  }
});

// Global error handlers for unhandled errors
window.addEventListener('error', (event) => {
  logger.error('Unhandled JavaScript error', {
    component: 'window',
    action: 'unhandled_error',
    metadata: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
  }, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise rejection', {
    component: 'window',
    action: 'unhandled_promise_rejection',
    metadata: {
      reason: event.reason?.toString?.() || 'Unknown reason'
    }
  }, event.reason instanceof Error ? event.reason : new Error(event.reason));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  </React.StrictMode>,
)
