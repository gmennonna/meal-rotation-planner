import { TargetIcon } from '../icons/TargetIcon'
import { MEAL_TYPES, MEAL_TYPE_LABELS, WEEKDAY_LABELS } from '../lib/storage'

function sumDayTotals(mealIds, mealsById) {
  const totals = { kcal: 0, protein_g: 0 }
  for (const mealId of Object.values(mealIds)) {
    const meal = mealId ? mealsById.get(mealId) : null
    if (!meal) continue
    totals.kcal += meal.kcal
    totals.protein_g += meal.protein_g
  }
  return totals
}

export function DaySummaryCard({ weekdayKey, isWeekday, dayPlan, jollyEntry, mealsById, weekendTargets }) {
  const isJolly = Boolean(jollyEntry)
  const totals = isJolly
    ? { kcal: jollyEntry.kcal_estimate, protein_g: jollyEntry.protein_estimate }
    : isWeekday
      ? sumDayTotals(dayPlan, mealsById)
      : weekendTargets

  const target = weekendTargets
  const kcalDelta = totals.kcal - target.kcal
  const accentClass = isJolly ? 'accent-jolly' : isWeekday ? 'accent-plan' : 'accent-free'

  return (
    <section className={`card day-summary ${accentClass}`}>
      <div className="day-summary-header">
        <TargetIcon size={18} />
        <h2>Oggi &middot; {WEEKDAY_LABELS[weekdayKey]}</h2>
      </div>

      <div className="day-summary-status">
        {isJolly ? `Jolly: ${jollyEntry.label}` : isWeekday ? 'Piano fisso' : 'Weekend libero'}
      </div>

      <div className="day-summary-stats">
        <div className="stat">
          <span className="stat-label">Kcal</span>
          <span className="stat-value num">{Math.round(totals.kcal)}</span>
          <span className="stat-target num">/ {target.kcal}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Proteine</span>
          <span className="stat-value num">{Math.round(totals.protein_g)}g</span>
          <span className="stat-target num">/ {target.protein_g}g</span>
        </div>
      </div>

      <div className="day-summary-delta num">
        {kcalDelta >= 0 ? '+' : ''}
        {Math.round(kcalDelta)} kcal vs target
      </div>

      {isWeekday && !isJolly && (
        <ul className="day-summary-meals">
          {MEAL_TYPES.map((mealType) => {
            const meal = dayPlan[mealType] ? mealsById.get(dayPlan[mealType]) : null
            return (
              <li key={mealType}>
                <span className="text-secondary">{MEAL_TYPE_LABELS[mealType]}</span>
                <span>{meal ? `${meal.variant_label} · ${meal.kcal} kcal` : '—'}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
