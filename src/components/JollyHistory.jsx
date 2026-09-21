import { CalendarIcon } from '../icons/CalendarIcon'
import { WEEKDAY_LABELS } from '../lib/storage'

export function JollyHistory({ entries }) {
  return (
    <section className="card jolly-history">
      <div className="jolly-history-header">
        <CalendarIcon size={18} />
        <h2>Storico jolly (ultimi 7 giorni)</h2>
      </div>
      <p className="jolly-history-count num">{entries.length}</p>
      {entries.length === 0 ? (
        <p className="text-secondary">Nessun giorno jolly negli ultimi 7 giorni.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.date}>
              <span>
                {WEEKDAY_LABELS[entry.weekday]} · {entry.date}
              </span>
              <span className="text-secondary">{entry.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
