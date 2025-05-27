import { useState } from 'react';
import { useDebug } from './DebugContext';
export function DebugPanel() {
  const { debugConfig, toggleDebug } = useDebug();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (import.meta.env.PROD) return null; // Auto-hides in production

  return (
    <div style={{
      position: 'fixed',
      top: '5px',
      left: '5px',
      background: '#222',
      color: '#fff',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      zIndex: 9999,
      pointerEvents: 'auto',
      fontFamily: 'monospace',
      fontSize: '14px',
      maxHeight: isCollapsed ? '32px' : '400px',
      overflow: 'hidden',
      transition: 'max-height 0.2s ease',
      width: '250px'
    }}>
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCollapsed ? '0' : '10px',
          cursor: 'pointer'
        }} 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <strong style={{ color: '#4af' }}>DEBUG PANEL</strong>
        <span style={{ color: '#aaa' }}>{isCollapsed ? '▶' : '▼'}</span>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
          {Object.entries(debugConfig).map(([category, config]) => (
            <div key={category} style={{ marginBottom: '8px' }}>
              {/* Category Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => toggleCategory(category)}
              >
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => toggleDebug(category, 'enabled', e.target.checked)}
                    style={{ marginRight: '8px' }}
                    onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking checkbox
                  />
                  <span style={{ color: '#4af' }}>{category}</span>
                </label>
                <span style={{ color: '#aaa', marginLeft: '8px' }}>
                  {collapsedCategories[category] ? '▶' : '▼'}
                </span>
              </div>

              {/* Sub-items (collapsible) */}
              {!collapsedCategories[category] && (
                <div style={{ marginLeft: '20px', marginTop: '4px' }}>
                  {Object.entries(config).map(([key, value]) => (
                    key !== 'enabled' && (
                      <div key={key} style={{ marginBottom: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => toggleDebug(category, key, e.target.checked)}
                            style={{ marginRight: '8px' }}
                          />
                          <span style={{ color: '#fff' }}>{key}</span>
                        </label>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}