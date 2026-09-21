import { ListIcon } from '../icons/ListIcon'

function formatQuantity(quantity, unit) {
  const rounded = Math.round(quantity * 10) / 10
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} ${unit}`
}

export function ShoppingList({ list, onGenerate }) {
  return (
    <section className="card shopping-list">
      <div className="shopping-list-header">
        <div className="shopping-list-title">
          <ListIcon size={18} />
          <h2>Lista della spesa</h2>
        </div>
        <button className="btn btn-plan" onClick={onGenerate}>
          Genera lista settimana
        </button>
      </div>

      {list === null && (
        <p className="text-secondary">
          Aggrega gli ingredienti della rotazione feriale (Lun&ndash;Ven) attualmente attiva.
        </p>
      )}

      {list !== null && list.length === 0 && <p className="text-secondary">Nessun ingrediente nella rotazione corrente.</p>}

      {list !== null && list.length > 0 && (
        <div className="shopping-list-groups">
          {list.map((group) => (
            <div key={group.category} className="shopping-list-group">
              <h3>{group.category}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={`${item.name}-${item.unit}`}>
                    <span>{item.name}</span>
                    <span className="num">{formatQuantity(item.quantity, item.unit)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
