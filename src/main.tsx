
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker for offline support with improved error handling
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        console.log('Attempting to register service worker...');
        // Only try to register in production to avoid development conflicts
        if (process.env.NODE_ENV === 'production') {
          const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
            updateViaCache: 'none' // Prevent browser cache from interfering
          });
          console.log('Service Worker registered with scope:', registration.scope);
        } else {
          console.log('Service Worker registration skipped in development mode');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Don't block the app from loading if service worker fails
      }
    });
  }
};

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
    
    // Force a style reset on the root element
    rootElement.style.cssText = "width: 100%; height: 100%; min-height: 100vh; background-color: hsl(var(--background, 180 25% 98%));";
    
    const root = ReactDOM.createRoot(rootElement);

    // Render without error boundary at root to avoid React context issues
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Register service worker after React has mounted
    setTimeout(() => registerServiceWorker(), 1000);
    
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

// Import the OfflineIndicator component
import OfflineIndicator from '@/components/ui/OfflineIndicator';

// Ensure React is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
