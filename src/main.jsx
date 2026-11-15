import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Preloader from './site/Preloader.jsx'
import './index.css'
import './styles/site.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div className="dark">
        <Preloader>
          <App />
        </Preloader>
      </div>
    </React.StrictMode>
)
