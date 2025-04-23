
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug log
console.log("[DEBUG] In main.tsx, React is:", React);

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

// Create a root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  // Using Fragment instead of StrictMode to avoid potential issues
  <React.Fragment>
    <App />
  </React.Fragment>
);
