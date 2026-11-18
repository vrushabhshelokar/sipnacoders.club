import React, { startTransition } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/site.css'
import './site/AuditFixes.css'

// startTransition: React draws the first page in small pieces (a few milliseconds each) instead of one long block, so a phone
// stays responsive while the page appears. The page itself looks and works the same.
const root = ReactDOM.createRoot(document.getElementById('root'))
startTransition(() => {
  root.render(
    <React.StrictMode>
      <div className="dark">
        <App />
      </div>
    </React.StrictMode>
  )
})
