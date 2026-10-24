import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CanvasProvider } from './components/CanvasProtocol.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CanvasProvider><App /></CanvasProvider>
  </React.StrictMode>
);
