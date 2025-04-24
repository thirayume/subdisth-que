
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug log
console.log("[DEBUG] In main.tsx, React is:", React);
console.log("[DEBUG] ReactDOM:", ReactDOM);

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

// Ensure React and ReactDOM are not null before rendering
if (!React) {
  console.error("[ERROR] React is not defined in main.tsx!");
}

if (!ReactDOM) {
  console.error("[ERROR] ReactDOM is not defined in main.tsx!");
}

// Use createRoot API
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

// This is the crucial part - we ensure we're using React 18's createRoot API correctly
const root = ReactDOM.createRoot(rootElement);

// Log before render
console.log("[DEBUG] About to render App component");

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("[DEBUG] After rendering App component");
