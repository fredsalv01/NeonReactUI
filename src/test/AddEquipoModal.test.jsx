/**
 * Test file for AddEquipoModal
 * Diagnoses input focus loss issue
 */

import React, { useState } from 'react'
import { AddEquipoModal } from '../components/dashboard/modals/AddEquipoModal'

// Standalone test component
export const AddEquipoModalTest = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>AddEquipoModal Focus Test</h1>

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#00C9A7',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Open Modal
      </button>

      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '20px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Open Modal" button</li>
          <li>Try typing in the "Nombre del Equipo" input field</li>
          <li>Check if the input loses focus after each keystroke</li>
          <li>Open browser DevTools (F12) and check the Console tab</li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#ffe6e6',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        borderLeft: '4px solid #ff0000'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Debug Info:</h4>
        <p style={{ margin: '5px 0' }}>Modal Open: <strong>{isOpen.toString()}</strong></p>
        <p style={{ margin: '5px 0' }}>Active Element: <strong id="active-element">Click modal input to see</strong></p>
      </div>

      <AddEquipoModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <script>{`
        // Track active element changes
        document.addEventListener('focusin', (e) => {
          const el = document.getElementById('active-element')
          if (el) {
            const tagName = e.target.tagName
            const id = e.target.id || 'no-id'
            const name = e.target.name || 'no-name'
            el.textContent = \`\${tagName}#\${id}[\${name}]\`
            console.log('Focus event:', { tagName, id, name, target: e.target })
          }
        })
      `}</script>
    </div>
  )
}

export default AddEquipoModalTest
