import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'
import { UserProvider } from './context/UserContext'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Failed to find the root element. Ensure index.html has a <div id='root'></div>");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <UserProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </UserProvider>
    </React.StrictMode>,
  )
}
