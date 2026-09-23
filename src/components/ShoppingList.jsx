import { IconBadge } from '../icons/IconBadge'
import { ListIcon } from '../icons/ListIcon'
import { MeatIcon } from '../icons/MeatIcon'
import { MilkIcon } from '../icons/MilkIcon'
import { OilDropIcon } from '../icons/OilDropIcon'
import { WheatIcon } from '../icons/WheatIcon'
import { LeafIcon } from '../icons/LeafIcon'

const CATEGORY_META = {
  Proteine: { icon: <MeatIcon size={15} />, accent: 'jolly' },
  Carboidrati: { icon: <WheatIcon size={15} />, accent: 'free' },
  Latticini: { icon: <MilkIcon size={15} />, accent: 'info' },
  'Grassi e dispensa': { icon: <OilDropIcon size={15} />, accent: 'free' },
  'Verdure e frutta': { icon: <LeafIcon size={15} />, accent: 'plan' },
}

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
          {list.map((group) => {
            const meta = CATEGORY_META[group.category] ?? { icon: <ListIcon size={15} />, accent: 'plan' }
            return (
              <div key={group.category} className="shopping-list-group">
                <div className="shopping-list-group-header">
                  <IconBadge icon={meta.icon} accent={meta.accent} size={28} />
                  <h3>{group.category}</h3>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={`${item.name}-${item.unit}`}>
                      <span>{item.name}</span>
                      <span className="num">{formatQuantity(item.quantity, item.unit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
