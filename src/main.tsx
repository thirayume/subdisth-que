
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Reference React explicitly to ensure proper initialization
console.log("React version:", React.version);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

// Remove StrictMode from here (it's now in App.tsx)
root.render(<App />);
