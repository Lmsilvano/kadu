import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ModalProvider } from './context/ModalContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ModalProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ModalProvider>
    </React.StrictMode>,
)
