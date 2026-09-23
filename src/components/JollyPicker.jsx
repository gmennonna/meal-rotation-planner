import { useState } from 'react'
import { XIcon } from '../icons/XIcon'
import { JOLLY_LABELS } from '../lib/storage'

const LABEL_TEXT = {
  pizza: 'Pizza',
  sushi: 'Sushi',
  ristorante: 'Ristorante',
  altro: 'Altro',
}

export function JollyPicker({ weekdayLabel, onConfirm, onCancel }) {
  const [label, setLabel] = useState('pizza')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')

  const canConfirm = kcal !== '' && !Number.isNaN(Number(kcal))

  function handleConfirm() {
    onConfirm({
      label,
      kcal_estimate: Number(kcal) || 0,
      protein_estimate: Number(protein) || 0,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal card tint-jolly" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Jolly &middot; {weekdayLabel}</h3>
          <button className="icon-button" onClick={onCancel} aria-label="Chiudi">
            <XIcon size={18} />
          </button>
        </div>

        <label className="field">
          <span>Tipo</span>
          <select value={label} onChange={(e) => setLabel(e.target.value)}>
            {JOLLY_LABELS.map((value) => (
              <option key={value} value={value}>
                {LABEL_TEXT[value]}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>Kcal stimate</span>
            <input type="number" min="0" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="es. 900" />
          </label>
          <label className="field">
            <span>Proteine stimate (g)</span>
            <input type="number" min="0" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="es. 35" />
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Annulla
          </button>
          <button className="btn btn-jolly" disabled={!canConfirm} onClick={handleConfirm}>
            Sostituisci con jolly
          </button>
        </div>
      </div>
    </div>
  )
}
