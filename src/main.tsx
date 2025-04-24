
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
