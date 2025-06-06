// main.jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { DebugProvider } from './subsystems/debug/DebugContext';
import { DebugPanel } from './subsystems/debug/DebugPanel.jsx';

createRoot(document.getElementById('root')).render(
  <DebugProvider>
    <DebugPanel />
    <App />
  </DebugProvider>
);
