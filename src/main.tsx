
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add a visible element to debug mounting issues
const addDebugElement = () => {
  if (process.env.NODE_ENV === 'development') {
    const debugElement = document.createElement('div');
    debugElement.style.position = 'fixed';
    debugElement.style.bottom = '30px';
    debugElement.style.right = '10px';
    debugElement.style.backgroundColor = 'rgba(255,0,0,0.7)';
    debugElement.style.color = '#fff';
    debugElement.style.padding = '4px 8px';
    debugElement.style.fontSize = '10px';
    debugElement.style.zIndex = '9999';
    debugElement.textContent = 'Main.tsx mounted';
    document.body.appendChild(debugElement);
  }
};

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

// Use a more robust root mounting approach
const mount = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error('Root element not found, waiting for DOM');
      setTimeout(mount, 100); // Retry after a delay
      return;
    }

    console.log("Mounting React application");
    addDebugElement(); // Add debug element
    
    // Force a style reset on the root element
    rootElement.style.cssText = "width: 100%; height: 100%; min-height: 100vh; background-color: hsl(var(--background, 180 25% 98%));";
    
    const root = ReactDOM.createRoot(rootElement);

    // Wrap in error boundary at the highest level
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error mounting React application:", error);
    // Display a useful error message
    document.body.innerHTML = '<div style="color:red;padding:20px;">Failed to load application. Please refresh the page.</div>';
  }
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '20px', color: 'red', textAlign: 'center'}}>
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please refresh the page.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{padding: '8px 16px', margin: '10px', cursor: 'pointer'}}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Ensure React is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
