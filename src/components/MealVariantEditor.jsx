import { useMemo, useState } from 'react'
import ingredientsRef from '../data/ingredients-ref.json'
import { calcMealTotals, findIngredientRef } from '../lib/nutrition-calc'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../lib/storage'
import { EditIcon } from '../icons/EditIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { TrashIcon } from '../icons/TrashIcon'
import { XIcon } from '../icons/XIcon'

function emptyForm() {
  return {
    id: null,
    meal_type: MEAL_TYPES[0],
    variant_label: '',
    ingredients: [{ name: ingredientsRef[0].name, quantity: 100, unit: ingredientsRef[0].unit }],
    active: true,
  }
}

export function MealVariantEditor({ meals, onSave, onDelete, onToggleActive }) {
  const [form, setForm] = useState(null)

  const totals = useMemo(() => (form ? calcMealTotals(form.ingredients) : null), [form])

  function startNew() {
    setForm(emptyForm())
  }

  function startEdit(meal) {
    setForm({
      id: meal.id,
      meal_type: meal.meal_type,
      variant_label: meal.variant_label,
      ingredients: meal.ingredients.map((i) => ({ ...i })),
      active: meal.active,
    })
  }

  function updateIngredient(index, patch) {
    setForm((prev) => {
      const ingredients = prev.ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing))
      return { ...prev, ingredients }
    })
  }

  function addIngredientRow() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: ingredientsRef[0].name, quantity: 100, unit: ingredientsRef[0].unit }],
    }))
  }

  function removeIngredientRow(index) {
    setForm((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))
  }

  function handleIngredientNameChange(index, name) {
    const ref = findIngredientRef(name)
    updateIngredient(index, { name, unit: ref?.unit ?? 'g' })
  }

  function handleSave() {
    if (!form.variant_label.trim() || form.ingredients.length === 0) return
    const computed = calcMealTotals(form.ingredients)
    onSave({
      id: form.id ?? `meal-${Date.now()}`,
      meal_type: form.meal_type,
      variant_label: form.variant_label.trim(),
      ingredients: form.ingredients,
      active: form.active,
      ...computed,
    })
    setForm(null)
  }

  return (
    <section className="card variant-editor">
      <div className="variant-editor-header">
        <h2>Varianti pasto</h2>
        {!form && (
          <button className="btn btn-plan" onClick={startNew}>
            <PlusIcon size={16} />
            Nuova variante
          </button>
        )}
      </div>

      {!form && (
        <div className="variant-list">
          {MEAL_TYPES.map((mealType) => {
            const variants = meals.filter((m) => m.meal_type === mealType)
            if (variants.length === 0) return null
            return (
              <div key={mealType} className="variant-group">
                <h3>{MEAL_TYPE_LABELS[mealType]}</h3>
                <ul>
                  {variants.map((meal) => (
                    <li key={meal.id} className={meal.active ? '' : 'is-inactive'}>
                      <div className="variant-row-main">
                        <span className="variant-label-chip">{meal.variant_label}</span>
                        <span className="num">{meal.kcal} kcal</span>
                        <span className="num text-secondary">
                          P {meal.protein_g}g · G {meal.fat_g}g · C {meal.carbs_g}g
                        </span>
                      </div>
                      <div className="variant-row-actions">
                        <button className="icon-button" onClick={() => onToggleActive(meal.id)} title={meal.active ? 'Disattiva' : 'Attiva'}>
                          {meal.active ? <XIcon size={16} /> : <PlusIcon size={16} />}
                        </button>
                        <button className="icon-button" onClick={() => startEdit(meal)} title="Modifica">
                          <EditIcon size={16} />
                        </button>
                        <button className="icon-button" onClick={() => onDelete(meal.id)} title="Elimina">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {form && (
        <div className="variant-form">
          <div className="field-row">
            <label className="field">
              <span>Tipo pasto</span>
              <select value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value })}>
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MEAL_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Label variante</span>
              <input
                type="text"
                value={form.variant_label}
                onChange={(e) => setForm({ ...form, variant_label: e.target.value })}
                placeholder="es. A, B, C..."
              />
            </label>
          </div>

          <div className="ingredient-rows">
            {form.ingredients.map((ing, index) => (
              <div key={index} className="ingredient-row">
                <select value={ing.name} onChange={(e) => handleIngredientNameChange(index, e.target.value)}>
                  {ingredientsRef.map((ref) => (
                    <option key={ref.name} value={ref.name}>
                      {ref.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  className="ingredient-qty"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(index, { quantity: Number(e.target.value) })}
                />
                <span className="text-secondary">{ing.unit}</span>
                <button className="icon-button" onClick={() => removeIngredientRow(index)} title="Rimuovi ingrediente">
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-small" onClick={addIngredientRow}>
              <PlusIcon size={14} />
              Aggiungi ingrediente
            </button>
          </div>

          {totals && (
            <div className="variant-form-totals num">
              {totals.kcal} kcal · P {totals.protein_g}g · G {totals.fat_g}g · C {totals.carbs_g}g
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setForm(null)}>
              Annulla
            </button>
            <button className="btn btn-plan" onClick={handleSave}>
              Salva variante
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
