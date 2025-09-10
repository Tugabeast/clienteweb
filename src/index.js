import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { AuthProvider } from './context/AuthContext'; // ✅ importa o AuthProvider
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Envolve tudo com o AuthProvider */}
      <ProSidebarProvider>
        <App />
      </ProSidebarProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
