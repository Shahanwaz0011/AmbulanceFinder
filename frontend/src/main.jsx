import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './storeing-data/auth.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <React.StrictMode>
      <Toaster
        toastOptions={{
          style: {
            backdropFilter: "blur(20px)",
            border: '1px solid rgba(255, 255, 255, 0.116)',
            background: '#00000039',
            color: "white",
            fontFamily: "Franklin Gothic Medium",
            zIndex: "101"
          },
        }}
      />
      <App />
    </React.StrictMode>
  </AuthProvider>
)
