import ingredientsRef from '../data/ingredients-ref.json'

const refByName = new Map(ingredientsRef.map((ref) => [ref.name, ref]))

export function findIngredientRef(name) {
  return refByName.get(name) ?? null
}

export function calcIngredientTotals({ name, quantity }) {
  const ref = refByName.get(name)
  if (!ref || !Number.isFinite(quantity)) {
    return { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
  }
  const factor = quantity / 100
  return {
    kcal: ref.per100.kcal * factor,
    protein_g: ref.per100.protein_g * factor,
    fat_g: ref.per100.fat_g * factor,
    carbs_g: ref.per100.carbs_g * factor,
  }
}

export function calcMealTotals(ingredients) {
  const totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
  for (const ingredient of ingredients) {
    const partial = calcIngredientTotals(ingredient)
    totals.kcal += partial.kcal
    totals.protein_g += partial.protein_g
    totals.fat_g += partial.fat_g
    totals.carbs_g += partial.carbs_g
  }
  return {
    kcal: Math.round(totals.kcal),
    protein_g: round1(totals.protein_g),
    fat_g: round1(totals.fat_g),
    carbs_g: round1(totals.carbs_g),
  }
}

function round1(value) {
  return Math.round(value * 10) / 10
}
