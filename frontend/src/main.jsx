import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌶️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            Spice Route
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '360px', margin: '0 0 16px 0' }}>
            We encountered a temporary loading issue. Click below to reload cleanly.
          </p>
          {this.state.error && (
            <div style={{
              margin: '0 0 20px 0',
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECDD3',
              borderRadius: '12px',
              color: '#9F1239',
              fontSize: '11px',
              fontFamily: 'monospace',
              maxWidth: '90%',
              wordBreak: 'break-word',
              textAlign: 'left'
            }}>
              <b>Error:</b> {this.state.error?.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              backgroundColor: '#E11D48',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
            }}
          >
            Reload Website
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register PWA Service Worker for Home Screen Installability and Caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
      },
      (error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

