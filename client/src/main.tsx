import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'

if (!import.meta.env.VITE_SOCKET_URL) {
  console.warn('⚠️ WARNING: VITE_SOCKET_URL is not set. Real-time low-stock alerts may not work.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
