import { SwapIcon } from '../icons/SwapIcon'
import { XIcon } from '../icons/XIcon'
import { formatIngredientsList } from '../lib/nutrition-calc'
import { MEAL_TYPES, MEAL_TYPE_LABELS, WEEKDAYS, WEEKDAY_LABELS } from '../lib/storage'

const WEEKEND_DAYS = ['sab', 'dom']

export function WeekView({
  meals,
  weekdayRotation,
  onChangeVariant,
  dayJollyByWeekday,
  weekendTargets,
  onOpenJolly,
  onClearJolly,
  todayWeekday,
}) {
  const mealsByType = new Map(MEAL_TYPES.map((type) => [type, meals.filter((m) => m.meal_type === type && m.active)]))
  const mealsById = new Map(meals.map((m) => [m.id, m]))

  function optionsFor(mealType, currentId) {
    const options = mealsByType.get(mealType)
    const current = currentId ? mealsById.get(currentId) : null
    if (current && !current.active) return [...options, current]
    return options
  }

  return (
    <section className="card week-view">
      <h2>Settimana</h2>
      <div className="week-grid">
        {WEEKDAYS.map((weekday) => {
          const jollyEntry = dayJollyByWeekday.get(weekday)
          return (
            <div
              key={weekday}
              className={`week-col accent-plan ${jollyEntry ? 'is-jolly' : ''} ${weekday === todayWeekday ? 'is-today' : ''}`}
            >
              <div className="week-col-header">
                <span className="week-col-tag">Piano fisso</span>
                <h3>{WEEKDAY_LABELS[weekday]}</h3>
              </div>

              {jollyEntry ? (
                <div className="week-col-jolly">
                  <p>Jolly: {jollyEntry.label}</p>
                  <p className="num text-secondary">
                    {jollyEntry.kcal_estimate} kcal · {jollyEntry.protein_estimate}g proteine
                  </p>
                  <button className="btn btn-ghost btn-small" onClick={() => onClearJolly(weekday)}>
                    <XIcon size={14} />
                    Rimuovi jolly
                  </button>
                </div>
              ) : (
                <>
                  <ul className="week-col-meals">
                    {MEAL_TYPES.map((mealType) => {
                      const selectedId = weekdayRotation[weekday]?.[mealType]
                      const selectedMeal = selectedId ? mealsById.get(selectedId) : null
                      return (
                        <li key={mealType}>
                          <span className="text-secondary">{MEAL_TYPE_LABELS[mealType]}</span>
                          <select
                            value={selectedId ?? ''}
                            onChange={(e) => onChangeVariant(weekday, mealType, e.target.value)}
                          >
                            {optionsFor(mealType, selectedId).map((meal) => (
                              <option key={meal.id} value={meal.id}>
                                {meal.variant_label} · {meal.kcal} kcal
                                {!meal.active ? ' (disattivata)' : ''}
                              </option>
                            ))}
                          </select>
                          {selectedMeal && (
                            <p className="week-col-ingredients">{formatIngredientsList(selectedMeal.ingredients)}</p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  <button className="btn btn-ghost btn-small" onClick={() => onOpenJolly(weekday)}>
                    <SwapIcon size={14} />
                    Sostituisci con jolly
                  </button>
                </>
              )}
            </div>
          )
        })}

        {WEEKEND_DAYS.map((weekday) => (
          <div key={weekday} className={`week-col accent-free ${weekday === todayWeekday ? 'is-today' : ''}`}>
            <div className="week-col-header">
              <span className="week-col-tag">Libero</span>
              <h3>{WEEKDAY_LABELS[weekday]}</h3>
            </div>
            <div className="week-col-target">
              <p className="text-secondary">Target di riferimento</p>
              <p className="num">{weekendTargets.kcal} kcal</p>
              <p className="num">{weekendTargets.protein_g} g proteine</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
