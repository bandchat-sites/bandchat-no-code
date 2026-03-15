import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SiteConfigProvider } from './context/SiteConfigContext';
import App from './App';
import '../styles/global.css';
import '../styles/layout.css';
import '../styles/hero.css';
import '../styles/animations.css';
import '../styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteConfigProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SiteConfigProvider>
  </React.StrictMode>
);
