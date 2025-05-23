// main.jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { DebugProvider } from './debug/DebugContext';
import { DebugPanel } from './debug/DebugPanel.jsx';

createRoot(document.getElementById('root')).render(
  <DebugProvider>
    <DebugPanel />
    <App />
  </DebugProvider>
);
