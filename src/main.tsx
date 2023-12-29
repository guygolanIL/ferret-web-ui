import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div>{JSON.stringify(import.meta.env)}</div>
    <App />
  </React.StrictMode>,
)
