import { FlameIcon } from '../icons/FlameIcon'
import { IconBadge } from '../icons/IconBadge'
import { TargetIcon } from '../icons/TargetIcon'
import { formatIngredientsList } from '../lib/nutrition-calc'
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

function progressPct(value, target) {
  if (!target) return 0
  return Math.max(0, Math.min(100, (value / target) * 100))
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
  const mode = isJolly ? 'jolly' : isWeekday ? 'plan' : 'free'

  return (
    <section className={`card tint-${mode} day-summary`}>
      <div className="day-summary-header">
        <IconBadge icon={<TargetIcon size={16} />} accent={mode} size={30} />
        <h2>Oggi &middot; {WEEKDAY_LABELS[weekdayKey]}</h2>
      </div>

      <div className="day-summary-status">
        {isJolly ? `Jolly: ${jollyEntry.label}` : isWeekday ? 'Piano fisso' : 'Weekend libero'}
      </div>

      <div className="day-summary-stats">
        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">
              <FlameIcon size={13} />
              Kcal
            </span>
            <span className="stat-target num">target {target.kcal}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value num">{Math.round(totals.kcal)}</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill progress-fill-${mode}`}
              style={{ width: `${progressPct(totals.kcal, target.kcal)}%` }}
            />
          </div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Proteine</span>
            <span className="stat-target num">target {target.protein_g}g</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value num">{Math.round(totals.protein_g)}g</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill progress-fill-${mode}`}
              style={{ width: `${progressPct(totals.protein_g, target.protein_g)}%` }}
            />
          </div>
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
                <div className="day-summary-meal-row">
                  <span className="text-secondary">{MEAL_TYPE_LABELS[mealType]}</span>
                  <span>{meal ? `${meal.variant_label} · ${meal.kcal} kcal` : '—'}</span>
                </div>
                {meal && <p className="day-summary-meal-ingredients">{formatIngredientsList(meal.ingredients)}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
