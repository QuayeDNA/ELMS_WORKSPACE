/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

declare global {
  interface Window {
    ipcRenderer: {
      on(channel: string, listener: (event: unknown, ...args: any[]) => void): void
      send(channel: string, ...args: any[]): void
      invoke<T = any>(channel: string, ...args: any[]): Promise<T>
      removeAllListeners(channel: string): void
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
