import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios';

// 1. Set the Base URL
if (import.meta.env.MODE === 'production') {
    // PASTE YOUR RENDER URL HERE (No trailing slash)
    axios.defaults.baseURL = "https://chatpulse-server-oxb9.onrender.com";
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)