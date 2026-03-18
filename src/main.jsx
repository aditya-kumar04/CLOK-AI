import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/apiTest.js'  // Load API test function
import App from './App.jsx'

// Expose environment variables to window for console testing
window.VITE_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
window.VITE_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
