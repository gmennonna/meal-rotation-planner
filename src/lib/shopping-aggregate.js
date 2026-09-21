import ingredientsRef from '../data/ingredients-ref.json'
import { WEEKDAYS } from './storage'

const CATEGORY_LABELS = {
  proteine: 'Proteine',
  carboidrati: 'Carboidrati',
  latticini: 'Latticini',
  grassi_dispensa: 'Grassi e dispensa',
  verdure: 'Verdure e frutta',
  altro: 'Altro',
}

const refByName = new Map(ingredientsRef.map((ref) => [ref.name, ref]))

export function generateShoppingList(weekdayRotation, meals) {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]))
  const totals = new Map() // key: `${name}|${unit}` -> { name, unit, quantity, category }

  for (const weekday of WEEKDAYS) {
    const dayPlan = weekdayRotation[weekday]
    if (!dayPlan) continue
    for (const mealId of Object.values(dayPlan)) {
      if (!mealId) continue
      const meal = mealsById.get(mealId)
      if (!meal) continue
      for (const ingredient of meal.ingredients) {
        const key = `${ingredient.name}|${ingredient.unit}`
        const ref = refByName.get(ingredient.name)
        const category = ref?.category ?? 'altro'
        const existing = totals.get(key)
        if (existing) {
          existing.quantity += ingredient.quantity
        } else {
          totals.set(key, {
            name: ingredient.name,
            unit: ingredient.unit,
            quantity: ingredient.quantity,
            category,
          })
        }
      }
    }
  }

  const grouped = new Map()
  for (const item of totals.values()) {
    const label = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.altro
    if (!grouped.has(label)) grouped.set(label, [])
    grouped.get(label).push(item)
  }

  const categoryOrder = ['Proteine', 'Carboidrati', 'Latticini', 'Grassi e dispensa', 'Verdure e frutta', 'Altro']
  return categoryOrder
    .filter((label) => grouped.has(label))
    .map((label) => ({
      category: label,
      items: grouped.get(label).sort((a, b) => a.name.localeCompare(b.name, 'it')),
    }))
}
