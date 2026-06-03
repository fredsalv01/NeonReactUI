import { useState, useEffect } from 'react'
import { AddEquipoModal } from '../components/dashboard/modals/AddEquipoModal'

export const ModalDebugPage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [debugLog, setDebugLog] = useState([])

  useEffect(() => {
    const addLog = (msg) => {
      setDebugLog(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    // Monitor render count
    addLog('Component Mounted')

    // Monitor focus changes
    const handleFocus = (e) => {
      if (isOpen) {
        addLog(`Focus: ${e.target.tagName} ${e.target.name || e.target.id || ''}`)
      }
    }

    document.addEventListener('focusin', handleFocus)

    // Monitor input changes
    const handleInput = (e) => {
      if (e.target.name) {
        addLog(`Input changed: ${e.target.name} = "${e.target.value}"`)
      }
    }

    document.addEventListener('input', handleInput)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('input', handleInput)
    }
  }, [isOpen])

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>Modal Input Focus Debugger</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Controls */}
        <div>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#00C9A7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            📋 Open Modal
          </button>
        </div>

        {/* Status */}
        <div style={{
          padding: '12px',
          backgroundColor: isOpen ? '#c8e6c9' : '#ffcccc',
          border: `2px solid ${isOpen ? '#4caf50' : '#f44336'}`,
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Modal Status: <strong>{isOpen ? '🟢 OPEN' : '🔴 CLOSED'}</strong>
        </div>
      </div>

      {/* Debug Log */}
      <div style={{
        backgroundColor: '#1e1e1e',
        color: '#00ff00',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '30px',
        border: '1px solid #333'
      }}>
        <div style={{ marginBottom: '10px', color: '#666' }}>
          📊 Event Log (last 10 events):
        </div>
        {debugLog.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '30px',
        borderLeft: '4px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📝 Test Instructions:</h3>
        <ol style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Click "Open Modal"</li>
          <li>Focus on the "Nombre del Equipo" input field</li>
          <li>Type something slowly (e.g., "L-A-P-T-O-P") and watch the event log</li>
          <li>Check if focus is being lost between keystrokes</li>
          <li>Open DevTools (F12) → Console to see additional debug info</li>
        </ol>
      </div>

      {/* The Modal */}
      <AddEquipoModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}
